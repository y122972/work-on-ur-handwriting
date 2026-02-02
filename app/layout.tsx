import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "云端字帖 - 在线中文练字工具",
  description: "在线生成中文练字字帖，支持多种字体、格线样式和自定义内容",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
