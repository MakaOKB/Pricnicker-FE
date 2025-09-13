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
  ArrowDownIcon,
  SparklesIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CpuChipIcon,
  FireIcon,
  GiftIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { formatPrice, formatWindow, formatNumber } from '../lib/utils';

// 分类定义
type CategoryType = 'recommended' | 'free' | 'economic' | 'standard' | 'premium' | 'text' | 'code' | 'multimodal' | 'chat';

interface Category {
  id: CategoryType;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
  filter: (models: Model[]) => Model[];
}

const ModelsPage: React.FC = () => {
  const { searchQuery, setSearchQuery } = useAppStore();
  const [showFilters, setShowFilters] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryType>('recommended');
  const [filters, setFilters] = useState<FilterOptions>({});

  // 获取模型数据
  const { data: models = [], isLoading, error } = useQuery({
    queryKey: ['models'],
    queryFn: ModelsApi.getModels,
    staleTime: 5 * 60 * 1000, // 5分钟缓存
  });

  // 从模型数据中提取品牌和提供商列表
  const brands = React.useMemo(() => {
    const uniqueBrands = [...new Set(models.map(model => model.brand))];
    return uniqueBrands.sort();
  }, [models]);

  const providers = React.useMemo(() => {
    const allProviders = models.flatMap(model => model.providers || []);
    const uniqueProviders = allProviders.reduce((acc, provider) => {
      if (!acc.find(p => p.name === provider.name)) {
        acc.push({
          name: provider.name,
          display_name: provider.display_name || provider.name
        });
      }
      return acc;
    }, [] as { name: string; display_name: string }[]);
    return uniqueProviders.sort((a, b) => a.display_name.localeCompare(b.display_name));
  }, [models]);

  // 定义分类
  const categories: Category[] = [
    {
      id: 'recommended',
      name: '所有',
      icon: SparklesIcon,
      description: '显示所有可用模型',
      filter: (models) => {
        // 按名称排序显示所有模型
        return models.sort((a, b) => a.name.localeCompare(b.name));
      }
    },
    {
      id: 'free',
      name: '免费模型',
      icon: GiftIcon,
      description: '完全免费使用的AI模型',
      filter: (models) => {
        return models.filter(model => {
          if (!model.providers?.length) return false;
          
          const prices = model.providers.map(p => {
            const inputPrice = p.tokens?.input;
            if (inputPrice === undefined || inputPrice === null) {
              return Infinity;
            }
            return Number(inputPrice);
          });
          
          const minPrice = Math.min(...prices);
          return minPrice <= 0.001; // ≤0.001元视为免费
        }).sort((a, b) => {
          // 按窗口大小排序，窗口大的优先
          return b.window - a.window;
        });
      }
    },
    {
      id: 'economic',
      name: '经济型',
      icon: CurrencyDollarIcon,
      description: '价格实惠的模型',
      filter: (models) => {
        return models.filter(model => {
          if (!model.providers?.length) return false;
          
          const prices = model.providers.map(p => {
            const inputPrice = p.tokens?.input;
            if (inputPrice === undefined || inputPrice === null) {
              return Infinity;
            }
            return Number(inputPrice);
          });
          
          const minPrice = Math.min(...prices);
          // 使用更严格的条件：价格必须 >= 0.01 且 <= 1元
          return minPrice >= 0.01 && minPrice <= 1;
        }).sort((a, b) => {
          const aPrice = Math.min(...a.providers!.map(p => p.tokens.input));
          const bPrice = Math.min(...b.providers!.map(p => p.tokens.input));
          return aPrice - bPrice;
        });
      }
    },
    {
      id: 'standard',
      name: '标准型',
      icon: ChartBarIcon,
      description: '性能均衡的模型',
      filter: (models) => {
        return models.filter(model => {
          if (!model.providers?.length) return false;
          
          const prices = model.providers.map(p => {
            const inputPrice = p.tokens?.input;
            if (inputPrice === undefined || inputPrice === null) {
              return Infinity;
            }
            return Number(inputPrice);
          });
          
          const minPrice = Math.min(...prices);
          return minPrice > 1 && minPrice <= 10; // 1 < 价格 ≤ 10元为标准型
        }).sort((a, b) => {
          const aPrice = Math.min(...a.providers!.map(p => p.tokens.input));
          const bPrice = Math.min(...b.providers!.map(p => p.tokens.input));
          return aPrice - bPrice;
        });
      }
    },
    {
      id: 'premium',
      name: '高端型',
      icon: FireIcon,
      description: '顶级性能模型',
      filter: (models) => {
        return models.filter(model => {
          if (!model.providers?.length) return false;
          
          const prices = model.providers.map(p => {
            const inputPrice = p.tokens?.input;
            if (inputPrice === undefined || inputPrice === null) {
              return Infinity;
            }
            return Number(inputPrice);
          });
          
          const minPrice = Math.min(...prices);
          return minPrice > 10; // > 10元为高端型
        }).sort((a, b) => {
          const aPrice = Math.min(...a.providers!.map(p => p.tokens.input));
          const bPrice = Math.min(...b.providers!.map(p => p.tokens.input));
          return aPrice - bPrice;
        });
      }
    },
    {
      id: 'text',
      name: '文本生成',
      icon: CpuChipIcon,
      description: '专注文本处理',
      filter: (models) => {
        return models.filter(model => 
          model.name.toLowerCase().includes('text') ||
          model.name.toLowerCase().includes('gpt') ||
          model.name.toLowerCase().includes('claude') ||
          model.name.toLowerCase().includes('llama')
        ).sort((a, b) => a.name.localeCompare(b.name));
      }
    }
  ];

  // 获取当前分类的模型
  const currentCategory = categories.find(cat => cat.id === activeCategory) || categories[0];
  
  // 应用分类、筛选和搜索的模型过滤
  const filteredModels = React.useMemo(() => {
    let result = [...models];

    // 1. 首先应用分类过滤
    result = currentCategory.filter(result);

    // 2. 然后在分类结果基础上应用搜索过滤
    if (searchQuery) {
      result = result.filter(model => 
        model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.brand.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 3. 在分类和搜索结果基础上应用品牌筛选
    if (filters.brands && filters.brands.length > 0) {
      result = result.filter(model => filters.brands!.includes(model.brand));
    }

    // 4. 在前面结果基础上应用提供商筛选
    if (filters.providers && filters.providers.length > 0) {
      result = result.filter(model => {
        if (!model.providers || model.providers.length === 0) return false;
        return model.providers.some(provider => filters.providers!.includes(provider.name));
      });
    }

    // 应用排序
    if (filters.sortBy) {
      result.sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (filters.sortBy) {
          case 'price':
            aValue = a.providers && a.providers.length > 0 ? Math.min(...a.providers.map(p => p.tokens.input)) : 0;
            bValue = b.providers && b.providers.length > 0 ? Math.min(...b.providers.map(p => p.tokens.input)) : 0;
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
  }, [models, searchQuery, currentCategory, filters]);

  // 计算筛选结果中的唯一品牌数量
  const filteredBrandsCount = React.useMemo(() => {
    const uniqueBrands = new Set(filteredModels.map(model => model.brand));
    return uniqueBrands.size;
  }, [filteredModels]);

  // 重置搜索
  const resetSearch = () => {
    setSearchQuery('');
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
            AI模型智能分类
          </h1>
          <p className="text-text-secondary">
            通过智能分类快速找到适合的模型
          </p>
        </div>

        {/* 分类导航 */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3 mb-6">
            {categories.map((category) => {
              const IconComponent = category.icon;
              const isActive = activeCategory === category.id;
              const categoryModels = category.filter(models);
              
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center gap-3 px-6 py-4 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-medium transform -translate-y-1'
                      : 'bg-background-secondary text-text-secondary hover:bg-background-tertiary hover:text-text-primary border border-neutral-300 hover:border-primary-300'
                  }`}
                >
                  <IconComponent className={`h-5 w-5 ${
                    isActive ? 'text-white' : 'text-primary-600'
                  }`} />
                  <div className="text-left">
                    <div className="font-semibold text-sm">{category.name}</div>
                    <div className={`text-xs ${
                      isActive ? 'text-primary-100' : 'text-text-muted'
                    }`}>
                      {categoryModels.length} 个模型
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          
          {/* 当前分类描述 */}
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <currentCategory.icon className="h-6 w-6 text-primary-600" />
              <div>
                <h3 className="font-semibold text-text-primary">{currentCategory.name}</h3>
                <p className="text-sm text-text-secondary">{currentCategory.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 搜索和筛选栏 */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-muted" />
            <input
              type="text"
              placeholder="在当前分类中搜索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-background-secondary border border-neutral-300 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={resetSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-secondary"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          {/* 筛选按钮 */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors font-medium ${
              showFilters || Object.keys(filters).length > 0
                ? 'bg-primary-600 text-white'
                : 'bg-background-secondary border border-neutral-300 text-text-primary hover:bg-background-tertiary'
            }`}
          >
            <FunnelIcon className="h-5 w-5" />
            筛选
            {Object.keys(filters).length > 0 && (
              <span className="bg-white text-primary-600 text-xs px-2 py-1 rounded-full font-semibold">
                {Object.keys(filters).length}
              </span>
            )}
            <ChevronDownIcon className={`h-4 w-4 transition-transform ${
              showFilters ? 'rotate-180' : ''
            }`} />
          </button>
        </div>

        {/* 筛选面板 */}
        {showFilters && (
          <div className="mb-6 bg-background-secondary border border-neutral-300 rounded-lg p-6 shadow-soft">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 品牌筛选 */}
              <div>
                <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center">
                  <div className="w-1 h-4 bg-primary-600 rounded-full mr-2"></div>
                  品牌筛选
                </h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {brands.map(brand => (
                    <label key={brand} className="flex items-center hover:bg-background-tertiary p-1 rounded">
                      <input
                        type="checkbox"
                        checked={filters.brands?.includes(brand) || false}
                        onChange={(e) => {
                          const currentBrands = filters.brands || [];
                          if (e.target.checked) {
                            setFilters({
                              ...filters,
                              brands: [...currentBrands, brand]
                            });
                          } else {
                            setFilters({
                              ...filters,
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

              {/* 提供商筛选 */}
              <div>
                <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center">
                  <div className="w-1 h-4 bg-secondary-600 rounded-full mr-2"></div>
                  提供商筛选
                </h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {providers.map(provider => (
                    <label key={provider.name} className="flex items-center hover:bg-background-tertiary p-1 rounded">
                      <input
                        type="checkbox"
                        checked={filters.providers?.includes(provider.name) || false}
                        onChange={(e) => {
                          const currentProviders = filters.providers || [];
                          if (e.target.checked) {
                            setFilters({
                              ...filters,
                              providers: [...currentProviders, provider.name]
                            });
                          } else {
                            setFilters({
                              ...filters,
                              providers: currentProviders.filter(p => p !== provider.name)
                            });
                          }
                        }}
                        className="mr-2 rounded border-neutral-300 text-secondary-600 focus:ring-secondary-600"
                      />
                      <span className="text-sm text-text-secondary">{provider.display_name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 排序选项 */}
              <div>
                <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center">
                  <div className="w-1 h-4 bg-green-600 rounded-full mr-2"></div>
                  排序方式
                </h4>
                <select
                  value={`${filters.sortBy || ''}-${filters.sortOrder || 'asc'}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-');
                    setFilters({
                      ...filters,
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
            
            {/* 筛选操作按钮 */}
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-text-muted">
                {Object.keys(filters).length > 0 && (
                  <span>已选择 {Object.keys(filters).length} 个筛选条件</span>
                )}
              </div>
              <div className="flex gap-3">
                {Object.keys(filters).length > 0 && (
                  <button
                    onClick={() => setFilters({})}
                    className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors text-sm font-medium"
                  >
                    清除筛选
                  </button>
                )}
                <button
                  onClick={() => setShowFilters(false)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                >
                  完成
                </button>
              </div>
            </div>
          </div>
        )}



        {/* 结果统计 */}
        <div className="mb-6">
          <div className="flex items-center justify-between py-4 border-b border-neutral-200">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-bold text-text-primary">{currentCategory.name}模型</h2>
              <span className="px-3 py-1 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full">
                {filteredModels.length} 个模型
              </span>
              {searchQuery && (
                <span className="px-2 py-1 bg-secondary-100 text-secondary-700 text-xs rounded-full">
                  搜索: "{searchQuery}"
                </span>
              )}
            </div>
            {filteredModels.length > 0 && (
              <div className="text-sm text-text-secondary">
                来自 {filteredBrandsCount} 个品牌
              </div>
            )}
          </div>
        </div>

        {/* 模型网格 */}
        {filteredModels.length === 0 ? (
          <div className="text-center py-16 bg-background-secondary rounded-xl border border-neutral-200">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-neutral-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 6.306a7.962 7.962 0 00-6 0m6 0V5a2 2 0 00-2-2H9a2 2 0 00-2 2v1.306" />
                </svg>
              </div>
              <p className="text-text-secondary text-lg font-medium mb-2">没有找到匹配的模型</p>
              <p className="text-text-muted mb-4">
                {searchQuery ? '尝试调整搜索关键词或切换其他分类' : '该分类暂无模型，请尝试其他分类'}
              </p>
              <div className="flex gap-3 justify-center">
                {searchQuery && (
                  <button
                    onClick={resetSearch}
                    className="px-4 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors text-sm font-medium"
                  >
                    清除搜索
                  </button>
                )}
                <button
                  onClick={() => setActiveCategory('recommended')}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                >
                  查看所有模型
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredModels.map((model, index) => (
              <div
                key={`${model.brand}-${model.name}-${index}`}
                className="animate-fade-in"
                style={{ animationDelay: `${(index % 9) * 0.1}s` }}
              >
                <ModelCard 
                  model={model}
                />
              </div>
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
}

const ModelCard: React.FC<ModelCardProps> = ({ model }) => {
  return (
    <div className="bg-background-secondary border border-neutral-300 rounded-xl p-6 hover:border-primary-600 transition-all duration-300 shadow-soft hover:shadow-strong transform hover:-translate-y-1">
      {/* 品牌标签和模型名称 */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="inline-block px-3 py-1 bg-gradient-to-r from-primary-600/20 to-primary-700/20 text-primary-600 text-xs font-semibold rounded-full border border-primary-600/30">
            {model.brand}
          </span>
        </div>
        <h3 className="text-lg font-bold text-text-primary mb-2 line-clamp-2 leading-tight">
          {model.name}
        </h3>
        <div className="h-px bg-gradient-to-r from-neutral-300 via-neutral-200 to-transparent mb-4"></div>
      </div>

      {/* 价格信息区域 */}
      {model.providers && model.providers.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center">
            <div className="w-1 h-4 bg-primary-600 rounded-full mr-2"></div>
            价格信息
          </h4>
          <div className="bg-gradient-to-br from-secondary-50 to-secondary-100 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-text-secondary text-sm font-medium">最低输入价格</span>
              <span className="text-text-primary font-bold text-sm">
                {formatPrice(Math.min(...model.providers.map(p => p.tokens.input)), model.providers[0].tokens.unit)}
                <span className="text-text-muted text-xs ml-1">/1K tokens</span>
              </span>
            </div>
            <div className="h-px bg-neutral-200"></div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary text-sm font-medium">最低输出价格</span>
              <span className="text-text-primary font-bold text-sm">
                {formatPrice(Math.min(...model.providers.map(p => p.tokens.output)), model.providers[0].tokens.unit)}
                <span className="text-text-muted text-xs ml-1">/1K tokens</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 技术参数区域 */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center">
          <div className="w-1 h-4 bg-secondary-600 rounded-full mr-2"></div>
          技术参数
        </h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2">
            <span className="text-text-secondary text-sm font-medium">上下文窗口</span>
            <span className="text-text-primary font-semibold text-sm bg-background-tertiary px-2 py-1 rounded-md">
              {formatWindow(model.window)}
            </span>
          </div>
          {model.data_amount && (
            <>
              <div className="h-px bg-neutral-200"></div>
              <div className="flex justify-between items-center py-2">
                <span className="text-text-secondary text-sm font-medium">训练数据量</span>
                <span className="text-text-primary font-semibold text-sm bg-background-tertiary px-2 py-1 rounded-md">
                  {model.data_amount}B tokens
                </span>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* 提供商信息区域 */}
      {model.providers && model.providers.length > 0 && (
        <div className="mb-6">
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                <span className="text-primary-700 text-xs font-semibold">可用提供商</span>
              </div>
              <span className="text-primary-800 text-xs font-bold bg-primary-200 px-2 py-1 rounded-full">
                {model.providers.length} 个
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="pt-2 border-t border-neutral-200">
        <Link
          to={`/models/${model.id}`}
          className="block w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white text-center py-3 px-4 rounded-lg transition-all duration-200 text-sm font-semibold shadow-medium hover:shadow-strong transform hover:-translate-y-0.5"
        >
          查看详情
        </Link>
      </div>
    </div>
  );
};

export default ModelsPage;