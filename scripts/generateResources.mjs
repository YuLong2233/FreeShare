
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';

const RESOURCES_DIR = './resources';
const OUTPUT_FILE = './data/resources.ts';
const PUBLIC_IMAGES_DIR = './public/images';

// ─── 确保目录存在 ─────────────────────────────────────
if (!fs.existsSync(RESOURCES_DIR)) fs.mkdirSync(RESOURCES_DIR, { recursive: true });
if (!fs.existsSync(PUBLIC_IMAGES_DIR)) fs.mkdirSync(PUBLIC_IMAGES_DIR, { recursive: true });

// ─── 工具：判断是否为网络 URL ────────────────────────
const isUrl = (str) => /^https?:\/\//i.test(str);

// ─── 工具：判断是否已是正确的 /images/ 公开路径 ─────
const isPublicPath = (str) => str.startsWith('/images/');

// ─── 工具：从路径或 URL 获取后缀名 ──────────────────
const getExtension = (input, fallback = '.png') => {
  try {
    const ext = path.extname(input).toLowerCase();
    return ext || fallback;
  } catch {
    return fallback;
  }
};

// ─── 核心：下载网络图片 ──────────────────────────────
const downloadImage = async (url, destPath) => {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    await pipeline(res.body, createWriteStream(destPath));
    return true;
  } catch (e) {
    console.warn(`  ⚠️  下载失败 [${url}]: ${e.message}，将保留原始链接`);
    return false;
  }
};

// ─── 核心：复制本地图片 ──────────────────────────────
const copyLocalImage = (srcPath, destPath) => {
  try {
    if (!fs.existsSync(srcPath)) {
      console.warn(`  ⚠️  本地文件不存在 [${srcPath}]，将跳过`);
      return false;
    }
    fs.copyFileSync(srcPath, destPath);
    return true;
  } catch (e) {
    console.warn(`  ⚠️  复制失败 [${srcPath}]: ${e.message}，将跳过`);
    return false;
  }
};

const processImage = async (imgRef, resourceSlug, idx, resourceFilePath) => {
  // 如果已经是 /images/ 公开路径，直接跳过
  if (isPublicPath(imgRef)) return imgRef;

  // 为当前资源创建专属子目录
  const subDir = path.join(PUBLIC_IMAGES_DIR, resourceSlug);
  if (!fs.existsSync(subDir)) fs.mkdirSync(subDir, { recursive: true });

  if (isUrl(imgRef)) {
    // 处理网络图片
    const urlObj = new URL(imgRef);
    const ext = getExtension(urlObj.pathname, '.jpg'); // 网络图片常无后缀，默认用 .jpg
    const filename = `img_${idx}${ext}`;
    const destPath = path.join(subDir, filename);
    console.log(`  📥 下载图片: ${imgRef}`);
    const success = await downloadImage(imgRef, destPath);
    return success ? `/images/${resourceSlug}/${filename}` : imgRef;
  } else {
    // 处理本地图片
    let srcPath = imgRef;
    if (!path.isAbsolute(imgRef)) {
      srcPath = path.resolve(path.dirname(resourceFilePath), imgRef);
    }
    const ext = getExtension(srcPath, '.png');
    const filename = `img_${idx}${ext}`;
    const destPath = path.join(subDir, filename);
    console.log(`  📂 复制本地图片: ${srcPath}`);
    const success = copyLocalImage(srcPath, destPath);
    return success ? `/images/${resourceSlug}/${filename}` : imgRef;
  }
};

// ─── 核心：处理 Markdown 正文中的 ![...](url) 图片引用 ─
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

    // 以文件名（去掉 .md）作为资源的 slug，用于子目录名
    const resourceSlug = path.basename(item.file, '.md');
    console.log(`\n🔍 正在处理: [${item.file}]`);

    // ── 1. 处理 gallery 中的图片 ──────────────────────
    let imgIdx = 0;
    const newGallery = [];
    if (Array.isArray(item.data.gallery)) {
      for (const imgRef of item.data.gallery) {
        const newPath = await processImage(imgRef, resourceSlug, imgIdx++, item.filePath);
        newGallery.push(newPath);
      }
    }

    // ── 2. 处理正文 Markdown 中的图片 ─────────────────
    const { content: processedContent, nextIdx } = await processMarkdownImages(
      item.content,
      resourceSlug,
      item.filePath,
      imgIdx
    );

    // ── 3. 转换 Markdown 正文为 HTML ──────────────────
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
 * 图片资源（网络URL或本地路径）将自动下载/复制到 public/images/{资源名}/ 目录下
 */
import { Resource } from '../types';

export const RESOURCES: Resource[] = ${JSON.stringify(processedResources, null, 2)};
`;

  fs.writeFileSync(OUTPUT_FILE, tsContent, 'utf8');
  console.log(`\n✅ 成功！已同步 ${processedResources.length} 个资源到 ${OUTPUT_FILE}`);
};

generate();
