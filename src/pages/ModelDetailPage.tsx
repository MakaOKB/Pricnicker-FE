import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ModelsApi } from '../api/models';
import { Model, PriceCalculatorInput, PriceCalculatorResult } from '../types';
import { useAppStore } from '../store';
import { 
  ArrowLeftIcon,
  CalculatorIcon,
  ScaleIcon,
  ChartBarIcon,
  CpuChipIcon,
  DocumentTextIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ServerIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import { formatPrice, formatWindow, getCurrencySymbol } from '../lib/utils';

const ModelDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCompare, compareList } = useAppStore();
  
  const [inputTokens, setInputTokens] = useState<number>(1000);
  const [outputTokens, setOutputTokens] = useState<number>(1000);

  // 获取模型详情
  const { data: model, isLoading, error } = useQuery({
    queryKey: ['model', id],
    queryFn: () => ModelsApi.getModelById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  // 获取相似模型推荐
  const { data: featuredModels = [] } = useQuery({
    queryKey: ['featured-models'],
    queryFn: () => ModelsApi.getFeaturedModels(4),
    staleTime: 10 * 60 * 1000,
  });

  // 计算价格
  const calculatePrice = (): PriceCalculatorResult | null => {
    if (!model || !model.tokens) return null;
    
    const inputCost = (inputTokens / 1000) * model.tokens.input;
    const outputCost = (outputTokens / 1000) * model.tokens.output;
    const totalCost = inputCost + outputCost;
    
    return {
      inputCost,
      outputCost,
      totalCost,
      unit: model.tokens.unit
    };
  };

  const priceResult = calculatePrice();
  const isInCompare = model ? compareList.some(m => m.id === model.id) : false;
  const similarModels = featuredModels.filter(m => m.id !== model?.id).slice(0, 3);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-primary py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <span className="ml-4 text-text-primary">加载模型详情中...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !model) {
    return (
      <div className="min-h-screen bg-background-primary py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-text-primary mb-4">模型未找到</h1>
            <p className="text-text-secondary mb-4">请检查模型ID是否正确</p>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => navigate(-1)}
                className="bg-background-secondary text-text-primary px-4 py-2 rounded-lg hover:bg-background-tertiary transition-colors"
              >
                返回上页
              </button>
              <Link
                to="/models"
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                浏览所有模型
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-primary py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 返回按钮 */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            返回
          </button>
        </div>

        {/* 模型基本信息 */}
        <div className="bg-background-secondary border border-neutral-300 rounded-lg p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              {/* 品牌标签 */}
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-primary-600/20 text-primary-600 text-sm font-medium rounded-full">
                  {model.brand}
                </span>
              </div>
              
              {/* 模型名称 */}
              <h1 className="text-3xl font-bold text-text-primary mb-4">
                {model.name}
              </h1>
              
              {/* 基本参数 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <ClockIcon className="h-5 w-5 text-text-muted" />
                  <div>
                    <p className="text-text-secondary text-sm">上下文窗口</p>
                    <p className="text-text-primary font-semibold">
                      {formatWindow(model.window)} tokens
                    </p>
                  </div>
                </div>
                
                {model.data_amount && (
                  <div className="flex items-center gap-3">
                    <DocumentTextIcon className="h-5 w-5 text-text-muted" />
                    <div>
                      <p className="text-text-secondary text-sm">训练数据量</p>
                      <p className="text-text-primary font-semibold">
                        {model.data_amount}B parameters
                      </p>
                    </div>
                  </div>
                )}
                
                {model.tokens && (
                  <div className="flex items-center gap-3">
                    <CurrencyDollarIcon className="h-5 w-5 text-text-muted" />
                    <div>
                      <p className="text-text-secondary text-sm">价格单位</p>
                      <p className="text-text-primary font-semibold">
                        {model.tokens.unit}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* 操作按钮 */}
            <div className="flex flex-col gap-3 lg:w-48">
              <button
                onClick={() => addToCompare(model)}
                disabled={isInCompare}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                  isInCompare
                    ? 'bg-green-500/20 text-green-400 cursor-not-allowed'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
              >
                {isInCompare ? '已添加到对比' : '添加到对比'}
              </button>
              
              <Link
                to="/compare"
                className="w-full py-2 px-4 bg-background-tertiary text-text-primary text-center rounded-lg hover:bg-neutral-300 transition-colors"
              >
                查看对比
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 价格信息 */}
          <div className="lg:col-span-2">
            {model.tokens && (
              <div className="bg-background-secondary border border-neutral-300 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold text-text-primary mb-6 flex items-center gap-2">
                  <CurrencyDollarIcon className="h-6 w-6" />
                  价格信息
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-background-primary rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-text-secondary text-sm">输入价格</span>
                    </div>
                    <p className="text-2xl font-bold text-text-primary">
                      {formatPrice(model.tokens.input, model.tokens.unit)}
                    </p>
                    <p className="text-text-muted text-sm">
                      /1K tokens
                    </p>
                  </div>
                  
                  <div className="bg-background-primary rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-text-secondary text-sm">输出价格</span>
                    </div>
                    <p className="text-2xl font-bold text-text-primary">
                      {formatPrice(model.tokens.output, model.tokens.unit)}
                    </p>
                    <p className="text-text-muted text-sm">
                      /1K tokens
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* 技术规格 */}
            <div className="bg-background-secondary border border-neutral-300 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-text-primary mb-6 flex items-center gap-2">
                <CpuChipIcon className="h-6 w-6" />
                技术规格
              </h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-neutral-300">
                  <span className="text-text-secondary">品牌</span>
                  <span className="text-text-primary font-medium">{model.brand}</span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-neutral-300">
                  <span className="text-text-secondary">模型名称</span>
                  <span className="text-text-primary font-medium">{model.name}</span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-neutral-300">
                  <span className="text-text-secondary">上下文窗口</span>
                  <span className="text-text-primary font-medium">
                    {formatWindow(model.window)} tokens
                  </span>
                </div>
                
                {model.data_amount && (
                  <div className="flex justify-between items-center py-3 border-b border-neutral-300">
                    <span className="text-text-secondary">训练数据量</span>
                    <span className="text-text-primary font-medium">
                      {model.data_amount}B parameters
                    </span>
                  </div>
                )}
                
                {model.tokens && (
                  <div className="flex justify-between items-center py-3">
                    <span className="text-text-secondary">价格单位</span>
                    <span className="text-text-primary font-medium">{model.tokens.unit}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* 服务提供商信息 */}
            {model.providers && model.providers.length > 0 && (
              <div className="bg-background-secondary border border-neutral-300 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-text-primary mb-6 flex items-center gap-2">
                  <ServerIcon className="h-6 w-6" />
                  服务提供商
                </h2>
                
                <div className="space-y-6">
                  {model.providers.map((provider, index) => (
                    <div key={provider.name} className={`${index !== model.providers.length - 1 ? 'border-b border-neutral-300 pb-6' : ''}`}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-text-primary">
                            {provider.display_name}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={provider.api_website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
                          >
                            访问官网
                            <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                          </a>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-background-primary rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <CurrencyDollarIcon className="h-4 w-4 text-text-muted" />
                            <span className="text-text-secondary text-sm">输入价格</span>
                          </div>
                          <p className="text-text-primary font-semibold">
                            {provider.tokens.input} {provider.tokens.unit}/1K tokens
                          </p>
                        </div>
                        
                        <div className="bg-background-primary rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <CurrencyDollarIcon className="h-4 w-4 text-text-muted" />
                            <span className="text-text-secondary text-sm">输出价格</span>
                          </div>
                          <p className="text-text-primary font-semibold">
                            {provider.tokens.output} {provider.tokens.unit}/1K tokens
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* 价格计算器 */}
          <div className="lg:col-span-1">
            <div className="bg-background-secondary border border-neutral-300 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-text-primary mb-6 flex items-center gap-2">
                <CalculatorIcon className="h-6 w-6" />
                价格计算器
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-text-secondary text-sm mb-2">
                    输入 Tokens 数量
                  </label>
                  <input
                    type="number"
                    value={inputTokens}
                    onChange={(e) => setInputTokens(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-background-primary border border-neutral-300 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-600"
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-text-secondary text-sm mb-2">
                    输出 Tokens 数量
                  </label>
                  <input
                    type="number"
                    value={outputTokens}
                    onChange={(e) => setOutputTokens(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-background-primary border border-neutral-300 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-600"
                    min="0"
                  />
                </div>
                
                {priceResult && (
                  <div className="mt-6 p-4 bg-background-primary rounded-lg">
                    <h3 className="text-text-primary font-semibold mb-3">预估费用</h3>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-text-secondary">输入费用:</span>
                        <span className="text-text-primary">
                          {getCurrencySymbol(priceResult.unit)}{priceResult.inputCost.toFixed(4)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-text-secondary">输出费用:</span>
                        <span className="text-text-primary">
                          {getCurrencySymbol(priceResult.unit)}{priceResult.outputCost.toFixed(4)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between pt-2 border-t border-neutral-300">
                        <span className="text-text-primary font-semibold">总费用:</span>
                        <span className="text-primary-600 font-bold">
                          {getCurrencySymbol(priceResult.unit)}{priceResult.totalCost.toFixed(4)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* 相似模型推荐 */}
            {similarModels.length > 0 && (
              <div className="bg-background-secondary border border-neutral-300 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-text-primary mb-6 flex items-center gap-2">
                  <ChartBarIcon className="h-6 w-6" />
                  相似模型推荐
                </h2>
                
                <div className="space-y-4">
                  {similarModels.map((similarModel) => (
                    <Link
                      key={similarModel.id}
                      to={`/models/${similarModel.id}`}
                      className="block p-4 bg-background-primary rounded-lg hover:bg-background-tertiary transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-primary-600 text-xs font-medium">
                          {similarModel.brand}
                        </span>
                        {similarModel.tokens && (
                          <span className="text-text-muted text-xs">
                            {formatPrice(similarModel.tokens.input, similarModel.tokens.unit)}
                          </span>
                        )}
                      </div>
                      
                      <h4 className="text-text-primary font-medium text-sm mb-1 line-clamp-2">
                        {similarModel.name}
                      </h4>
                      
                      <p className="text-text-secondary text-xs">
                        窗口: {formatWindow(similarModel.window)}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelDetailPage;