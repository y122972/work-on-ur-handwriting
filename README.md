# 练字助手

一个基于 Next.js 的中文练字 Web 应用，帮助你在浏览器中生成字帖、练习书写。

![应用截图](https://github.com/user-attachments/assets/ad9dc688-efe9-4ec7-b59d-025d28897299)

## 功能

- **字帖生成** — 支持田字格、米字格、回宫格及空白四种格式
- **内容选择** — 内置古诗词、基础汉字，支持自定义文本
- **字体切换** — 支持楷体、宋体、仿宋等系统字体及 Google 字体，也可上传本地字体文件
- **打印输出** — 一键打印生成的字帖
- **字体修复** — 内置工具修复上传字体文件的兼容性问题

## 技术栈

- [Next.js](https://nextjs.org/) 16 + React 19
- TypeScript
- Tailwind CSS
- [lucide-react](https://lucide.dev/)

## 快速开始

```bash
pnpm install
pnpm dev
```

浏览器打开 [http://localhost:3000](http://localhost:3000) 即可使用。

## 构建

```bash
pnpm build
pnpm start
```