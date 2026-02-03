'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { 
  Type, 
  Upload, 
  Grid3X3, 
  Settings, 
  Printer, 
  Search, 
  BookOpen, 
  PenTool,
  Trash2,
  Wrench,
  X,
  Database,
} from 'lucide-react';
import { saveFont, getAllFonts, deleteFont, CachedFont } from './lib/fontStorage';
import { saveConfig, loadConfig, PageConfig } from './lib/configStorage';

// --- Default Data & Constants ---

const WEB_FONTS = [
  { name: '系统楷体', value: 'KaiTi, "楷体", "STKaiti", "BiauKai", "標楷體", serif', type: 'system' },
  { name: '系统宋体', value: '"SimSun", "宋体", "STSong", "Songti SC", serif', type: 'system' },
  { name: '系统黑体', value: '"SimHei", "黑体", "STHeiti", "Heiti SC", sans-serif', type: 'system' },
  { name: '系统仿宋', value: '"FangSong", "仿宋", "STFangsong", "Fangsong", serif', type: 'system' },
  { name: 'Noto Serif SC', value: '"Noto Serif SC", "SimSun", "宋体", serif', url: 'https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap' },
  { name: 'Ma Shan Zheng', value: '"Ma Shan Zheng", "KaiTi", "楷体", cursive', url: 'https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&display=swap' },
];

const POEMS = [
  { title: "静夜思", author: "李白", content: "床前明月光，疑是地上霜。举头望明月，低头思故乡。" },
  { title: "登鹳雀楼", author: "王之涣", content: "白日依山尽，黄河入海流。欲穷千里目，更上一层楼。" },
  { title: "春晓", author: "孟浩然", content: "春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。" },
  { title: "江雪", author: "柳宗元", content: "千山鸟飞绝，万径人踪灭。孤舟蓑笠翁，独钓寒江雪。" },
  { title: "悯农", author: "李绅", content: "锄禾日当午，汗滴禾下土。谁知盘中餐，粒粒皆辛苦。" },
  { title: "咏鹅", author: "骆宾王", content: "鹅鹅鹅，曲项向天歌。白毛浮绿水，红掌拨清波。" },
  { title: "早发白帝城", author: "李白", content: "朝辞白帝彩云间，千里江陵一日还。两岸猿声啼不住，轻舟已过万重山。" },
  { title: "水调歌头", author: "苏轼", content: "明月几时有？把酒问青天。不知天上宫阙，今夕是何年。" },
];

const BASIC_CHARS = [
  { category: "数字", content: "一二三四五六七八九十百千万" },
  { category: "五行", content: "金木水火土" },
  { category: "自然", content: "日月星辰风雨雷电山川河流" },
  { category: "永字八法", content: "永" },
  { category: "常用偏旁", content: "亻彳讠氵忄辶阝卩" },
];

const GRIDS = {
  MI_ZI: '米字格',
  TIAN_ZI: '田字格',
  HUI_GONG: '回宫格',
  NONE: '空白',
};

// --- Components ---

const GridBackground = ({ type, color }: { type: string; color: string }) => {
  const style = { stroke: color, opacity: 0.3 };
  
  if (type === GRIDS.NONE) return null;

  return (
    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none z-0">
      {/* Outer Border */}
      <rect x="0" y="0" width="100" height="100" fill="none" strokeWidth="2" style={style} />
      
      {/* Tian Zi Ge Lines */}
      {(type === GRIDS.TIAN_ZI || type === GRIDS.MI_ZI || type === GRIDS.HUI_GONG) && (
        <>
          <line x1="50" y1="0" x2="50" y2="100" strokeWidth="1" strokeDasharray="4 2" style={style} />
          <line x1="0" y1="50" x2="100" y2="50" strokeWidth="1" strokeDasharray="4 2" style={style} />
        </>
      )}

      {/* Mi Zi Ge Diagonals */}
      {type === GRIDS.MI_ZI && (
        <>
          <line x1="0" y1="0" x2="100" y2="100" strokeWidth="1" strokeDasharray="4 2" style={style} />
          <line x1="100" y1="0" x2="0" y2="100" strokeWidth="1" strokeDasharray="4 2" style={style} />
        </>
      )}

      {/* Hui Gong Ge Inner Box */}
      {type === GRIDS.HUI_GONG && (
        <rect x="25" y="25" width="50" height="50" fill="none" strokeWidth="1" strokeDasharray="4 2" style={style} />
      )}
    </svg>
  );
};

interface CharBoxConfig {
  size: number;
  gridType: string;
  gridColor: string;
  fontFamily: string;
  textColor: string;
  textOpacity: number;
}

const CharBox = ({ char, config }: { char: string; config: CharBoxConfig }) => {
  return (
    <div 
      className="relative flex items-center justify-center bg-white print:border-none break-inside-avoid"
      style={{
        width: `${config.size}px`,
        height: `${config.size}px`,
        marginBottom: '4px',
        marginRight: '4px',
      }}
    >
      <GridBackground type={config.gridType} color={config.gridColor} />
      <span
        className="z-10 leading-none text-center select-none"
        style={{
          fontFamily: config.fontFamily,
          fontSize: `${config.size * 0.75}px`,
          color: config.textColor,
          opacity: config.textOpacity,
        }}
      >
        {char}
      </span>
    </div>
  );
};

export default function Home() {
  // --- State ---
  const [content, setContent] = useState(POEMS[0].content);
  const [activeTab, setActiveTab] = useState<'library' | 'input' | 'settings'>('library');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [config, setConfig] = useState<CharBoxConfig>({
    size: 100,
    gridType: GRIDS.MI_ZI,
    gridColor: '#ef4444', // red-500
    fontFamily: WEB_FONTS[0].value, // Default to system KaiTi (always available)
    textColor: '#000000',
    textOpacity: 0.8, // 1 for black, 0.2 for tracing
  });

  const [customFontName, setCustomFontName] = useState<string | null>(null);
  const [customFontId, setCustomFontId] = useState<string | null>(null);
  const [cachedFonts, setCachedFonts] = useState<CachedFont[]>([]);
  const [loadingFonts, setLoadingFonts] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Effects ---
  
  // Load cached configuration and fonts on mount
  useEffect(() => {
    // Load cached configuration
    const savedConfig = loadConfig();
    if (savedConfig) {
      if (savedConfig.content !== undefined) setContent(savedConfig.content);
      if (savedConfig.size !== undefined) {
        setConfig(prev => ({ ...prev, size: savedConfig.size! }));
      }
      if (savedConfig.gridType !== undefined) {
        setConfig(prev => ({ ...prev, gridType: savedConfig.gridType! }));
      }
      if (savedConfig.gridColor !== undefined) {
        setConfig(prev => ({ ...prev, gridColor: savedConfig.gridColor! }));
      }
      if (savedConfig.textColor !== undefined) {
        setConfig(prev => ({ ...prev, textColor: savedConfig.textColor! }));
      }
      if (savedConfig.textOpacity !== undefined) {
        setConfig(prev => ({ ...prev, textOpacity: savedConfig.textOpacity! }));
      }
      // Font family will be set after loading cached fonts
      if (savedConfig.customFontId) {
        setCustomFontId(savedConfig.customFontId);
      }
    }

    // Load cached fonts from IndexedDB
    loadCachedFonts();
  }, []);

  // Save configuration to localStorage whenever it changes
  useEffect(() => {
    const configToSave: PageConfig = {
      content,
      size: config.size,
      gridType: config.gridType,
      gridColor: config.gridColor,
      fontFamily: config.fontFamily,
      textColor: config.textColor,
      textOpacity: config.textOpacity,
      customFontId,
    };
    saveConfig(configToSave);
  }, [content, config, customFontId]);

  // Load cached fonts and apply them
  const loadCachedFonts = async () => {
    setLoadingFonts(true);
    try {
      const fonts = await getAllFonts();
      setCachedFonts(fonts);

      // Load all fonts into the browser
      for (const font of fonts) {
        try {
          const fontFace = new FontFace(font.id, font.data);
          await fontFace.load();
          document.fonts.add(fontFace);
        } catch (err) {
          console.error(`Failed to load cached font ${font.name}:`, err);
        }
      }

      // Restore previously selected custom font
      const savedConfig = loadConfig();
      if (savedConfig?.customFontId) {
        const selectedFont = fonts.find(f => f.id === savedConfig.customFontId);
        if (selectedFont) {
          setCustomFontName(selectedFont.name);
          setCustomFontId(selectedFont.id);
          setConfig(prev => ({ ...prev, fontFamily: selectedFont.id }));
        }
      } else if (savedConfig?.fontFamily) {
        // Restore web font selection
        setConfig(prev => ({ ...prev, fontFamily: savedConfig.fontFamily! }));
      }
    } catch (error) {
      console.error('Failed to load cached fonts:', error);
    } finally {
      setLoadingFonts(false);
    }
  };
  
  // Load Web Fonts - Fixed version with better fallback handling
  useEffect(() => {
    // Try to load Google Fonts, but don't fail if they're blocked
    WEB_FONTS.forEach(font => {
      if (font.url) {
        // Check if link already exists
        const existingLink = document.head.querySelector(`link[href="${font.url}"]`);
        if (!existingLink) {
          const link = document.createElement('link');
          link.href = font.url;
          link.rel = 'stylesheet';
          link.crossOrigin = 'anonymous';
          
          // Add onload handler to track when fonts are ready
          link.onload = () => {
            console.log(`Font loaded successfully: ${font.name}`);
          };
          
          link.onerror = () => {
            console.warn(`Could not load Google Font: ${font.name}, using system fallback`);
          };
          
          document.head.appendChild(link);
        }
      }
    });

    // Cleanup - no action needed as fonts persist
    return () => {};
  }, []);

  // --- Handlers ---

  const handleFontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const fontName = `CustomFont_${Date.now()}`;
      const fontFace = new FontFace(fontName, arrayBuffer);
      
      await fontFace.load();
      document.fonts.add(fontFace);
      
      // Save font to IndexedDB
      const fontId = await saveFont(file.name, arrayBuffer);
      
      setCustomFontName(file.name);
      setCustomFontId(fontId);
      setConfig(prev => ({ ...prev, fontFamily: fontId }));
      
      // Reload cached fonts list
      await loadCachedFonts();
    } catch (err) {
      const userResponse = confirm(
        '字体加载失败，可能是字体文件损坏或格式不兼容。\n\n是否前往字体修复工具尝试修复？'
      );
      if (userResponse) {
        window.location.href = '/repair';
      }
      console.error(err);
    }
  };

  const handleDeleteFont = async (fontId: string) => {
    try {
      await deleteFont(fontId);
      
      // If the deleted font is currently selected, switch to default font
      if (customFontId === fontId) {
        setCustomFontName(null);
        setCustomFontId(null);
        setConfig(prev => ({ ...prev, fontFamily: WEB_FONTS[0].value }));
      }
      
      // Reload cached fonts list
      await loadCachedFonts();
    } catch (error) {
      console.error('Failed to delete font:', error);
      alert('删除字体失败');
    }
  };

  const cleanText = (text: string) => {
    // Remove spaces and non-printable characters for the grid, allow punctuation
    return text.replace(/\s+/g, '');
  };

  const filteredPoems = useMemo(() => {
    if (!searchQuery) return POEMS;
    return POEMS.filter(p => p.title.includes(searchQuery) || p.author.includes(searchQuery) || p.content.includes(searchQuery));
  }, [searchQuery]);

  const chars = useMemo(() => cleanText(content).split(''), [content]);

  // --- Render Sections ---

  const renderSidebar = () => (
    <div className="w-full md:w-80 bg-slate-50 border-r border-slate-200 h-screen overflow-y-auto p-4 flex flex-col gap-6 print:hidden shadow-lg z-20">
      <div className="flex items-center gap-2 mb-2 text-slate-800">
        <PenTool className="w-6 h-6 text-red-600" />
        <h1 className="text-xl font-bold font-serif tracking-widest">云端字帖</h1>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-200 p-1 rounded-lg">
        {[
          { id: 'library' as const, icon: BookOpen, label: '内容' },
          { id: 'input' as const, icon: Type, label: '输入' },
          { id: 'settings' as const, icon: Settings, label: '样式' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.id 
                ? 'bg-white text-red-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content: Library */}
      {activeTab === 'library' && (
        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-left-4 duration-300">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="搜索诗词..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
            />
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">基础练习</h3>
              <div className="flex flex-wrap gap-2">
                {BASIC_CHARS.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => setContent(item.content)}
                    className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs hover:border-red-500 hover:text-red-500 transition-colors"
                  >
                    {item.category}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">经典诗词</h3>
              <div className="space-y-2">
                {filteredPoems.map((poem, idx) => (
                  <button
                    key={idx}
                    onClick={() => setContent(poem.content)}
                    className="w-full text-left p-3 bg-white border border-slate-200 rounded-lg hover:border-red-500 transition-all group"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-slate-800 group-hover:text-red-600">{poem.title}</span>
                      <span className="text-xs text-slate-500">{poem.author}</span>
                    </div>
                    <p className="text-xs text-slate-400 truncate">{poem.content}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Input */}
      {activeTab === 'input' && (
        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-left-4 duration-300">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">自定义内容</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              placeholder="在此输入想要练习的文字..."
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none text-slate-700"
            />
          </div>
          <button 
            onClick={() => setContent('')}
            className="flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 py-2 rounded-lg transition-colors text-sm"
          >
            <Trash2 className="w-4 h-4" /> 清空内容
          </button>
        </div>
      )}

      {/* Tab Content: Settings */}
      {activeTab === 'settings' && (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-left-4 duration-300">
          {/* Font Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Type className="w-4 h-4" /> 字体选择
            </label>
            <select
              value={config.fontFamily}
              onChange={(e) => {
                const value = e.target.value;
                setConfig({ ...config, fontFamily: value });
                
                // Update custom font tracking
                const selectedCachedFont = cachedFonts.find(f => f.id === value);
                if (selectedCachedFont) {
                  setCustomFontName(selectedCachedFont.name);
                  setCustomFontId(selectedCachedFont.id);
                } else {
                  setCustomFontName(null);
                  setCustomFontId(null);
                }
              }}
              className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white"
            >
              {WEB_FONTS.map((font, idx) => (
                <option key={idx} value={font.value}>{font.name}</option>
              ))}
              {cachedFonts.length > 0 && (
                <optgroup label="本地缓存字体">
                  {cachedFonts.map((font) => (
                    <option key={font.id} value={font.id}>
                      {font.name}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2 border border-dashed border-slate-300 rounded-lg text-sm text-slate-500 hover:text-red-500 hover:border-red-500 transition-colors flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" /> 加载本地字体 (.ttf/.otf)
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFontUpload} 
              accept=".ttf,.otf"
              className="hidden" 
            />
            
            {/* Cached Fonts Management */}
            {cachedFonts.length > 0 && (
              <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-600 flex items-center gap-1">
                    <Database className="w-3 h-3" />
                    缓存字体 ({cachedFonts.length})
                  </span>
                </div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {cachedFonts.map((font) => (
                    <div
                      key={font.id}
                      className="flex items-center justify-between py-1 px-2 hover:bg-white rounded text-xs group"
                    >
                      <span className="text-slate-700 truncate flex-1" title={font.name}>
                        {font.name}
                      </span>
                      <button
                        onClick={() => {
                          if (confirm(`确定要删除字体 "${font.name}" 吗？`)) {
                            handleDeleteFont(font.id);
                          }
                        }}
                        className="text-slate-400 hover:text-red-500 transition-colors ml-2"
                        title="删除"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <Link 
              href="/repair"
              className="w-full py-2 border border-slate-300 rounded-lg text-xs text-slate-600 hover:text-red-500 hover:border-red-500 transition-colors flex items-center justify-center gap-2"
            >
              <Wrench className="w-3 h-3" /> 字体加载失败？试试修复工具
            </Link>
          </div>

          {/* Grid Settings */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Grid3X3 className="w-4 h-4" /> 格线样式
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(GRIDS).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setConfig({ ...config, gridType: label })}
                  className={`px-3 py-2 text-xs rounded-md border transition-all ${
                    config.gridType === label 
                      ? 'bg-red-50 border-red-500 text-red-700' 
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            
            {/* Grid Color */}
             <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">格线颜色</span>
                <input 
                  type="color" 
                  value={config.gridColor}
                  onChange={(e) => setConfig({...config, gridColor: e.target.value})}
                  className="w-8 h-8 rounded cursor-pointer border-0"
                />
             </div>
          </div>

          {/* Size & Layout */}
          <div className="space-y-4 border-t border-slate-200 pt-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-700">字号大小</span>
                <span className="text-slate-500">{config.size}px</span>
              </div>
              <input
                type="range"
                min="40"
                max="200"
                step="5"
                value={config.size}
                onChange={(e) => setConfig({ ...config, size: parseInt(e.target.value) })}
                className="w-full accent-red-500"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-700">字迹浓度 (描红)</span>
                <span className="text-slate-500">{Math.round(config.textOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="1"
                step="0.05"
                value={config.textOpacity}
                onChange={(e) => setConfig({ ...config, textOpacity: parseFloat(e.target.value) })}
                className="w-full accent-red-500"
              />
              <div className="flex justify-between mt-2">
                 <button onClick={() => setConfig({...config, textOpacity: 0.2})} className="text-xs text-blue-500 underline">设为描红</button>
                 <button onClick={() => setConfig({...config, textOpacity: 1.0})} className="text-xs text-blue-500 underline">设为临摹</button>
              </div>
            </div>
             
             {/* Text Color */}
             <div className="flex items-center justify-between pt-2">
                <span className="text-sm font-medium text-slate-700">文字颜色</span>
                <input 
                  type="color" 
                  value={config.textColor}
                  onChange={(e) => setConfig({...config, textColor: e.target.value})}
                  className="w-8 h-8 rounded cursor-pointer border-0"
                />
             </div>
          </div>
        </div>
      )}
      
      <div className="mt-auto pt-6 border-t border-slate-200">
         <button 
           onClick={() => window.print()}
           className="w-full bg-slate-900 text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-lg"
         >
           <Printer className="w-5 h-5" /> 打印字帖
         </button>
         <p className="text-xs text-center text-slate-400 mt-2">建议使用 A4 纸张横向打印</p>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-full bg-slate-100 font-sans text-slate-900 overflow-hidden">
      {/* Sidebar */}
      {renderSidebar()}

      {/* Main Preview Area */}
      <div className="flex-1 h-full overflow-y-auto overflow-x-hidden p-8 print:p-0 print:m-0 print:overflow-visible">
        {/* Paper Container */}
        <div className="max-w-6xl mx-auto print:max-w-none print:w-full print:mx-0">
          
          {/* Header visible on screen only */}
          <div className="mb-6 flex items-center justify-between print:hidden">
            <h2 className="text-2xl font-bold text-slate-800">预览区域</h2>
            <div className="flex gap-2 text-sm text-slate-500 bg-white px-3 py-1 rounded-full shadow-sm">
               <span>共 {chars.length} 字</span>
               <span>•</span>
               <span>{config.gridType}</span>
               <span>•</span>
               <span>{WEB_FONTS.find(f => f.value === config.fontFamily)?.name || '自定义字体'}</span>
            </div>
          </div>

          {/* The Paper Sheet */}
          <div 
            className="bg-white shadow-2xl p-8 min-h-[80vh] print:shadow-none print:p-0"
            style={{ 
              width: '100%',
              // A subtle paper texture
              backgroundImage: 'linear-gradient(to right, #f8f9fa 1px, transparent 1px), linear-gradient(to bottom, #f8f9fa 1px, transparent 1px)',
              backgroundSize: '40px 40px'
             }}
          >
            {/* Title for Print */}
            <div className="hidden print:block text-center mb-8">
              <h1 className="text-2xl font-serif mb-2">{POEMS.find(p => p.content === content)?.title || '习字帖'}</h1>
              <p className="text-sm text-slate-500">日期: _________________</p>
            </div>

            {/* Grid Container */}
            <div className="flex flex-wrap content-start">
              {chars.map((char, index) => (
                <CharBox key={index} char={char} config={config} />
              ))}
              {/* Fill remaining space with empty grids if needed (optional visual polish) */}
              {Array.from({ length: Math.max(0, 12 - (chars.length % 12 || 12)) }).map((_, i) => (
                 <CharBox key={`empty-${i}`} char="" config={config} />
              ))}
            </div>
            
            <div className="hidden print:block mt-8 text-center text-xs text-slate-300">
               - 云端练字生成 -
            </div>
          </div>
        </div>
      </div>
      
      {/* CSS for printing adjustments */}
      <style jsx>{`
        @media print {
          @page { margin: 1cm; size: auto; }
          body { -webkit-print-color-adjust: exact; }
          .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
          .print\\:border-none { border: none !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:p-0 { padding: 0 !important; }
          .print\\:m-0 { margin: 0 !important; }
          .print\\:overflow-visible { overflow: visible !important; }
          .print\\:w-full { width: 100% !important; }
          .print\\:max-w-none { max-width: none !important; }
          .print\\:mx-0 { margin-left: 0 !important; margin-right: 0 !important; }
          /* Ensure backgrounds (grid lines) print */
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>
    </div>
  );
}
