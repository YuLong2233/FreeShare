
import React, { useState, useMemo, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import { Search, Sparkles, BookOpen, Download, Github, Menu, X, Rocket, Info, ChevronRight, BrainCircuit, Loader2, ArrowLeft, ExternalLink, Copy, Check, Zap } from 'lucide-react';
import { RESOURCES } from './data/resources';
import { ResourceCard } from './components/ResourceCard';
import { Resource, View } from './types';
import { findResourcesWithAi } from './services/geminiService';

// --- 资源详情页 ---
const ResourceDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const resource = RESOURCES.find(r => r.id === Number(id));
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <button 
        onClick={() => navigate('/downloads')}
        className="mb-8 flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> 返回列表
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* 左侧主要内容 */}
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

          {/* 图片展示区 */}
          {resource.gallery && resource.gallery.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2">展示截图</h2>
              <div className="grid grid-cols-1 gap-4">
                {resource.gallery.map((img, idx) => (
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

          {/* 详细图文内容 */}
          <div className="prose prose-indigo dark:prose-invert max-w-none">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4">详细介绍 & 使用指南</h2>
            <div 
              className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: resource.detailHtml || '<p>暂无详细介绍。</p>' }} 
            />
          </div>
        </div>

        {/* 右侧边栏：下载信息 */}
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

            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl p-6">
              <h4 className="font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                <Info className="w-4 h-4 text-indigo-500" /> 注意事项
              </h4>
              <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-3 list-disc pl-4">
                <li>如遇链接失效，请通过 GitHub 提交 Issue 告知我们。</li>
                <li>下载后 24 小时内请自行删除，仅供学习参考。</li>
                <li>软件类资源建议在虚拟机环境下运行测试。</li>
              </ul>
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
    <div className="relative isolate overflow-hidden">
      <div className="mx-auto max-w-7xl pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:pt-20">
        <div className="mx-auto max-w-2xl flex-shrink-0 lg:mx-0 lg:max-w-xl lg:pt-8">
          <div className="mt-24 sm:mt-32 lg:mt-16">
            <a href="#" className="inline-flex space-x-6">
              <span className="rounded-full bg-indigo-600/10 px-3 py-1 text-sm font-semibold leading-6 text-indigo-600 ring-1 ring-inset ring-indigo-600/10">
                最新动态
              </span>
              <span className="inline-flex items-center space-x-2 text-sm font-medium leading-6 text-gray-600">
                <span>刚刚发布了 v2.4 版本</span>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </span>
            </a>
          </div>
          <h1 className="mt-10 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            FreeShare <span className="text-indigo-600">Pro</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            专为高级开发者打造的高端资源枢纽。精选软件、进阶视频课程以及深度文档，助您加速成长。
          </p>
          <div className="mt-10 flex items-center gap-x-6">
            <Link
              to="/downloads"
              className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 flex items-center gap-2"
            >
              <Rocket className="w-4 h-4" />
              探索资源
            </Link>
            <Link to="/guide" className="text-sm font-semibold leading-6 text-gray-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              查看指南 <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
        <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-none lg:flex-none xl:ml-32">
          <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
            <div className="rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
              <img
                src="https://picsum.photos/seed/freeshare/800/600"
                alt="应用截图"
                width={2432}
                height={1442}
                className="w-[32rem] rounded-md shadow-2xl ring-1 ring-gray-900/10"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24 bg-white/50 rounded-3xl mb-20 shadow-inner border border-gray-100">
      <div className="mx-auto max-w-2xl lg:text-center">
        <h2 className="text-base font-semibold leading-7 text-indigo-600 uppercase tracking-wide">为什么选择我们？</h2>
        <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          提供高效交付所需的一切
        </p>
      </div>
      <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
        <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
          {[
            { name: '精选资源', description: '杜绝广告和垃圾内容。仅提供经过验证的高质量工具和学习材料。', icon: Sparkles },
            { name: '详细文档', description: '为所有软件提供分步骤的安装和激活指南。', icon: BookOpen },
            { name: '永久免费', description: '基于 Cloudflare 构建，满怀对开发者社区的热忱提供服务。', icon: Rocket },
          ].map((feature) => (
            <div key={feature.name} className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                <feature.icon className="h-5 w-5 flex-none text-indigo-600" aria-hidden="true" />
                {feature.name}
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                <p className="flex-auto">{feature.description}</p>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  </div>
);

// --- 资源下载页 ---
const DownloadsPage = () => {
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('全部');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResultIds, setAiResultIds] = useState<number[] | null>(null);

  const categories = useMemo(() => {
    const cats = new Set(RESOURCES.map(r => r.category));
    return ['全部', ...Array.from(cats)];
  }, []);

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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">资源下载中心</h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
          浏览我们精心挑选的开发资源。您可以使用搜索栏，或者让我们的 AI 助手帮您精准查找所需内容。
        </p>
      </header>

      <div className="flex flex-col md:flex-row gap-6 mb-12 items-center justify-between">
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => { setActiveCat(cat); setAiResultIds(null); }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeCat === cat 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25' 
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:max-w-md group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-24 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-gray-900 dark:text-white"
            placeholder="搜索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAiSearch()}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 gap-1">
            {aiResultIds !== null && (
              <button 
                onClick={clearAiSearch}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={handleAiSearch}
              disabled={aiLoading}
              className="flex items-center gap-1 bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-xl hover:bg-indigo-100 transition-colors disabled:opacity-50 text-xs font-bold"
            >
              {aiLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <BrainCircuit className="w-3.5 h-3.5" />
              )}
              AI 搜索
            </button>
          </div>
        </div>
      </div>

      {filteredResources.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredResources.map(resource => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
          <Info className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 dark:text-white">未找到相关结果</h3>
          <button 
            onClick={() => {setSearch(''); setActiveCat('全部'); setAiResultIds(null);}} 
            className="mt-6 text-indigo-600 font-semibold hover:underline"
          >
            重置所有过滤器
          </button>
        </div>
      )}
    </div>
  );
};

// --- 指南页 ---
const GuidePage = () => (
  <div className="max-w-3xl mx-auto prose prose-indigo dark:prose-invert py-10 animate-in fade-in duration-500">
    <h1 className="text-4xl font-bold mb-8">使用指南</h1>
    <section className="mb-12">
      <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
        <Download className="w-6 h-6 text-indigo-500" />
        如何下载
      </h2>
      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
        我们的资源托管在高速云平台上。下载步骤如下：
      </p>
      <ul className="list-disc pl-5 mt-4 space-y-2 text-gray-600 dark:text-gray-400">
        <li>点击资源卡片上的 <strong>下载</strong> 按钮。</li>
        <li>如果显示 <strong>提取码</strong>，点击它可自动复制到剪贴板。</li>
        <li>在跳转的页面中输入提取码即可解锁下载链接。</li>
      </ul>
    </section>

    <section className="mb-12">
      <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
        <Sparkles className="w-6 h-6 text-indigo-500" />
        软件激活
      </h2>
      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
        “办公软件”分类中的大多数工具都是预激活的。但是，我们建议：
      </p>
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 my-4">
        <p className="text-sm text-yellow-700 dark:text-yellow-400">
          <strong>注意：</strong> 请务必查看下载压缩包内的 README.txt 文件，了解具体的安装说明和版本更新。
        </p>
      </div>
    </section>

    <section className="mt-20 pt-10 border-t border-gray-100 dark:border-gray-800 text-center text-sm text-gray-500 italic">
      “提供的所有资源仅供教育用途。请通过购买正版软件来支持开发者。”
    </section>
  </div>
);

// --- 布局组件 ---
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: '首页', path: '/', icon: Rocket },
    { name: '资源下载', path: '/downloads', icon: Download },
    { name: '使用指南', path: '/guide', icon: BookOpen },
  ];

  // 每次路由变化滚动到顶部
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 selection:bg-indigo-100 selection:text-indigo-900">
      <nav className="sticky top-0 z-50 glass-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-indigo-600 p-1.5 rounded-lg shadow-lg group-hover:scale-110 transition-transform">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">FreeShare</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${
                    location.pathname === link.path || (link.path === '/downloads' && location.pathname.startsWith('/resource/'))
                    ? 'text-indigo-600' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-indigo-600'
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.name}
                </Link>
              ))}
              <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />
              <a href="https://github.com" target="_blank" className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </a>
            </div>

            <div className="md:hidden">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-600">
                {isMobileMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-100 p-4 space-y-2 shadow-xl animate-in slide-in-from-top-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-50"
              >
                <link.icon className="w-5 h-5 text-indigo-500" />
                {link.name}
              </Link>
            ))}
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {children}
      </main>

      <footer className="bg-white dark:bg-gray-950 border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                <div className="bg-indigo-600 p-1 rounded">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-gray-900 dark:text-white">FreeShare Pro</span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm">
                一个致力于分享高品质内容的开发者社区。
              </p>
            </div>
            
            <div className="flex gap-6">
              <a href="#" className="text-gray-400 hover:text-indigo-600"><Zap className="w-5 h-5" /></a>
              <a href="#" className="text-gray-400 hover:text-indigo-600"><Sparkles className="w-5 h-5" /></a>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-50 dark:border-gray-900 text-center text-xs text-gray-400">
            &copy; {new Date().getFullYear()} FreeShare Pro. 保留所有权利。基于 Gemini AI 构建。
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
