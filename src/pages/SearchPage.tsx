import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ModelsApi } from '../api/models';
import { Model, FilterOptions } from '../types';
import { useAppStore } from '../store';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  ChevronDownIcon,
  XMarkIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const brand = searchParams.get('brand') || '';
  
  const { addToCompare, compareList } = useAppStore();
  const [localQuery, setLocalQuery] = useState(query);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<FilterOptions['sortBy']>('name');
  const [sortOrder, setSortOrder] = useState<FilterOptions['sortOrder']>('asc');

  // 获取模型数据
  const { data: allModels = [], isLoading, error } = useQuery({
    queryKey: ['models'],
    queryFn: ModelsApi.getModels,
    staleTime: 5 * 60 * 1000,
  });

  // 获取品牌列表
  const { data: brands = [] } = useQuery({
    queryKey: ['brands'],
    queryFn: ModelsApi.getAvailableBrands,
    staleTime: 10 * 60 * 1000,
  });

  // 搜索和过滤模型
  const searchResults = React.useMemo(() => {
    let results = [...allModels];

    // 文本搜索
    if (query) {
      results = results.filter(model => 
        model.name.toLowerCase().includes(query.toLowerCase()) ||
        model.brand.toLowerCase().includes(query.toLowerCase())
      );
    }

    // 品牌过滤
    if (brand) {
      results = results.filter(model => 
        model.brand.toLowerCase() === brand.toLowerCase()
      );
    }

    // 排序
    if (sortBy) {
      results.sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (sortBy) {
          case 'price':
            aValue = a.tokens.input;
            bValue = b.tokens.input;
            break;
          case 'window':
            aValue = a.window;
            bValue = b.window;
            break;
          case 'name':
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
          case 'brand':
            aValue = a.brand.toLowerCase();
            bValue = b.brand.toLowerCase();
            break;
          default:
            return 0;
        }

        if (sortOrder === 'desc') {
          return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
        } else {
          return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        }
      });
    }

    return results;
  }, [allModels, query, brand, sortBy, sortOrder]);

  // 处理搜索
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (localQuery.trim()) {
      newParams.set('q', localQuery.trim());
    } else {
      newParams.delete('q');
    }
    setSearchParams(newParams);
  };

  // 处理品牌筛选
  const handleBrandFilter = (selectedBrand: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (selectedBrand && selectedBrand !== brand) {
      newParams.set('brand', selectedBrand);
    } else {
      newParams.delete('brand');
    }
    setSearchParams(newParams);
  };

  // 清除所有筛选
  const clearFilters = () => {
    setSearchParams({});
    setLocalQuery('');
  };

  // 切换排序
  const toggleSort = (newSortBy: FilterOptions['sortBy']) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-primary py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <span className="ml-4 text-text-primary">搜索中...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background-primary py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-text-primary mb-4">搜索失败</h1>
            <p className="text-text-secondary mb-4">无法获取搜索结果，请稍后重试</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              重新加载
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-primary py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            搜索结果
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-text-secondary">
            {query && (
              <span>关键词: "{query}"</span>
            )}
            {brand && (
              <span className="bg-primary-600/20 text-primary-600 px-2 py-1 rounded-full text-sm">
                品牌: {brand}
              </span>
            )}
            <span>• 找到 {searchResults.length} 个结果</span>
          </div>
        </div>

        {/* 搜索栏 */}
        <div className="mb-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-muted" />
              <input
                type="text"
                placeholder="搜索模型或品牌..."
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background-secondary border border-neutral-300 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              搜索
            </button>
            {(query || brand) && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2 bg-background-secondary border border-neutral-300 rounded-lg text-text-primary hover:bg-background-tertiary transition-colors"
              >
                <XMarkIcon className="h-4 w-4" />
                清除
              </button>
            )}
          </form>
        </div>

        {/* 品牌筛选器 */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <FunnelIcon className="h-5 w-5 text-text-secondary" />
            <span className="text-text-secondary font-medium">按品牌筛选:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleBrandFilter('')}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                !brand
                  ? 'bg-primary-600 text-white'
                  : 'bg-background-secondary text-text-secondary hover:bg-background-tertiary'
              }`}
            >
              全部
            </button>
            {brands.map(brandName => (
              <button
                key={brandName}
                onClick={() => handleBrandFilter(brandName)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  brand === brandName
                    ? 'bg-primary-600 text-white'
                    : 'bg-background-secondary text-text-secondary hover:bg-background-tertiary'
                }`}
              >
                {brandName}
              </button>
            ))}
          </div>
        </div>

        {/* 排序选项 */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {['price', 'window', 'name', 'brand'].map(sortKey => (
              <button
                key={sortKey}
                onClick={() => toggleSort(sortKey as FilterOptions['sortBy'])}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
                  sortBy === sortKey
                    ? 'bg-primary-600 text-white'
                    : 'bg-background-secondary text-text-secondary hover:bg-background-tertiary'
                }`}
              >
                {sortKey === 'price' && '价格'}
                {sortKey === 'window' && '窗口大小'}
                {sortKey === 'name' && '模型名称'}
                {sortKey === 'brand' && '品牌'}
                {sortBy === sortKey && (
                  sortOrder === 'asc' ? 
                    <ArrowUpIcon className="h-3 w-3" /> : 
                    <ArrowDownIcon className="h-3 w-3" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 搜索结果 */}
        {searchResults.length === 0 ? (
          <div className="text-center py-12">
            <MagnifyingGlassIcon className="h-16 w-16 text-text-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-text-primary mb-2">没有找到匹配的结果</h3>
            <p className="text-text-secondary mb-4">
              {query || brand ? '尝试调整搜索条件或筛选器' : '请输入搜索关键词'}
            </p>
            <Link
              to="/models"
              className="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              浏览所有模型
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((model) => (
              <SearchResultCard 
                key={model.id} 
                model={model} 
                searchQuery={query}
                onAddToCompare={() => addToCompare(model)}
                isInCompare={compareList.some(m => m.id === model.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// 搜索结果卡片组件
interface SearchResultCardProps {
  model: Model;
  searchQuery: string;
  onAddToCompare: () => void;
  isInCompare: boolean;
}

const SearchResultCard: React.FC<SearchResultCardProps> = ({ 
  model, 
  searchQuery, 
  onAddToCompare, 
  isInCompare 
}) => {
  // 高亮搜索关键词
  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-primary-600/30 text-primary-600 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <div className="bg-background-secondary border border-neutral-300 rounded-lg p-6 hover:border-primary-600 transition-colors">
      {/* 品牌标签 */}
      <div className="flex items-center justify-between mb-3">
        <span className="inline-block px-2 py-1 bg-primary-600/20 text-primary-600 text-xs font-medium rounded-full">
          {highlightText(model.brand, searchQuery)}
        </span>
        <button
          onClick={onAddToCompare}
          disabled={isInCompare}
          className={`text-xs px-2 py-1 rounded transition-colors ${
            isInCompare 
              ? 'bg-green-500/20 text-green-400 cursor-not-allowed'
              : 'bg-background-tertiary text-text-secondary hover:bg-primary-600 hover:text-white'
          }`}
        >
          {isInCompare ? '已添加' : '对比'}
        </button>
      </div>

      {/* 模型名称 */}
      <h3 className="text-lg font-semibold text-text-primary mb-3 line-clamp-2">
        {highlightText(model.name, searchQuery)}
      </h3>

      {/* 价格信息 */}
      <div className="space-y-2 mb-4">
        {model.providers && model.providers.length > 0 && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary text-sm">最低输入价格</span>
              <span className="text-text-primary font-medium">
                {Math.min(...model.providers.map(p => p.tokens.input))} {model.providers[0].tokens.unit}/1K tokens
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary text-sm">最低输出价格</span>
              <span className="text-text-primary font-medium">
                {Math.min(...model.providers.map(p => p.tokens.output))} {model.providers[0].tokens.unit}/1K tokens
              </span>
            </div>
          </>
        )}
      </div>

      {/* 技术参数 */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-text-secondary text-sm">上下文窗口</span>
          <span className="text-text-primary font-medium">
            {model.window.toLocaleString()}
          </span>
        </div>
        {model.data_amount && (
          <div className="flex justify-between items-center">
            <span className="text-text-secondary text-sm">训练数据量</span>
            <span className="text-text-primary font-medium">
              {model.data_amount}B
            </span>
          </div>
        )}
      </div>
      
      {/* 提供商数量信息 */}
      {model.providers && model.providers.length > 0 && (
        <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-text-secondary text-xs">可用提供商</span>
            </div>
            <span className="text-blue-400 text-xs font-medium">
              {model.providers.length} 个提供商
            </span>
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex gap-2">
        <Link
          to={`/models/${model.id}`}
          className="flex-1 bg-primary-600 text-white text-center py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
        >
          查看详情
        </Link>
      </div>
    </div>
  );
};

export default SearchPage;