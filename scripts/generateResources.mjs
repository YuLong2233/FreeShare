
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

const RESOURCES_DIR = './resources';
const OUTPUT_FILE = './data/resources.ts';

// 确保目录存在
if (!fs.existsSync(RESOURCES_DIR)) {
  fs.mkdirSync(RESOURCES_DIR);
}

// Fixed: Changed generate to an async function to support await marked.parse
const generate = async () => {
  const files = fs.readdirSync(RESOURCES_DIR).filter(f => f.endsWith('.md'));
  
  // 1. 读取所有文件并解析初始数据
  let fileItems = files.map(file => {
    const filePath = path.join(RESOURCES_DIR, file);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContent);
    return { file, filePath, data, content };
  });

  // 2. 找出当前所有文件中已存在的最大 ID
  let maxId = 0;
  fileItems.forEach(item => {
    if (item.data.id && typeof item.data.id === 'number') {
      maxId = Math.max(maxId, item.data.id);
    }
  });

  // 3. 为缺失 ID 的文件分配新 ID 并写回文件
  let nextId = maxId + 1;
  // Fixed: Used Promise.all and an async map function to handle asynchronous marked.parse
  const processedResources = await Promise.all(fileItems.map(async item => {
    let currentId = item.data.id;
    
    // 如果没有 ID，则分配并写回
    if (!currentId) {
      currentId = nextId++;
      item.data.id = currentId;
      
      // 使用 matter.stringify 将带有新 ID 的元数据写回 .md 文件
      const newFileContent = matter.stringify(item.content, item.data);
      fs.writeFileSync(item.filePath, newFileContent, 'utf8');
      console.log(`✨ 已为 [${item.file}] 自动分配新 ID: ${currentId}`);
    }

    // 转换为 HTML
    // Fixed: Used await marked.parse() to handle potential Promise return (string | Promise<string>)
    const detailHtml = await marked.parse(item.content);

    return {
      id: currentId,
      title: item.data.title || '未命名资源',
      desc: item.data.desc || '',
      category: item.data.category || '未分类',
      date: item.data.date || new Date().toISOString().split('T')[0],
      tags: item.data.tags || [],
      links: item.data.links || [],
      gallery: item.data.gallery || [],
      detailHtml: detailHtml.trim()
    };
  }));

  // 4. 按日期降序排序
  processedResources.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // 5. 生成 TypeScript 文件
  const tsContent = `
/**
 * 此文件由脚本自动生成，请勿手动修改。
 * 如需更新资源，请修改 /resources 目录下的 Markdown 文件并运行 npm run gen
 */
import { Resource } from '../types';

export const RESOURCES: Resource[] = ${JSON.stringify(processedResources, null, 2)};
`;

  fs.writeFileSync(OUTPUT_FILE, tsContent, 'utf8');
  console.log(`✅ 成功！已同步 ${processedResources.length} 个资源到 ${OUTPUT_FILE}`);
};

generate();
