# FreeShare Pro - 精品资源分享门户

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adobe2-6e31a0763ed6" />
</div>

## 📌 项目概述

**FreeShare Pro** 是一个基于现代 Web 技术栈构建的精品资源发现与分享平台。本项目旨在提供一个高效、纯洁的资源枢纽，涵盖软件工具、影音资源、技术文档等内容。通过 **AI 智能搜索** 和 **自动化内容同步** 机制，为用户提供极致的资源获取体验。

---

## 🚀 核心特性

- **✨ 精选资源库**：拒绝垃圾广告，所有资源经过人工严格审核与实测验证。
- **🤖 AI 智能检索**：集成 Google Gemini API (model: gemini-3-flash-preview)，支持语义化搜索，精准匹配用户需求。
- **📝 文档化管理 (CMS-like)**：采用 Markdown 作为内容源，实现“内容即代码”的高效管理模式。
- **⚡ 极致性能**：基于 React 19 和 Vite 6 构建，配合响应式设计，实现秒级加载与全端适配。
- **🔄 自动化同步 (CI/CD)**：通过 GitHub Actions 实现从 Markdown 到 TypeScript 数据的自动解析、ID 分配与同步。

---

## 🛠 技术栈

| 领域 | 选型 | 说明 |
| :--- | :--- | :--- |
| **核心框架** | React 19 | 现代、高效的 UI 开发框架 |
| **构建工具** | Vite 6 | 下一代前端构建工具，极速 HMR |
| **编程语言** | TypeScript 5 | 强类型支持，提升工程健壮性 |
| **样式方案** | Tailwind CSS | 采用 CDN 引入，实现灵活的响应式布局 |
| **路由管理** | React Router 7 | 支持嵌套路由与 Hash 导航 |
| **AI 能力** | Google Gemini | 提供语义化资源推荐与智能过滤逻辑 |
| **内容解析** | Gray-Matter / Marked | 解析 Markdown 元数据与内容转换 |
| **自动化** | GitHub Actions | 持续集成与资源自动同步流程 |

---

## 📂 项目结构

```text
FreeShare/
├── .github/workflows/       # GitHub Actions 自动化流程定义
├── components/              # 可复用 React 组件 (如 ResourceCard)
├── data/                    # 自动生成的静态资源库 (resources.ts)
├── resources/               # 原始 Markdown 资源文件 (内容创作区)
├── scripts/                 # 自动化脚本 (generateResources.mjs)
├── services/                # API 服务封装 (Gemini AI 搜索逻辑)
├── types.ts                 # 全局基础类型定义
├── App.tsx                  # 核心路由配置与页面逻辑
├── vite.config.ts           # Vite 工程配置
└── package.json             # 项目依赖与自动化指令集
```

---

## 🔧 开发与运行指南

### 1. 环境准备
- **Node.js**: 建议版本 18.x 或更高。
- **API Key**: 需准备 Google Gemini API Key。

### 2. 本地启动
1. **安装依赖**:
   ```bash
   npm install
   ```
2. **配置环境变量**:
   在根目录创建 `.env.local` 文件：
   ```env
   GEMINI_API_KEY=你的_GEMINI_API密钥
   ```
3. **启动开发服务器**:
   ```bash
   npm run dev
   ```
   访问 `http://localhost:5173`。

---

## 📦 内容更新流程 (CMS 使用说明)

本项目采用“Markdown 驱动”的内容管理模式：

1. **新增资源**: 在 `/resources` 目录下创建 `.md` 文件。
2. **配置 Front-matter**: 在文件开头定义资源属性：
   ```yaml
   ---
   title: "资源名称"
   desc: "一句话描述"
   category: "所属分类"
   date: "2024-05-30"
   tags: ["标签1", "标签2"]
   links:
     - name: "主站下载"
       url: "https://..."
       code: "提取码"
   ---
   ## 详细介绍
   此处编写 Markdown 内容...
   ```
3. **同步数据**: 运行脚本将 MD 转换为前端可读取的 TS 状态：
   ```bash
   npm run gen
   ```

---

## 🚢 自动化运维 (CI/CD)

项目已配置 GitHub Actions (`generate-resources.yml`)。每当有新的 Markdown 文件推送到 `main` 分支时，系统会自动执行以下操作：
- 运行同步脚本。
- **自动分配缺失的资源 ID**。
- 自动将生成的 `data/resources.ts` 提交回仓库。

---

## ⚠️ 版权与免责声明
本平台旨在分享精品内容。所有资源仅供交流学习，请在下载后 24 小时内删除。如涉及侵权请联系，我们将立即处理。

---
*Generated with 🖤 by Antigravity AI Assistant.*
