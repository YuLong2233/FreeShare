---
title: Windows 安装 Claude Code 教程
desc: 完整安装与配置指南，助你在终端高效调用 Anthropic AI 编程助手。
category: 开发工具
date: '2026-03-07'
tags:
  - Claude Code
  - Anthropic
  - 环境配置
  - Node.js
links:
  - name: Node.js 官网
    url: 'https://nodejs.org'
  - name: Anthropic Console
    url: 'https://console.anthropic.com'
gallery:
  - 'https://i.postimg.cc/vBTDWTPW/claude.png'
id: 17
---

# Windows 安装 Claude Code 教程

> 完整安装与配置指南 | 适用于 Windows 10 / Windows 11

------

## 一、什么是 Claude Code？

Claude Code 是 Anthropic 推出的一款面向开发者的 AI 编程助手，运行在命令行（终端）中，能够帮助你：

- 理解、编写、调试和重构代码
- 自动化执行复杂的开发任务
- 阅读并操作整个代码库
- 与 Git 等开发工具深度集成

> 💡 **提示：** Claude Code 直接在你的终端中运行，能访问本地文件、执行命令，真正实现端到端的开发辅助。

------

## 二、系统要求

| 要求项目       | 最低要求                              |
| -------------- | ------------------------------------- |
| 操作系统       | Windows 10（64位）或 Windows 11       |
| Node.js 版本   | Node.js 18 或更高版本（推荐 20 LTS）  |
| 内存           | 4GB RAM（推荐 8GB 以上）              |
| 磁盘空间       | 至少 500MB 可用空间                   |
| 网络           | 需要连接互联网（用于访问 Claude API） |
| Anthropic 账户 | 需要有效的 Anthropic 账户及 API Key   |

------

## 三、第一步：安装 Node.js

Claude Code 基于 Node.js 运行，必须先安装 Node.js。

### 3.1 下载 Node.js

1. 打开浏览器，访问 Node.js 官方网站：https://nodejs.org
2. 在首页选择 **LTS（长期支持版）** 下载按钮（推荐，更稳定）
3. 点击下载，获得 `.msi` 安装文件

### 3.2 安装 Node.js

1. 双击下载好的 `.msi` 安装包
2. 点击 **Next** 继续
3. 勾选 **I accept the terms in the License Agreement**，然后点击 **Next**
4. 保持默认安装路径，点击 **Next**
5. 在 **Custom Setup** 页面保持默认，点击 **Next**
6. 勾选 **Automatically install the necessary tools**（自动安装必要工具），点击 **Next**
7. 点击 **Install** 开始安装，等待完成
8. 点击 **Finish** 完成安装

### 3.3 验证安装

安装完成后，打开命令提示符（`Win + R`，输入 `cmd`，回车）验证安装：

```bash
node --version
```

若显示版本号（如 `v20.11.0`），说明 Node.js 安装成功。继续验证 npm：

```bash
npm --version
```

正常会显示 npm 版本号（如 `10.2.4`）。

> ⚠️ **注意：** 如果提示"不是内部或外部命令"，请重新启动电脑后再试。

------

## 四、第二步：安装 Claude Code

Node.js 安装成功后，即可通过 npm 安装 Claude Code。

### 4.1 打开终端

推荐使用以下任一终端（**以管理员身份运行**）：

- **命令提示符（cmd）** —— 按 Win 键，搜索"cmd"，右键选择"以管理员身份运行"
- **PowerShell** —— 按 Win 键，搜索"PowerShell"，右键选择"以管理员身份运行"
- **Windows Terminal** —— 推荐，支持多标签，可从 Microsoft Store 免费安装

### 4.2 执行安装命令

在终端中输入以下命令并回车：

```bash
npm install -g @anthropic-ai/claude-code
```

等待安装完成（需要几分钟，取决于网速）。安装成功后会看到类似如下输出：

```
added 123 packages in 30s
```

### 4.3 验证安装

运行以下命令，确认 Claude Code 已正确安装：

```bash
claude --version
```

若显示版本号，安装成功。

> ⚠️ **注意：** 如果安装出现权限错误，请确保以管理员身份运行终端，或参考第七部分的常见问题解决。

------

## 五、第三步：配置 API Key

Claude Code 需要 Anthropic API Key 才能正常运行。

### 5.1 获取 API Key

1. 访问 Anthropic 官网：https://console.anthropic.com
2. 登录你的 Anthropic 账户（没有账户需先注册）
3. 点击左侧菜单 **API Keys**
4. 点击 **Create Key** 按钮
5. 为 Key 起个名字（如 `Claude Code Windows`），点击确认
6. 复制生成的 API Key（以 `sk-ant-` 开头），妥善保存

> ⚠️ **注意：** API Key 只显示一次，请立即复制保存。如果丢失需要重新生成。

### 5.2 设置 API Key（方法一：环境变量，推荐）

将 API Key 设置为系统环境变量是最安全的方式：

1. 右键点击"此电脑" → "属性"
2. 点击"高级系统设置" → "环境变量"
3. 在"系统变量"区域点击"新建"
4. 变量名输入：`ANTHROPIC_API_KEY`
5. 变量值粘贴你的 API Key
6. 点击确定保存，重启终端

### 5.3 设置 API Key（方法二：启动时输入）

直接启动 Claude Code，首次运行时会提示你输入 API Key：

```bash
claude
```

按照提示输入你的 API Key 即可。

------

## 六、第四步：开始使用

配置完成后，就可以开始使用 Claude Code 了！

### 6.1 启动 Claude Code

在终端中，进入你的项目目录，然后运行：

```bash
claude
```

Claude Code 将启动交互界面，你可以开始与 Claude 对话。

### 6.2 常用命令

| 命令                  | 说明                   |
| --------------------- | ---------------------- |
| `claude`              | 进入交互模式，开始对话 |
| `claude "问题或指令"` | 直接执行单条指令       |
| `claude --help`       | 查看帮助信息           |
| `claude --version`    | 查看当前版本           |
| `/exit` 或 `Ctrl+C`   | 退出 Claude Code       |

### 6.3 使用示例

进入你的项目目录后，试试以下这些对话：

```
解释一下这个项目的结构
帮我找出 main.py 中的 bug
为这个函数写单元测试
将这段代码重构得更简洁
```

> 💡 **提示：** Claude Code 可以直接读取你本地文件，所以它能结合你实际的代码给出精准建议。

------

## 七、常见问题解决

### 问题 1：npm 命令不存在

**原因：** Node.js 未正确安装或环境变量未生效。

**解决：** 重新安装 Node.js，安装完成后重启终端或重启电脑。

### 问题 2：安装时出现权限错误（EACCES）

**原因：** npm 全局安装需要管理员权限。

**解决方案：**

- 以管理员身份运行终端后重试安装

- 或在 PowerShell 中执行：

  ```powershell
  Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
  ```

### 问题 3：网络连接超时

**原因：** 国内网络访问 npm 服务器较慢。

**解决：** 使用国内镜像源：

```bash
npm install -g @anthropic-ai/claude-code --registry https://registry.npmmirror.com
```

### 问题 4：API Key 无效

**原因：** API Key 输入错误或已失效。

**解决：**

1. 重新登录 Anthropic Console 检查 API Key
2. 确认 API Key 以 `sk-ant-` 开头
3. 确认账户余额充足

### 问题 5：claude 命令找不到

**原因：** npm 全局安装路径未在 PATH 中。

**解决：** 在终端中运行：

```bash
npm config get prefix
```

将输出路径下的 `bin` 文件夹添加到系统环境变量 PATH 中。

------

## 八、总结

恭喜！如果你按照以上步骤顺利操作，Claude Code 现在已经在你的 Windows 系统上运行了。

整个安装流程回顾：

1. 安装 Node.js 18+（推荐 LTS 版本）
2. 通过 npm 全局安装 Claude Code
3. 配置 Anthropic API Key
4. 在项目目录中运行 `claude` 开始使用


如需了解更多功能，可访问官方文档：https://docs.anthropic.com/claude-code
