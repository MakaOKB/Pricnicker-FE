import React, { useState, useEffect } from 'react';
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
import { Link } from 'react-router-dom';
import { formatPrice, formatWindow, formatNumber } from '../lib/utils';

const ModelsPage: React.FC = () => {
  const { filters, setFilters, searchQuery, setSearchQuery, addToCompare, compareList } = useAppStore();
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters);

  // 获取模型数据
  const { data: models = [], isLoading, error } = useQuery({
    queryKey: ['models'],
    queryFn: ModelsApi.getModels,
    staleTime: 5 * 60 * 1000, // 5分钟缓存
  });

  // 获取品牌列表
  const { data: brands = [] } = useQuery({
    queryKey: ['brands'],
    queryFn: ModelsApi.getAvailableBrands,
    staleTime: 10 * 60 * 1000, // 10分钟缓存
  });

  // 过滤和搜索模型
  const filteredModels = React.useMemo(() => {
    let result = [...models];

    // 搜索过滤
    if (searchQuery) {
      result = result.filter(model => 
        model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.brand.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 品牌过滤
    if (filters.brands && filters.brands.length > 0) {
      result = result.filter(model => filters.brands!.includes(model.brand));
    }

    // 价格范围过滤
    if (filters.priceRange) {
      const [min, max] = filters.priceRange;
      result = result.filter(model => 
        model.tokens.input >= min && model.tokens.input <= max
      );
    }

    // 窗口大小过滤
    if (filters.windowRange) {
      const [min, max] = filters.windowRange;
      result = result.filter(model => 
        model.window >= min && model.window <= max
      );
    }

    // 排序
    if (filters.sortBy) {
      result.sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (filters.sortBy) {
          case 'price':
            aValue = a.tokens.input;
            bValue = b.tokens.input;
            break;
          case 'window':
            aValue = a.window;
            bValue = b.window;
            break;
          default:
            return 0;
        }

        if (filters.sortOrder === 'desc') {
          return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
        } else {
          return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        }
      });
    }

    return result;
  }, [models, searchQuery, filters]);

  // 计算筛选结果中的唯一品牌数量
  const filteredBrandsCount = React.useMemo(() => {
    const uniqueBrands = new Set(filteredModels.map(model => model.brand));
    return uniqueBrands.size;
  }, [filteredModels]);

  // 应用筛选器
  const applyFilters = () => {
    setFilters(localFilters);
    setShowFilters(false);
  };

  // 重置筛选器
  const resetFilters = () => {
    const emptyFilters: FilterOptions = {};
    setLocalFilters(emptyFilters);
    setFilters(emptyFilters);
    setSearchQuery('');
  };

  // 切换排序
  const toggleSort = (sortBy: FilterOptions['sortBy']) => {
    const newFilters = {
      ...filters,
      sortBy,
      sortOrder: filters.sortBy === sortBy && filters.sortOrder === 'asc' ? 'desc' : 'asc'
    } as FilterOptions;
    setFilters(newFilters);
  };

  if (isLoading) {
    return (
    <div className="min-h-screen bg-background-primary py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <span className="ml-4 text-text-primary">加载模型数据中...</span>
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
            <h1 className="text-2xl font-bold text-text-primary mb-4">加载失败</h1>
            <p className="text-text-secondary mb-4">无法获取模型数据，请稍后重试</p>
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
            AI模型列表
          </h1>
          <p className="text-text-secondary">
            发现 {filteredModels.length} 个模型，来自 {filteredBrandsCount} 个品牌
          </p>
        </div>

        {/* 搜索和筛选栏 */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          {/* 搜索框 */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-muted" />
            <input
              type="text"
              placeholder="搜索模型或品牌..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background-secondary border border-neutral-300 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
            />
          </div>

          {/* 筛选按钮 */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-background-secondary border border-neutral-300 rounded-lg text-text-primary hover:bg-background-tertiary transition-colors"
          >
            <FunnelIcon className="h-5 w-5" />
            筛选
            <ChevronDownIcon className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          {/* 重置按钮 */}
          {(searchQuery || Object.keys(filters).length > 0) && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <XMarkIcon className="h-4 w-4" />
              重置
            </button>
          )}
        </div>

        {/* 筛选面板 */}
        {showFilters && (
          <div className="mb-6 p-4 bg-background-secondary border border-neutral-300 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 品牌筛选 */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  品牌
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {brands.map(brand => (
                    <label key={brand} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={localFilters.brands?.includes(brand) || false}
                        onChange={(e) => {
                          const currentBrands = localFilters.brands || [];
                          if (e.target.checked) {
                            setLocalFilters({
                              ...localFilters,
                              brands: [...currentBrands, brand]
                            });
                          } else {
                            setLocalFilters({
                              ...localFilters,
                              brands: currentBrands.filter(b => b !== brand)
                            });
                          }
                        }}
                        className="mr-2 rounded border-neutral-300 text-primary-600 focus:ring-primary-600"
                      />
                      <span className="text-sm text-text-secondary">{brand}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 排序选项 */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  排序方式
                </label>
                <select
                  value={`${localFilters.sortBy || ''}-${localFilters.sortOrder || 'asc'}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-');
                    setLocalFilters({
                      ...localFilters,
                      sortBy: sortBy as FilterOptions['sortBy'],
                      sortOrder: sortOrder as FilterOptions['sortOrder']
                    });
                  }}
                  className="w-full px-3 py-2 bg-background-primary border border-neutral-300 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-600"
                >
                  <option value="-asc">默认排序</option>
                  <option value="price-asc">价格：低到高</option>
                  <option value="price-desc">价格：高到低</option>
                  <option value="window-asc">窗口：小到大</option>
                  <option value="window-desc">窗口：大到小</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={applyFilters}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                应用筛选
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="px-4 py-2 bg-background-tertiary text-text-secondary rounded-lg hover:bg-neutral-300 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        )}

        {/* 排序标签 */}
        <div className="mb-4 flex flex-wrap gap-2">
          {['price', 'window'].map(sortKey => (
            <button
              key={sortKey}
              onClick={() => toggleSort(sortKey as FilterOptions['sortBy'])}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
                filters.sortBy === sortKey
                  ? 'bg-primary-600 text-white'
                  : 'bg-background-secondary text-text-secondary hover:bg-background-tertiary'
              }`}
            >
              {sortKey === 'price' && '价格'}
              {sortKey === 'window' && '窗口大小'}
              {filters.sortBy === sortKey && (
                filters.sortOrder === 'asc' ? 
                  <ArrowUpIcon className="h-3 w-3" /> : 
                  <ArrowDownIcon className="h-3 w-3" />
              )}
            </button>
          ))}
        </div>

        {/* 模型网格 */}
        {filteredModels.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-secondary text-lg">没有找到匹配的模型</p>
            <p className="text-text-muted mt-2">尝试调整搜索条件或筛选器</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredModels.map((model) => (
              <ModelCard 
                key={model.id} 
                model={model} 
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

// 模型卡片组件
interface ModelCardProps {
  model: Model;
  onAddToCompare: () => void;
  isInCompare: boolean;
}

const ModelCard: React.FC<ModelCardProps> = ({ model, onAddToCompare, isInCompare }) => {
  return (
    <div className="bg-background-secondary border border-neutral-300 rounded-lg p-6 hover:border-primary-600 transition-colors shadow-soft hover:shadow-medium">
      {/* 品牌标签 */}
      <div className="flex items-center justify-between mb-3">
        <span className="inline-block px-2 py-1 bg-primary-600/20 text-primary-600 text-xs font-medium rounded-full">
          {model.brand}
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
        {model.name}
      </h3>

      {/* 价格信息 */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-text-secondary text-sm">输入价格</span>
          <span className="text-text-primary font-medium">
            {formatPrice(model.tokens.input, model.tokens.unit)}/1K tokens
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-text-secondary text-sm">输出价格</span>
          <span className="text-text-primary font-medium">
            {formatPrice(model.tokens.output, model.tokens.unit)}/1K tokens
          </span>
        </div>
      </div>

      {/* 技术参数 */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-text-secondary text-sm">上下文窗口</span>
          <span className="text-text-primary font-medium">
            {formatWindow(model.window)}
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
      
      {/* 推荐提供商信息 */}
      {model.recommended_provider && model.providers && (
        <div className="mb-4 p-3 bg-orange-primary/10 border border-orange-primary/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-primary rounded-full"></div>
              <span className="text-text-secondary text-xs">推荐提供商</span>
            </div>
            <span className="text-orange-primary text-xs font-medium">
              {model.providers.find(p => p.name === model.recommended_provider)?.display_name || model.recommended_provider}
            </span>
          </div>
          {(() => {
            const provider = model.providers.find(p => p.name === model.recommended_provider);
            return provider && (
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-text-muted">可靠性: {provider.reliability_score.toFixed(1)}/10</span>
                <span className="text-text-muted">响应: {provider.response_time_ms}ms</span>
              </div>
            );
          })()}
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex gap-2">
        <Link
          to={`/models/${model.id}`}
          className="flex-1 bg-orange-primary text-white text-center py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
        >
          查看详情
        </Link>
      </div>
    </div>
  );
};

export default ModelsPage;