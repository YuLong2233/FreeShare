---
title: "多图片自动化处理测试"
desc: "这是一份用于测试脚本自动下载网络图片及自动迁移本地图片的测试文档。"
category: "技术测试"
date: "2024-06-01"
tags: ["多图测试", "自动化", "脚本"]
links:
  - name: "示例链接"
    url: "https://example.com"
gallery:
  - "https://picsum.photos/seed/gallery1/800/450.jpg"
  - "D:\wechat_download\xwechat_files\wxid_bk0ni3jweb8r22_8499\temp\InputTemp\8dfa5f0b-1b7d-41db-b08f-54f2e0690812.png"
---

### 1. 网络图片测试

![8dfa5f0b-1b7d-41db-b08f-54f2e0690812](D:\wechat_download\xwechat_files\wxid_bk0ni3jweb8r22_8499\temp\InputTemp\8dfa5f0b-1b7d-41db-b08f-54f2e0690812.png)

下面这张图片是从网络实时抓取并保存到本地 `public/images/` 目录下的：

![网络示例图](https://picsum.photos/seed/markdown1/800/450.jpg)

### 2. 本地图片测试
请将下面的路径替换为您电脑上真实的图片绝对路径。同步后，它会被自动复制到项目的静态资源目录中：

![8dfa5f0b-1b7d-41db-b08f-54f2e0690812](D:\wechat_download\xwechat_files\wxid_bk0ni3jweb8r22_8499\temp\InputTemp\8dfa5f0b-1b7d-41db-b08f-54f2e0690812.png)

### 3. 工作原理说明
运行 `npm run gen` 后：
1. 脚本会扫描此文件。
2. 发现 `http` 开头的链接会尝试 `fetch` 下载。
3. 发现本地路径会执行 `copy` 复制。
4. 所有图片都会被统一存放在 `public/images/multi-image-test/` 目录下。
5. 网页中看到的将全是本地化的路径。
