import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ModelsApi } from '../api/models';

import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { Model } from '../types';
import { formatPrice, formatWindow } from '../lib/utils';

interface ModelCardProps {
  model: Model;
}

const ModelCard: React.FC<ModelCardProps> = ({ model }) => {

  return (
    <Link
      to={`/models/${model.id}`}
      className="group block bg-background-secondary rounded-2xl shadow-soft hover:shadow-strong transition-all duration-300 transform hover:-translate-y-2 border border-neutral-300 hover:border-primary-600"
    >
      <div className="p-6">
        {/* 品牌标签和模型名称 */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="inline-block px-3 py-1 bg-gradient-to-r from-primary-600/20 to-primary-700/20 text-primary-600 text-xs font-semibold rounded-full border border-primary-600/30">
              {model.brand}
            </span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-primary-600 font-medium">推荐</span>
            </div>
          </div>
          <h3 className="text-lg font-bold text-text-primary group-hover:text-primary-600 transition-colors duration-200 mb-2 line-clamp-2 leading-tight">
            {model.name}
          </h3>
          <div className="h-px bg-gradient-to-r from-neutral-300 via-neutral-200 to-transparent mb-4"></div>
        </div>

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
                  <span className="text-text-secondary text-sm font-medium">训练数据</span>
                  <span className="text-text-primary font-semibold text-sm bg-background-tertiary px-2 py-1 rounded-md">
                    {model.data_amount}B tokens
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 价格信息区域 */}
        {model.providers && model.providers.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center">
              <div className="w-1 h-4 bg-primary-600 rounded-full mr-2"></div>
              价格信息
            </h4>
            <div className="bg-gradient-to-br from-secondary-50 to-secondary-100 rounded-xl p-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-text-primary mb-1">
                    {formatPrice(Math.min(...model.providers.map(p => p.tokens.input)), model.providers[0].tokens.unit)}
                  </div>
                  <div className="text-xs text-text-secondary font-medium">最低输入/千tokens</div>
                </div>
                <div className="text-center border-l border-neutral-200 pl-4">
                  <div className="text-lg font-bold text-text-primary mb-1">
                    {formatPrice(Math.min(...model.providers.map(p => p.tokens.output)), model.providers[0].tokens.unit)}
                  </div>
                  <div className="text-xs text-text-secondary font-medium">最低输出/千tokens</div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* 提供商信息区域 */}
        {model.providers && model.providers.length > 0 && (
          <div className="mb-4">
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

        {/* 底部操作区域 */}
        <div className="pt-3 border-t border-neutral-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-600 font-semibold">性价比推荐</span>
          </div>
          <div className="flex items-center space-x-1 text-primary-600 group-hover:text-primary-700">
            <span className="text-xs font-medium">查看详情</span>
            <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </Link>
  );
};

const FeaturedModels: React.FC = () => {
  const { data: featuredModels = [], isLoading, error } = useQuery({
    queryKey: ['featured-models'],
    queryFn: () => ModelsApi.getFeaturedModels(6),
  });

  if (error) {
    return (
      <div className="bg-background-secondary py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-text-secondary">暂时无法加载推荐模型，请稍后再试。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-secondary py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-text-primary mb-4">
            热门推荐模型
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-8">
            基于性价比分析，为您推荐最具价值的AI模型
          </p>
          

        </div>

        {/* Models grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-background-secondary rounded-2xl shadow-soft p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-neutral-300 rounded mb-2"></div>
                  <div className="h-6 bg-neutral-300 rounded mb-4"></div>
                  <div className="space-y-2 mb-4">
                    <div className="h-4 bg-neutral-300 rounded"></div>
                    <div className="h-4 bg-neutral-300 rounded"></div>
                  </div>
                  <div className="h-16 bg-neutral-300 rounded mb-4"></div>
                  <div className="h-4 bg-neutral-300 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredModels.map((model, index) => (
              <div
                key={`${model.brand}-${model.name}-${index}`}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <ModelCard
                  model={model}
                />
              </div>
            ))}
          </div>
        )}

        {/* View all button */}
        <div className="text-center mt-12">
          <Link
            to="/models"
            className="inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200 shadow-medium hover:shadow-strong transform hover:-translate-y-1"
          >
            查看所有模型
            <ArrowRightIcon className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FeaturedModels;