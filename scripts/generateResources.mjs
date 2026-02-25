
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import dotenv from 'dotenv';

// 加载本地环境变量
dotenv.config({ path: '.env.local' });

const RESOURCES_DIR = './resources';
const OUTPUT_FILE = './data/resources.ts';

// GitHub 配置
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER || 'YuLong2233';
const GITHUB_REPO = process.env.GITHUB_REPO || 'FreeShare';
const RELEASE_TAG = 'media';

// 确保目录存在
if (!fs.existsSync(RESOURCES_DIR)) fs.mkdirSync(RESOURCES_DIR, { recursive: true });

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
      existingAssets = data.assets || [];
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
      const err = await res.text();
      console.warn(`  ⚠️  上传失败 [${assetName}]: ${err}`);
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
  const assetName = `${resourceSlug}_img_${idx}${ext}`;
  console.log(`  � 准备上传本地图片: ${srcPath}`);

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

    // 3. 转换 Markdown 正文为 HTML
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
      detailHtml: detailHtml.trim()
    };
  }));

  // 按日期降序排序
  processedResources.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // 生成 TypeScript 文件
  const tsContent = `
/**
 * 此文件由脚本自动生成，请勿手动修改。
 * 如需更新资源，请修改 /resources 目录下的 Markdown 文件并运行 npm run gen
 * 本地图片会自动上传到 GitHub Release Assets (CDN)
 * 网络图片 (URL) 将直接保留原始链接
 */
import { Resource } from '../types';

export const RESOURCES: Resource[] = ${JSON.stringify(processedResources, null, 2)};
`;

  fs.writeFileSync(OUTPUT_FILE, tsContent, 'utf8');
  console.log(`\n✅ 成功！已同步 ${processedResources.length} 个资源到 ${OUTPUT_FILE}`);
};

generate();
