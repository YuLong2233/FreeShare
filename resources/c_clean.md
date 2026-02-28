---
title: Windows C盘深度清理工具
desc: 基于 Python 构建的现代化 C 盘深度清理工具，支持深色模式与中英双语，一键释放磁盘空间
category: 系统工具
date: '2024-02-28'
tags:
  - Windows
  - 系统清理
links:
  - name: 迅雷网盘
    url: 'https://pan.xunlei.com/s/VOmZJIW4zOBhwFsdJsaptZiaA1?pwd=ev56#'
  - name: 夸克网盘
    url: 'https://pan.quark.cn/s/3df15629ca3e'
gallery:
  - 'https://i.postimg.cc/FRvxDNYN/wei-xin-tu-pian-20260228142814-239-902.png'
id: 15
---

### 资源描述

**Windows C盘深度清理工具**是一款基于 Python 和 CustomTkinter 构建的免费系统清理软件。它涵盖 8 大核心清理项，包括系统临时文件、Windows 更新缓存、浏览器缓存、回收站等，能帮助用户快速释放 C 盘空间。界面采用现代化 CustomTkinter 框架，支持深色模式与中英双语切换，操作简单直观。程序以纯 Python 逻辑实现，无任何捆绑插件，清理过程完全透明可控。

**支持清理的项目：**

- 用户临时文件（`%TEMP%` 及本地应用临时目录）
- 系统临时文件（Windows 临时文件夹及 Prefetch 预读取文件）
- Windows 更新缓存（SoftwareDistribution 下载目录）
- 浏览器缓存（Chrome、Edge、Firefox）
- 系统日志（CBS、DISM 及 IIS 等过期日志）
- 回收站（一键清空所有驱动器）
- 其他缓存（错误报告、DirectX 着色器缓存、npm/pip 缓存等）
- 系统磁盘清理（可选调用 Windows 自带 `cleanmgr.exe`）

### 安装/使用步骤

1. **下载**：点击右侧链接获取资源程序包。
2. **运行**：右键点击 `Windows_Cleaner.exe`，选择**以管理员身份运行**以获得最佳清理效果。
3. **选择清理项**：在界面中勾选需要清理的项目。
4. **开始清理**：点击"开始清理"按钮，等待清理完成即可查看释放空间大小。

> ⚠️ **注意**：请务必以管理员权限运行，否则部分系统目录无法清理。

### 更新日志

- v1.0：初始版本发布，支持 8 大核心清理项，中英双语界面。
