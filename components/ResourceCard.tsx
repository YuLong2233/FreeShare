
import React from 'react';
import { Resource } from '../types';
import { Calendar, Tag, ExternalLink, Copy, Check, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ResourceCardProps {
  resource: Resource;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({ resource }) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const navigate = useNavigate();

  const copyToClipboard = (e: React.MouseEvent, text: string, linkName: string) => {
    e.stopPropagation(); // 防止触发卡片点击事件
    navigator.clipboard.writeText(text);
    setCopiedId(linkName);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 防止跳转到详情页
  };

  return (
    <div 
      onClick={() => navigate(`/resource/${resource.id}`)}
      className="group cursor-pointer bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative"
    >
      <div className="flex justify-between items-start mb-4">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
          {resource.category}
        </span>
        <div className="flex items-center text-xs text-gray-400 dark:text-gray-500">
          <Calendar className="w-3 h-3 mr-1" />
          {resource.date}
        </div>
      </div>

      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
        {resource.title}
      </h3>
      
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 line-clamp-2 min-h-[40px]">
        {resource.desc}
      </p>

      {resource.tags && (
        <div className="flex flex-wrap gap-2 mb-6">
          {resource.tags.map(tag => (
            <span key={tag} className="inline-flex items-center text-[10px] uppercase tracking-wider font-bold text-gray-400 bg-gray-100 dark:bg-gray-700 dark:text-gray-400 px-2 py-0.5 rounded">
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
        <span className="text-xs font-semibold text-indigo-600 flex items-center gap-1 group-hover:gap-2 transition-all">
          查看详情 <ArrowRight className="w-3 h-3" />
        </span>
        <div className="flex gap-2">
           {resource.links[0] && (
             <a
                href={resource.links[0].url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleDownloadClick}
                className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-xs font-semibold shadow-sm"
              >
                快速下载
                <ExternalLink className="w-3 h-3" />
              </a>
           )}
        </div>
      </div>
    </div>
  );
};
