---
title: Antigravity-Proxy：免 TUN 强制代理工具
desc: 专为 Antigravity 打造，解决 AI 开发环境下的网络切换痛点。
category: 开发工具
date: '2026-03-07'
tags:
  - Antigravity
  - 代理工具
  - AI
links:
  - name: 迅雷网盘
    url: 'https://pan.xunlei.com/s/VOn5XKau4NKGrcq-z-zMATXbA1?pwd=j4ab#'
  - name: 夸克网盘
    url: 'https://pan.quark.cn/s/248e1aa65c18'
gallery:
  - 'https://i.postimg.cc/3wYVdDL3/image-20260307114352600.png'
id: 16
---

### 1.资源描述 

**Antigravity** 是谷歌于 2025 年底推出的革命性 AI 驱动开发平台。但在国内使用时，通常需要开启 Clash TUN 模式才能使用 AI 模型，这往往会干扰本地 Git 提交或其他国内网络服务。

**Antigravity-Proxy** 完美解决了这一痛点。它能够精准拦截并转发 Antigravity 相关进程的流量，无需手动频繁切换代理模式，是开发者提升效率的利器。

### 2.安装/使用步骤

1. **下载**: 从 GitHub 或提供的链接下载压缩包。

   ![image-20260307110243252](https://github.com/YuLong2233/FreeShare/releases/download/media/Antigravity-Proxy-TUN-_img_1.png)
2. **解压**: 将压缩包内的文件解压至 Antigravity 的**安装根目录**。

   ![image-20260307110357884](https://github.com/YuLong2233/FreeShare/releases/download/media/Antigravity-Proxy-TUN-_img_2.png)
3. **配置**: 
   - 打开 `config.json` 文件，修改port。
   - 将 `port` 修改为您 Clash 软件中对应的代理端口号。
   
     ![image-20260307113041813](https://github.com/YuLong2233/FreeShare/releases/download/media/Antigravity-Proxy-TUN-_img_3.png)
   
     ![image-20260307111719012](https://github.com/YuLong2233/FreeShare/releases/download/media/Antigravity-Proxy-TUN-_img_4.png)
   - 确保 Clash 中的“局域网连接”（Allow LAN）已打开。
4. **运行**: 完成配置后即可直接使用，Antigravity 的流量将自动通过代理转发。

   ![image-20260307114352600](https://github.com/YuLong2233/FreeShare/releases/download/media/Antigravity-Proxy-TUN-_img_5.png)

### 3. 原始连接

原作者连接：https://github.com/Panoramazxl/antigravity-proxy110

github地址，有条件的宝子可以去github找到原作者支持一下
