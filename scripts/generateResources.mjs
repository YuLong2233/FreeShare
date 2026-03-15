
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import dotenv from 'dotenv';

// 加载本地环境变量
dotenv.config({ path: '.env.local' });

const RESOURCES_DIR = './resources';
const OUTPUT_LIST_FILE = './data/resources-list.ts'; // 轻量列表文件
const DETAILS_DIR = './public/data/details';           // 详情 JSON 目录
const SEO_PAGES_DIR = './public/resource';             // 预渲染 SEO 页面目录
const SITE_URL = 'https://freeshare.uk';               // 网站域名（用于 sitemap 和 canonical）

// GitHub 配置
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER || 'YuLong2233';
const GITHUB_REPO = process.env.GITHUB_REPO || 'FreeShare';
const RELEASE_TAG = 'media';

// CLI 参数解析
const ARGS = process.argv.slice(2);
const CLEAN_MODE = ARGS.includes('--clean');

// 确保目录存在
const OUTPUT_DIR = path.dirname(OUTPUT_LIST_FILE); // './data'
if (!fs.existsSync(RESOURCES_DIR)) fs.mkdirSync(RESOURCES_DIR, { recursive: true });
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
if (!fs.existsSync(DETAILS_DIR)) fs.mkdirSync(DETAILS_DIR, { recursive: true });

// ─── 工具函数 ────────────────────────────────────────
const isUrl = (str) => /^https?:\/\//i.test(str);
const isPublicPath = (str) => str.startsWith('/images/');

const getExtension = (input, fallback = '.png') => {
  try {
    const ext = path.extname(input).toLowerCase();
    return ext || fallback;
  } catch {
    return fallback;
  }
};

// ─── GitHub Release 管理 ─────────────────────────────
let releaseId = null;
let existingAssets = [];

const githubHeaders = () => ({
  'Authorization': `Bearer ${GITHUB_TOKEN}`,
  'Accept': 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28'
});

const getOrCreateRelease = async () => {
  if (!GITHUB_TOKEN) {
    console.warn('⚠️  未配置 GITHUB_TOKEN，本地图片将保留原始路径');
    return null;
  }

  // 尝试查找已有 Release
  try {
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/tags/${RELEASE_TAG}`,
      { headers: githubHeaders() }
    );
    if (res.ok) {
      const data = await res.json();
      releaseId = data.id;

      // 🚨 获取所有资产（处理分页）
      let allAssets = [];
      let page = 1;
      while (true) {
        const assetsRes = await fetch(
          `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/${releaseId}/assets?per_page=100&page=${page}`,
          { headers: githubHeaders() }
        );
        if (assetsRes.ok) {
          const pageAssets = await assetsRes.json();
          if (pageAssets.length === 0) break;
          allAssets = allAssets.concat(pageAssets);
          page++;
        } else break;
      }
      existingAssets = allAssets;
      console.log(`📦 已找到 Release [${RELEASE_TAG}]，ID: ${releaseId}，现有资产: ${existingAssets.length} 个`);
      return releaseId;
    }
  } catch (e) {
    // Release 不存在，继续创建
  }

  // 创建新 Release
  try {
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases`,
      {
        method: 'POST',
        headers: { ...githubHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tag_name: RELEASE_TAG,
          name: 'Media Assets - 图片资源托管',
          body: '此 Release 由脚本自动创建，用于托管资源图片。请勿手动删除。',
          draft: false,
          prerelease: false
        })
      }
    );
    if (res.ok) {
      const data = await res.json();
      releaseId = data.id;
      existingAssets = [];
      console.log(`✨ 已创建新 Release [${RELEASE_TAG}]，ID: ${releaseId}`);
      return releaseId;
    } else {
      const err = await res.text();
      console.error(`❌ 创建 Release 失败: ${err}`);
      return null;
    }
  } catch (e) {
    console.error(`❌ 创建 Release 异常: ${e.message}`);
    return null;
  }
};

// ─── 上传图片到 GitHub Release Assets ────────────────
const uploadToGitHub = async (localPath, assetName) => {
  if (!releaseId || !GITHUB_TOKEN) return null;

  // 检查是否已存在同名资产（避免重复上传）
  const existing = existingAssets.find(a => a.name === assetName);
  if (existing) {
    console.log(`  ♻️  图片已存在，复用: ${assetName}`);
    return existing.browser_download_url;
  }

  try {
    const fileBuffer = fs.readFileSync(localPath);
    const ext = getExtension(assetName);
    const contentType = ext === '.png' ? 'image/png'
      : ext === '.webp' ? 'image/webp'
        : ext === '.gif' ? 'image/gif'
          : ext === '.svg' ? 'image/svg+xml'
            : 'image/jpeg';

    const uploadUrl = `https://uploads.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/${releaseId}/assets?name=${encodeURIComponent(assetName)}`;

    const res = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Content-Type': contentType,
        'Content-Length': fileBuffer.length.toString(),
        'X-GitHub-Api-Version': '2022-11-28'
      },
      body: fileBuffer
    });

    if (res.ok) {
      const data = await res.json();
      existingAssets.push(data); // 缓存，避免后续重复查询
      console.log(`  ✅ 上传成功: ${assetName} → ${data.browser_download_url}`);
      return data.browser_download_url;
    } else {
      const errText = await res.text();
      // 🚨 如果 GitHub 返回已存在，尝试从现有列表中找回它的 URL（有时缓存失效可能导致此情况）
      if (errText.includes('already_exists')) {
        console.log(`  ♻️  GitHub 反馈已存在: ${assetName}，正在尝试修复引用...`);
        // 重新抓取一次资产列表确保最新
        const refreshRes = await fetch(
          `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/${releaseId}/assets?per_page=100`,
          { headers: githubHeaders() }
        );
        if (refreshRes.ok) {
          const latestAssets = await refreshRes.json();
          const found = latestAssets.find(a => a.name === assetName);
          if (found) {
            existingAssets.push(found);
            return found.browser_download_url;
          }
        }
      }
      console.warn(`  ⚠️  上传失败 [${assetName}]: ${errText}`);
      return null;
    }
  } catch (e) {
    console.warn(`  ⚠️  上传异常 [${assetName}]: ${e.message}`);
    return null;
  }
};

// ─── 核心：处理单个图片引用 ──────────────────────────
const processImage = async (imgRef, resourceSlug, idx, resourceFilePath) => {
  // 网络 URL → 直接保留
  if (isUrl(imgRef)) return imgRef;
  // 已是 /images/ 公开路径 → 直接保留
  if (isPublicPath(imgRef)) return imgRef;

  // 本地路径 → 上传到 GitHub Release Assets
  let srcPath = imgRef;
  if (!path.isAbsolute(imgRef)) {
    srcPath = path.resolve(path.dirname(resourceFilePath), imgRef);
  }

  if (!fs.existsSync(srcPath)) {
    console.warn(`  ⚠️  本地文件不存在 [${srcPath}]，保留原始引用`);
    return imgRef;
  }

  const ext = getExtension(srcPath, '.png');
  // 🚨 清洗 slug，去掉非 ASCII 字符，避免 GitHub CDN 链接中文字符丢失导致的同步失效
  const safeSlug = resourceSlug.replace(/[^\x00-\x7F]/g, '').replace(/\s+/g, '_') || 'img';
  const assetName = `${safeSlug}_img_${idx}${ext}`;
  console.log(`  📂 准备上传本地图片: ${srcPath}`);

  const cdnUrl = await uploadToGitHub(srcPath, assetName);
  return cdnUrl || imgRef; // 上传失败时保留原始路径
};

// ─── 核心：处理 Markdown 正文中的 ![...](url) 图片 ──
const processMarkdownImages = async (content, resourceSlug, resourceFilePath, startIdx) => {
  const imgRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let idx = startIdx;
  let newContent = content;
  const matches = [...content.matchAll(imgRegex)];

  for (const match of matches) {
    const [fullMatch, alt, src] = match;
    const newSrc = await processImage(src.trim(), resourceSlug, idx++, resourceFilePath);
    newContent = newContent.replace(fullMatch, `![${alt}](${newSrc})`);
  }
  return { content: newContent, nextIdx: idx };
};

// ─── SEO：转义 HTML 特殊字符 ─────────────────────────
const escHtml = (str = '') => String(str)
  .replace(/&/g, '&amp;')
  .replace(/"/g, '&quot;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');

// ─── SEO：生成每个资源的独立 HTML 页面 ───────────────
const generateSEOPages = (resources) => {
  if (!fs.existsSync(SEO_PAGES_DIR)) fs.mkdirSync(SEO_PAGES_DIR, { recursive: true });

  for (const res of resources) {
    const pageDir = path.join(SEO_PAGES_DIR, String(res.id));
    if (!fs.existsSync(pageDir)) fs.mkdirSync(pageDir, { recursive: true });

    const canonicalUrl = `${SITE_URL}/resource/${res.id}/`;
    const firstImage = res.gallery[0] || '';
    const keywords = [...res.tags, res.category, 'FreeShare', '免费下载', '资源分享'].join(',');

    const galleryHtml = res.gallery.length > 0
      ? res.gallery.map(img => `<img src="${escHtml(img)}" alt="${escHtml(res.title)}" loading="lazy" style="width:100%;border-radius:12px;margin-bottom:12px;">`).join('\n')
      : '';

    const linksHtml = res.links.map(link => `
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin-bottom:12px;">
        <div style="font-weight:600;margin-bottom:8px;color:#334155;">${escHtml(link.name)}</div>
        ${link.code ? `<div style="font-family:monospace;background:#e0e7ff;color:#3730a3;padding:6px 10px;border-radius:6px;display:inline-block;margin-bottom:8px;font-size:13px;">提取码：${escHtml(link.code)}</div>` : ''}
        <div><a href="${escHtml(link.url)}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:#4f46e5;color:#fff;padding:8px 18px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">立即下载 ↗</a></div>
      </div>`).join('\n');

    const tagsHtml = res.tags.length > 0
      ? res.tags.map(t => `<span style="font-size:11px;background:#f1f5f9;color:#64748b;padding:2px 8px;border-radius:4px;font-weight:700;">#${escHtml(t)}</span>`).join(' ')
      : '';

    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escHtml(res.title)} - FreeShare Pro</title>
  <meta name="description" content="${escHtml(res.desc)}">
  <meta name="keywords" content="${escHtml(keywords)}">
  <meta property="og:title" content="${escHtml(res.title)} - FreeShare Pro">
  <meta property="og:description" content="${escHtml(res.desc)}">
  ${firstImage ? `<meta property="og:image" content="${escHtml(firstImage)}">` : ''}
  <meta property="og:type" content="article">
  <meta property="og:url" content="${canonicalUrl}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="canonical" href="${canonicalUrl}">
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f8fafc;color:#1e293b;line-height:1.6}
    a{color:#4f46e5}
    nav{background:#fff;border-bottom:1px solid #e2e8f0;padding:0 24px;display:flex;align-items:center;justify-content:space-between;height:64px;position:sticky;top:0;z-index:10}
    .logo{font-size:20px;font-weight:900;color:#1e293b;text-decoration:none;display:flex;align-items:center;gap:8px}
    .logo-icon{width:32px;height:32px;background:#4f46e5;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:16px}
    .nav-links{display:flex;gap:24px}
    .nav-links a{text-decoration:none;color:#64748b;font-weight:600;font-size:14px}
    .nav-links a:hover{color:#4f46e5}
    main{max-width:960px;margin:0 auto;padding:40px 24px}
    .badge{display:inline-block;background:#eef2ff;color:#4f46e5;padding:3px 12px;border-radius:99px;font-size:12px;font-weight:700;margin-bottom:16px}
    h1{font-size:clamp(24px,4vw,36px);font-weight:900;line-height:1.2;margin-bottom:12px}
    .desc{font-size:17px;color:#475569;margin-bottom:20px}
    .meta{display:flex;gap:16px;font-size:13px;color:#94a3b8;margin-bottom:28px;align-items:center;flex-wrap:wrap}
    .grid{display:grid;grid-template-columns:1fr;gap:32px}
    @media(min-width:720px){.grid{grid-template-columns:1fr 320px}}
    .card{background:#fff;border-radius:16px;border:1px solid #e2e8f0;padding:24px}
    .card h2{font-size:16px;font-weight:700;margin-bottom:16px;color:#1e293b}
    .get-card{background:#4f46e5;border-radius:16px;padding:24px;color:#fff}
    .get-card h2{font-size:16px;font-weight:700;margin-bottom:16px;color:#fff}
    footer{text-align:center;padding:40px 24px;color:#94a3b8;font-size:13px;border-top:1px solid #e2e8f0;margin-top:60px}
  </style>
</head>
<body>
  <nav>
    <a href="${SITE_URL}" class="logo">
      <div class="logo-icon">⚡</div>
      FreeShare
    </a>
    <div class="nav-links">
      <a href="${SITE_URL}/">首页</a>
      <a href="${SITE_URL}/downloads">资源库</a>
      <a href="${SITE_URL}/guide">使用指南</a>
    </div>
  </nav>

  <main>
    <span class="badge">${escHtml(res.category)}</span>
    <h1>${escHtml(res.title)}</h1>
    <p class="desc">${escHtml(res.desc)}</p>
    <div class="meta">
      <span>📅 ${escHtml(res.date)}</span>
      ${tagsHtml}
    </div>

    <div class="grid">
      <div>
        ${galleryHtml ? `<div class="card" style="margin-bottom:24px;"><h2>展示截图</h2>${galleryHtml}</div>` : ''}
        <div class="card">
          <h2>详细介绍 &amp; 使用指南</h2>
          <div style="line-height:1.8;color:#334155;">${res.detailHtml}</div>
        </div>
      </div>

      <div>
        <div class="get-card" style="position:sticky;top:80px;">
          <h2>获取资源</h2>
          ${linksHtml}
          <div style="margin-top:20px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.2);font-size:12px;opacity:0.7;text-align:center;">
            最后更新：${escHtml(res.date)}
          </div>
        </div>
      </div>
    </div>
  </main>

  <footer>
    <p>&copy; ${new Date().getFullYear()} <a href="${SITE_URL}">FreeShare Pro</a> · 精心打磨的开发者资源门户</p>
  </footer>
</body>
</html>`;

    fs.writeFileSync(path.join(pageDir, 'index.html'), html, 'utf8');
  }
  console.log(`  📄 已生成 ${resources.length} 个 SEO 页面 → ${SEO_PAGES_DIR}/{id}/index.html`);
};

// ─── SEO：生成 sitemap.xml ───────────────────────────
const generateSitemap = (resources) => {
  const staticUrls = [
    { loc: `${SITE_URL}/`, priority: '1.0', changefreq: 'daily' },
    { loc: `${SITE_URL}/downloads`, priority: '0.9', changefreq: 'daily' },
    { loc: `${SITE_URL}/guide`, priority: '0.5', changefreq: 'monthly' },
  ];
  const resourceUrls = resources.map(res => ({
    loc: `${SITE_URL}/resource/${res.id}/`,
    lastmod: res.date,
    priority: '0.8',
    changefreq: 'weekly',
  }));

  const toTag = ({ loc, lastmod, priority, changefreq }) =>
    `  <url>\n    <loc>${loc}</loc>\n${lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : ''}    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...staticUrls, ...resourceUrls].map(toTag).join('\n')}\n</urlset>`;

  fs.writeFileSync('./public/sitemap.xml', sitemap, 'utf8');
  console.log(`  🗺️  sitemap.xml 已生成（${staticUrls.length + resourceUrls.length} 条 URL）`);
};

// ─── 主流程 ──────────────────────────────────────────
const generate = async () => {
  console.log('🚀 开始资源同步...\n');

  // 初始化 GitHub Release
  await getOrCreateRelease();

  const files = fs.readdirSync(RESOURCES_DIR).filter(f => f.endsWith('.md'));

  let fileItems = files.map(file => {
    const filePath = path.join(RESOURCES_DIR, file);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContent);
    return { file, filePath, data, content };
  });

  // 自动分配 ID
  let maxId = 0;
  fileItems.forEach(item => {
    if (item.data.id && typeof item.data.id === 'number') {
      maxId = Math.max(maxId, item.data.id);
    }
  });

  let nextId = maxId + 1;

  const processedResources = await Promise.all(fileItems.map(async item => {
    let currentId = item.data.id;

    if (!currentId) {
      currentId = nextId++;
      item.data.id = currentId;
      const newFileContent = matter.stringify(item.content, item.data);
      fs.writeFileSync(item.filePath, newFileContent, 'utf8');
      console.log(`✨ 已为 [${item.file}] 自动分配新 ID: ${currentId}`);
    }

    const resourceSlug = path.basename(item.file, '.md');
    console.log(`\n🔍 正在处理: [${item.file}]`);

    // 1. 处理 gallery 中的图片
    let imgIdx = 0;
    const newGallery = [];
    if (Array.isArray(item.data.gallery)) {
      for (const imgRef of item.data.gallery) {
        if (typeof imgRef === 'string') {
          const newPath = await processImage(imgRef, resourceSlug, imgIdx++, item.filePath);
          newGallery.push(newPath);
        }
      }
    }

    // 2. 处理正文 Markdown 中的图片
    const { content: processedContent } = await processMarkdownImages(
      item.content, resourceSlug, item.filePath, imgIdx
    );

    // 3. 回写 .md 文件：将本地路径永久替换为 CDN 地址
    const galleryChanged = JSON.stringify(item.data.gallery) !== JSON.stringify(newGallery);
    const contentChanged = item.content !== processedContent;
    if (galleryChanged || contentChanged) {
      item.data.gallery = newGallery;
      const updatedMd = matter.stringify(processedContent, item.data);
      fs.writeFileSync(item.filePath, updatedMd, 'utf8');
      console.log(`  📝 已回写 .md 文件，本地路径已替换为 CDN 地址`);
    }

    // 4. 转换 Markdown 正文为 HTML
    const detailHtml = await marked.parse(processedContent);

    return {
      id: currentId,
      title: item.data.title || '未命名资源',
      desc: item.data.desc || '',
      category: item.data.category || '未分类',
      date: item.data.date || new Date().toISOString().split('T')[0],
      tags: item.data.tags || [],
      links: item.data.links || [],
      gallery: newGallery,
      detailHtml: detailHtml.trim()   // 临时保留，输出时会分离
    };
  }));

  // 按日期降序排序
  processedResources.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // ── 1. 生成轻量列表文件（不含 detailHtml）─────────────
  const listData = processedResources.map(({ detailHtml, ...rest }) => rest);
  const listTsContent = `
/**
 * 此文件由脚本自动生成，请勿手动修改。
 * 仅含列表展示所需的轻量字段，不含 detailHtml。
 * 详情内容在 public/data/details/{id}.json 中按需加载。
 */
import { Resource } from '../types';

export const RESOURCES: Resource[] = ${JSON.stringify(listData, null, 2)};
`;
  fs.writeFileSync(OUTPUT_LIST_FILE, listTsContent, 'utf8');

  // ── 2. 为每个资源写入独立的详情 JSON 文件 ────────────
  for (const res of processedResources) {
    const detailJson = JSON.stringify({
      detailHtml: res.detailHtml,
      gallery: res.gallery
    }, null, 2);
    fs.writeFileSync(path.join(DETAILS_DIR, `${res.id}.json`), detailJson, 'utf8');
  }

  console.log(`\n✅ 成功！已同步 ${processedResources.length} 个资源`);
  console.log(`   列表文件: ${OUTPUT_LIST_FILE}`);
  console.log(`   详情文件: ${DETAILS_DIR}/{id}.json (共 ${processedResources.length} 个)`);

  // ── 3. 生成 SEO 预渲染页面 + sitemap ─────────────────
  console.log('\n🔍 正在生成 SEO 页面和 sitemap...');
  generateSEOPages(processedResources);
  generateSitemap(processedResources);

  // ── 孤儿资源清理（仅在 --clean 模式下执行）──────────
  if (CLEAN_MODE && releaseId && GITHUB_TOKEN) {
    console.log('\n🧹 正在检测孤儿图片资产...');

    // 收集所有 .md 文件中实际引用的 Release 图片文件名
    const usedAssetNames = new Set();
    const releaseUrlPrefix = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases/download/${RELEASE_TAG}/`;

    for (const res of processedResources) {
      // 从 gallery
      for (const url of res.gallery) {
        if (typeof url === 'string' && url.startsWith(releaseUrlPrefix)) {
          usedAssetNames.add(url.replace(releaseUrlPrefix, ''));
        }
      }
      // 从 detailHtml 中提取
      const htmlImgRegex = /src="([^"]*)"/g;
      let htmlMatch;
      while ((htmlMatch = htmlImgRegex.exec(res.detailHtml)) !== null) {
        const src = htmlMatch[1];
        if (src.startsWith(releaseUrlPrefix)) {
          usedAssetNames.add(src.replace(releaseUrlPrefix, ''));
        }
      }
    }

    // 刷新 Release 资产列表
    try {
      const res = await fetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/${releaseId}/assets?per_page=100`,
        { headers: githubHeaders() }
      );
      if (res.ok) {
        const allAssets = await res.json();
        const orphans = allAssets.filter(a => !usedAssetNames.has(a.name));

        if (orphans.length === 0) {
          console.log('  ✨ 没有发现孤儿资产，一切干净！');
        } else {
          console.log(`  🗑️  发现 ${orphans.length} 个孤儿资产，正在删除...`);
          for (const orphan of orphans) {
            try {
              const delRes = await fetch(
                `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/assets/${orphan.id}`,
                { method: 'DELETE', headers: githubHeaders() }
              );
              if (delRes.ok || delRes.status === 204) {
                console.log(`    ❌ 已删除: ${orphan.name} (${(orphan.size / 1024).toFixed(1)} KB)`);
              } else {
                console.warn(`    ⚠️  删除失败: ${orphan.name}`);
              }
            } catch (e) {
              console.warn(`    ⚠️  删除异常: ${orphan.name}: ${e.message}`);
            }
          }
        }
      }
    } catch (e) {
      console.warn(`  ⚠️  获取资产列表失败: ${e.message}`);
    }
  }

  // ── 显示存储空间统计 ────────────────────────────────
  if (releaseId && GITHUB_TOKEN) {
    try {
      const res = await fetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/${releaseId}/assets?per_page=100`,
        { headers: githubHeaders() }
      );
      if (res.ok) {
        const assets = await res.json();
        let totalSize = 0;
        assets.forEach(a => totalSize += a.size);
        const usedMB = (totalSize / 1024 / 1024).toFixed(2);
        const limitMB = 500;
        const percent = (totalSize / 1024 / 1024 / limitMB * 100).toFixed(1);
        const bar = '█'.repeat(Math.round(percent / 5)) + '░'.repeat(20 - Math.round(percent / 5));

        console.log(`\n📊 GitHub Release CDN 存储统计:`);
        console.log(`  文件数量: ${assets.length} 个`);
        console.log(`  已使用:   ${usedMB} MB / ${limitMB} MB (${percent}%)`);
        console.log(`  [${bar}]`);
      }
    } catch (e) {
      console.warn(`  ⚠️  获取存储统计失败: ${e.message}`);
    }
  }
};

generate();
