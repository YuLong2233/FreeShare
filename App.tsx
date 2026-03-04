
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import { Search, Sparkles, BookOpen, Download, Github, Menu, X, Rocket, Info, ChevronRight, BrainCircuit, Loader2, ArrowLeft, ExternalLink, Copy, Check, Zap, ChevronLeft } from 'lucide-react';
import { RESOURCES } from './data/resources-list';
import { ResourceCard } from './components/ResourceCard';
import { Resource, ResourceDetail } from './types';
import { findResourcesWithAi } from './services/geminiService';

// --- 资源详情页 ---
const ResourceDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ResourceDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(true);
  const [detailError, setDetailError] = useState(false);

  // 从轻量列表中找到基础信息
  const resource = RESOURCES.find(r => r.id === Number(id));

  // 按需动态加载详情 JSON
  useEffect(() => {
    if (!resource) return;
    setDetailLoading(true);
    setDetailError(false);
    fetch(`/data/details/${resource.id}.json`)
      .then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((data: ResourceDetail) => {
        setDetail(data);
        setDetailLoading(false);
      })
      .catch(() => {
        setDetailError(true);
        setDetailLoading(false);
      });
  }, [resource?.id]);

  if (!resource) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">资源未找到</h2>
        <button onClick={() => navigate('/downloads')} className="mt-4 text-indigo-600 hover:underline">返回下载中心</button>
      </div>
    );
  }

  const copyToClipboard = (text: string, linkName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(linkName);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // 详情页使用 detail 中的 gallery（更完整），列表的 gallery 仅用于卡片封面
  const displayGallery = detail?.gallery ?? resource.gallery ?? [];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <button
        onClick={() => navigate('/downloads')}
        className="mb-8 flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> 返回列表
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-10">
          <header>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-600 mb-4">
              {resource.category}
            </span>
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight">
              {resource.title}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              {resource.desc}
            </p>
          </header>

          {displayGallery.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2">展示截图</h2>
              <div className="grid grid-cols-1 gap-4">
                {displayGallery.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Preview ${idx}`}
                    className="w-full rounded-2xl shadow-lg object-cover"
                  />
                ))}
              </div>
            </div>
          )}

          <div className="prose prose-indigo dark:prose-invert max-w-none">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4">详细介绍 &amp; 使用指南</h2>
            {detailLoading ? (
              <div className="flex items-center gap-3 py-12 justify-center text-gray-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>加载详情中...</span>
              </div>
            ) : detailError ? (
              <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm text-gray-500">
                暂无详细介绍。
              </div>
            ) : (
              <div
                className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: detail?.detailHtml || '<p>暂无详细介绍。</p>' }}
              />
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-600/20">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">获取资源</h3>
              <div className="space-y-4">
                {resource.links.map((link, idx) => (
                  <div key={idx} className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                    <p className="text-sm font-medium mb-3 opacity-90">{link.name}</p>
                    <div className="flex flex-col gap-2">
                      {link.code && (
                        <button
                          onClick={() => copyToClipboard(link.code!, link.name)}
                          className="flex items-center justify-between w-full px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors text-xs font-mono"
                        >
                          <span className="flex items-center gap-2">
                            提取码: {link.code}
                          </span>
                          {copiedId === link.name ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      )}
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-lg"
                      >
                        立即下载 <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-8 border-t border-white/20 text-xs opacity-70 italic text-center">
                最后更新于: {resource.date}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- 首页 ---
const HomePage = () => (
  <div className="animate-in fade-in duration-700">
    <div className="relative pt-12 pb-24 sm:pt-20 sm:pb-32">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="relative z-10 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-600/10 mb-8 animate-in slide-in-from-left-4">
            <Sparkles className="w-4 h-4" />
            <span>v2.4 全新架构已发布</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-gray-900 mb-8 leading-[1.15]">
            FreeShare <span className="text-indigo-600">Pro</span><br />
            <span className="text-gray-400">自由分享资源门户</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0">
            本网站为一个精品资源枢纽。精选软件、时下流行影视资源、游戏资讯以及各种技术文档，拒绝垃圾广告，每一份资源都经过人工严格审核与实测。
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <Link
              to="/downloads"
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 group"
            >
              <Rocket className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              探索资源库
            </Link>
            <Link
              to="/guide"
              className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-2xl font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
            >
              <BookOpen className="w-5 h-5 text-gray-400" />
              查看指南
            </Link>
          </div>
        </div>

        <div className="relative flex justify-center lg:justify-end pr-0 lg:pr-12">
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-indigo-100 rounded-full blur-[80px] opacity-40 -z-10"></div>
          <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-violet-100 rounded-full blur-[80px] opacity-40 -z-10"></div>

          <div className="relative w-full max-w-[540px] animate-bounce-slow">
            <div className="rounded-[2.5rem] bg-white p-3 shadow-[0_32px_80px_-16px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden">
              <img
                src="https://picsum.photos/seed/freeshare_pro/1000/750"
                alt="应用预览"
                className="w-full h-auto rounded-[2rem] shadow-inner"
              />
            </div>
            <div className="absolute -right-4 bottom-12 sm:-right-8 bg-white/95 backdrop-blur p-5 rounded-2xl shadow-2xl border border-indigo-50 hidden sm:flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Security</div>
                <div className="text-base font-black text-gray-900">100% 验证通过</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="py-24 grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-gray-100/50">
      {[
        { name: '精选资源', desc: '杜绝广告和垃圾内容。仅提供经过验证的高质量工具和学习材料。', icon: Sparkles, color: 'bg-indigo-50 text-indigo-600' },
        { name: '详细文档', desc: '为所有软件提供分步骤的安装和激活指南，确保小白也能轻松上手。', icon: BookOpen, color: 'bg-violet-50 text-violet-600' },
        { name: '极致体验', desc: '基于现代 Web 技术构建，配合智能搜索，极速找到你所需的一切。', icon: BrainCircuit, color: 'bg-emerald-50 text-emerald-600' },
      ].map((feature) => (
        <div key={feature.name} className="group p-8 bg-white/50 rounded-3xl border border-gray-100 hover:border-indigo-200 hover:bg-white hover:shadow-xl transition-all duration-300">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${feature.color}`}>
            <feature.icon className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold mb-3">{feature.name}</h3>
          <p className="text-gray-500 leading-relaxed text-sm sm:text-base">{feature.desc}</p>
        </div>
      ))}
    </div>
  </div>
);

// --- 资源下载页 ---
const DownloadsPage = () => {
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('全部');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResultIds, setAiResultIds] = useState<number[] | null>(null);

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;
  const listTopRef = useRef<HTMLDivElement>(null);

  // 加载 Google 广告
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(RESOURCES.map(r => r.category));
    return ['全部', ...Array.from(cats)];
  }, []);

  // 1. 先进行过滤
  const filteredResources = useMemo(() => {
    let list = RESOURCES;
    if (aiResultIds !== null) {
      list = list.filter(r => aiResultIds.includes(r.id));
    }
    return list.filter(item => {
      const matchSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.desc.toLowerCase().includes(search.toLowerCase());
      const matchCat = activeCat === '全部' || item.category === activeCat;
      return matchSearch && matchCat;
    });
  }, [search, activeCat, aiResultIds]);

  // 2. 根据过滤后的结果计算分页数据
  const totalPages = Math.ceil(filteredResources.length / ITEMS_PER_PAGE);
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredResources.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredResources, currentPage]);

  // 当搜索条件或分类改变时，重置页码
  useEffect(() => {
    setCurrentPage(1);
  }, [search, activeCat, aiResultIds]);

  // 翻页滚动到顶部
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    listTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleAiSearch = async () => {
    if (!search.trim()) return;
    setAiLoading(true);
    try {
      const ids = await findResourcesWithAi(search, RESOURCES);
      setAiResultIds(ids);
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  const clearAiSearch = () => {
    setAiResultIds(null);
    setSearch('');
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500" ref={listTopRef}>
      <header className="mb-12">
        <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">资源库</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
          精准搜索、极速获取。我们为您维护最新、最全的开发资源列表。
        </p>
      </header>

      <div className="flex flex-col md:flex-row gap-6 mb-12 items-center justify-between">
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => { setActiveCat(cat); setAiResultIds(null); }}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeCat === cat
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:max-w-md">
          <input
            type="text"
            className="w-full pl-5 pr-32 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none font-medium"
            placeholder="寻找特定的软件或课程..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAiSearch()}
          />
          <div className="absolute inset-y-2 right-2 flex items-center gap-1">
            {aiResultIds !== null && (
              <button onClick={clearAiSearch} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><X className="w-5 h-5" /></button>
            )}
            <button
              onClick={handleAiSearch}
              disabled={aiLoading}
              className="bg-indigo-600 text-white px-5 h-full rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 text-xs font-bold flex items-center gap-2"
            >
              {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
              搜索
            </button>
          </div>
        </div>
      </div>

      {/* 💡 广告位 (搜索栏下方) */}
      <div className="mb-12 overflow-hidden rounded-3xl bg-white/50 backdrop-blur-sm p-6 border border-gray-100 shadow-sm">
        <ins className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-4626143061930673"
          data-ad-slot="2685968811"
          data-ad-format="auto"
          data-full-width-responsive="true"></ins>
      </div>


      {currentItems.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentItems.map(resource => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>

          {/* 分页组件 */}
          {totalPages > 1 && (
            <div className="mt-16 flex justify-center items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-3 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-indigo-600 hover:border-indigo-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-11 h-11 rounded-xl text-sm font-bold transition-all ${currentPage === pageNum
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-110'
                        : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-3 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-indigo-600 hover:border-indigo-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-400">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">未找到匹配资源</h3>
          <p className="text-gray-500">换个关键词试试，或者尝试使用 AI 搜索。</p>
          <button onClick={clearAiSearch} className="mt-6 text-indigo-600 font-bold hover:underline">清除搜索条件</button>
        </div>
      )}
    </div>
  );
};

// --- 指南页 ---
const GuidePage = () => (
  <div className="max-w-3xl mx-auto py-10 animate-in fade-in duration-500">
    <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
      <h1 className="text-4xl font-black mb-10 tracking-tight">使用指南</h1>
      <div className="space-y-12">
        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-3 text-indigo-600">
            <span className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm">1</span>
            获取下载链接
          </h2>
          <p className="text-gray-600 leading-relaxed font-medium">
            点击资源卡片进入详情页。下载按钮通常需要密码，点击“提取码”后的代码可一键复制。
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-3 text-indigo-600">
            <span className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm">2</span>
            版本验证说明
          </h2>
          <p className="text-gray-600 leading-relaxed font-medium">
            我们分享的每一个资源都经过内部实测。如果是软件类，请务必阅读压缩包内的 `README`。
          </p>
        </section>
      </div>
    </div>
  </div>
);

// --- 布局组件 ---
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-mesh">
      <nav className="sticky top-0 z-50 glass-card border-b border-gray-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="bg-indigo-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tighter">FreeShare</span>
            </Link>

            <div className="hidden md:flex items-center gap-10">
              {[
                { name: '首页', path: '/', icon: Rocket },
                { name: '资源库', path: '/downloads', icon: Download },
                { name: '使用指南', path: '/guide', icon: BookOpen },
              ].map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-bold tracking-tight transition-colors flex items-center gap-2 ${location.pathname === link.path ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-600'
                    }`}
                >
                  <link.icon className="w-4 h-4 opacity-50" />
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="md:hidden">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-500">
                {isMobileMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t p-6 space-y-4 shadow-2xl animate-in slide-in-from-top-4">
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="block font-bold py-2">首页</Link>
            <Link to="/downloads" onClick={() => setIsMobileMenuOpen(false)} className="block font-bold py-2">资源库</Link>
            <Link to="/guide" onClick={() => setIsMobileMenuOpen(false)} className="block font-bold py-2">指南</Link>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {children}
      </main>

      <footer className="py-20 border-t border-gray-100 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-8">
            <Zap className="w-6 h-6 text-indigo-600" />
            <span className="text-xl font-black">FreeShare Pro</span>
          </div>
          <p className="text-gray-400 text-sm mb-10">&copy; {new Date().getFullYear()} 精心打磨的开发者资源门户</p>
          <div className="flex justify-center gap-8 text-gray-300">
            <Rocket className="w-5 h-5 hover:text-indigo-600 transition-colors cursor-pointer" />
            <Sparkles className="w-5 h-5 hover:text-indigo-600 transition-colors cursor-pointer" />
            <Zap className="w-5 h-5 hover:text-indigo-600 transition-colors cursor-pointer" />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/downloads" element={<DownloadsPage />} />
          <Route path="/resource/:id" element={<ResourceDetailPage />} />
          <Route path="/guide" element={<GuidePage />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}
