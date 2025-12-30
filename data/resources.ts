
import { Resource } from '../types';

export const RESOURCES: Resource[] = [
  {
    id: 1,
    title: "VS Code Pro 专业配置包",
    desc: "完整的 Web 开发设置，包含核心扩展插件和主题配置，一键导入。",
    category: "开发工具",
    date: "2024-05-20",
    tags: ["编辑器", "配置", "前端开发"],
    links: [
      { name: "主下载链接", url: "https://pan.baidu.com/s/vscode1", code: "dev1" },
      { name: "备用链接", url: "https://pan.quark.cn/s/vscode_bak" }
    ],
    gallery: [
      "https://picsum.photos/seed/vscode1/800/450",
      "https://picsum.photos/seed/vscode2/800/450"
    ],
    detailHtml: `
      <h3>简介</h3>
      <p>这套配置是我多年开发经验的结晶。它不仅让你的编辑器看起来更专业，还能显著提高编码效率。</p>
      <h3>包含内容</h3>
      <ul>
        <li>精选 20+ 核心插件（代码检查、AI 辅助、Git 增强等）</li>
        <li>定制化字体：Fira Code + Operator Mono 混合配置</li>
        <li>极简暗黑主题配置，保护视力</li>
      </ul>
      <h3>安装方法</h3>
      <ol>
        <li>下载并解压配置包。</li>
        <li>将 <code>settings.json</code> 覆盖你原有的 VS Code 设置。</li>
        <li>运行附带的 <code>install_extensions.sh</code> 脚本自动安装所有插件。</li>
      </ol>
    `
  },
  {
    id: 2,
    title: "Adobe Creative Cloud 2024 全家桶 (Mac/Win)",
    desc: "为设计师和创意专业人士准备的预激活版套件。",
    category: "办公软件",
    date: "2024-05-18",
    tags: ["设计", "Adobe", "图形处理"],
    links: [
      { name: "直连下载", url: "https://share.weiyun.com/adobe2024", code: "8888" }
    ],
    gallery: [
      "https://picsum.photos/seed/adobe1/800/450"
    ],
    detailHtml: `
      <h3>版本说明</h3>
      <p>此版本为 2024 最新稳定版，支持中文，解压即用，无需额外激活步骤。</p>
      <h3>使用技巧</h3>
      <p>安装前请确保关闭所有防病毒软件，并卸载旧版本的 Creative Cloud 组件，以免产生冲突。</p>
    `
  },
  {
    id: 3,
    title: "精通 React 18 & Three.js 视频教程",
    desc: "全套视频课程，涵盖高级 3D 网页动画和 React 性能优化。",
    category: "视频课程",
    date: "2024-05-15",
    tags: ["教育", "React", "Three.js"],
    links: [
      { name: "百度网盘", url: "https://pan.baidu.com/s/react_course", code: "v233" }
    ],
    gallery: [
      "https://picsum.photos/seed/course1/800/450",
      "https://picsum.photos/seed/course2/800/450",
      "https://picsum.photos/seed/course3/800/450"
    ],
    detailHtml: `
      <h3>课程大纲</h3>
      <ul>
        <li>第一章：React 18 Concurrent Mode 深度解析</li>
        <li>第二章：Three.js 基础：场景、相机与渲染器</li>
        <li>第三章：React-Three-Fiber 最佳实践</li>
        <li>第四章：实战项目：打造个人 3D 互动简历</li>
      </ul>
      <h3>适用人群</h3>
      <p>具有 React 基础，希望进阶前端可视化领域的开发者。</p>
    `
  },
  {
    id: 4,
    title: "微服务架构 Postman API 集合",
    desc: "标准化的 API 测试套件，适用于企业级微服务架构。",
    category: "开发工具",
    date: "2024-05-10",
    tags: ["后端", "测试", "API"],
    links: [
      { name: "点击下载", url: "https://github.com/example/postman-collections" }
    ],
    detailHtml: `
      <h3>使用指南</h3>
      <p>导入此集合后，请在 Postman 环境管理中设置 <code>{{base_url}}</code> 变量即可开始测试。</p>
    `
  },
  {
    id: 5,
    title: "Sketch Pro 进阶资源包",
    desc: "包含精品 UI 套件、原型图和 Sketch 设计组件库。",
    category: "设计资源",
    date: "2024-05-01",
    tags: ["UI/UX", "Sketch", "素材"],
    links: [
      { name: "素材包 1", url: "https://pan.baidu.com/s/sketch_kit1", code: "uiui" },
      { name: "素材包 2", url: "https://pan.baidu.com/s/sketch_kit2" }
    ],
    gallery: [
      "https://picsum.photos/seed/sketch/800/450"
    ],
    detailHtml: `
      <h3>资源清单</h3>
      <p>包含 15 个精心设计的移动端应用页面原型，以及 50+ 常用 UI 符号组件。</p>
    `
  }
];
