'use client';

import React, { useState, useRef } from 'react';
import { Download, AlertCircle, CheckCircle2, FileText, Wrench, Home } from 'lucide-react';
import Link from 'next/link';

// OpenType.js will be loaded from CDN
declare global {
  interface Window {
    opentype: {
      parse(buffer: ArrayBuffer): {
        toArrayBuffer(): ArrayBuffer;
      };
    };
  }
}

export default function FontRepairPage() {
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('等待上传...');
  const [fileName, setFileName] = useState('');
  const [fixedBlob, setFixedBlob] = useState<Blob | null>(null);
  const [originalName, setOriginalName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load OpenType.js from CDN
  React.useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/opentype.js@1.3.4/dist/opentype.min.js';
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => {
      setStatus('error');
      setStatusMessage('❌ 加载字体解析库失败，请刷新页面重试');
    };
    document.body.appendChild(script);
    
    return () => {
      try {
        if (script.parentNode) {
          document.body.removeChild(script);
        }
      } catch {
        // Script already removed, ignore
      }
    };
  }, []);

  const handleFile = async (file: File) => {
    if (!file) return;
    
    if (!scriptLoaded) {
      setStatus('error');
      setStatusMessage('❌ 字体解析库未加载完成，请稍后重试');
      return;
    }

    const lastDotIndex = file.name.lastIndexOf('.');
    setOriginalName(lastDotIndex > 0 ? file.name.substring(0, lastDotIndex) : file.name);
    setFileName(file.name);
    setStatus('processing');
    setStatusMessage('正在解析并修复字体...');
    setFixedBlob(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      
      // Parse and repair the font using opentype.js
      const font = window.opentype.parse(arrayBuffer);
      
      // Convert back to ArrayBuffer (this rewrites all tables and fixes errors)
      const outBuffer = font.toArrayBuffer();
      
      // Create downloadable Blob
      const blob = new Blob([outBuffer], { type: 'font/ttf' });
      
      setFixedBlob(blob);
      setStatus('success');
      setStatusMessage('✅ 修复完成！数据表已重新生成。');
    } catch (err) {
      console.error(err);
      setStatus('error');
      setStatusMessage(`❌ 修复失败: ${err instanceof Error ? err.message : '未知错误'}`);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleDownload = () => {
    if (!fixedBlob) return;
    
    const url = URL.createObjectURL(fixedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${originalName}_fixed.ttf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-6 sm:p-8">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Wrench className="w-8 h-8 text-red-500" />
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">字体文件修复器</h1>
          </div>
          <p className="text-sm text-slate-500">
            解决浏览器 &ldquo;Failed to decode&rdquo; 或 &ldquo;OTS parsing error&rdquo; 报错
          </p>
          <Link 
            href="/"
            className="inline-flex items-center gap-2 mt-3 text-sm text-red-500 hover:text-red-600 transition-colors"
          >
            <Home className="w-4 h-4" />
            返回首页
          </Link>
        </div>

        {/* Drop Zone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 sm:p-12 text-center cursor-pointer transition-all mb-6 ${
            isDragging
              ? 'border-red-500 bg-red-50'
              : status === 'success'
              ? 'border-green-500 bg-green-50'
              : status === 'error'
              ? 'border-red-400 bg-red-50'
              : 'border-slate-300 hover:border-red-500 hover:bg-slate-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".ttf,.otf"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <div className="flex flex-col items-center gap-3">
            {status === 'success' ? (
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            ) : status === 'error' ? (
              <AlertCircle className="w-12 h-12 text-red-500" />
            ) : status === 'processing' ? (
              <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <FileText className="w-12 h-12 text-slate-400" />
            )}
            
            <div>
              <p className="text-lg font-medium text-slate-700 mb-1">
                {fileName || '点击或拖拽字体文件到这里'}
              </p>
              <p className="text-sm text-slate-500">支持 .ttf / .otf 格式</p>
            </div>
          </div>
        </div>

        {/* Status Message */}
        <div className={`text-center py-3 px-4 rounded-lg mb-6 ${
          status === 'success' 
            ? 'bg-green-50 text-green-700'
            : status === 'error'
            ? 'bg-red-50 text-red-700'
            : status === 'processing'
            ? 'bg-blue-50 text-blue-700'
            : 'bg-slate-50 text-slate-600'
        }`}>
          <p className="text-sm font-medium">{statusMessage}</p>
        </div>

        {/* Download Button */}
        {status === 'success' && fixedBlob && (
          <button
            onClick={handleDownload}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-md"
          >
            <Download className="w-5 h-5" />
            下载修复后的 TTF 文件
          </button>
        )}

        {/* Info Section */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <div className="bg-slate-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              工作原理
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              通过 opentype.js 重新解析字体数据，计算并重建所有数据表头（tables），
              剔除不规范的元数据，生成符合浏览器标准的 TTF 字体文件。
              这可以解决大部分字体加载失败的问题。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
