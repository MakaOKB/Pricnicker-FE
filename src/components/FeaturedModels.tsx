import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ModelsApi } from '../api/models';
import { useAppStore } from '../store';
import { ArrowRightIcon, PlusIcon, CheckIcon } from '@heroicons/react/24/outline';
import { Model } from '../types';
import { formatPrice, formatWindow } from '../lib/utils';

interface ModelCardProps {
  model: Model;
  onAddToCompare: (model: Model) => void;
  isInCompareList: boolean;
}

const ModelCard: React.FC<ModelCardProps> = ({ model, onAddToCompare, isInCompareList }) => {
  const handleAddToCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCompare(model);
  };

  return (
    <Link
      to={`/models/${model.id}`}
      className="group block bg-background-secondary rounded-2xl shadow-soft hover:shadow-medium transition-all duration-300 transform hover:-translate-y-2 border border-neutral-300 hover:border-primary-600"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="text-sm font-medium text-primary-600 mb-1">
              {model.brand}
            </div>
            <h3 className="text-lg font-semibold text-text-primary group-hover:text-primary-600 transition-colors duration-200">
              {model.name}
            </h3>
          </div>
          <button
            onClick={handleAddToCompare}
            className={`p-2 rounded-lg transition-all duration-200 ${
              isInCompareList
                ? 'bg-primary-200 text-primary-600'
                : 'bg-neutral-300 text-text-muted hover:bg-primary-200 hover:text-primary-600'
            }`}
            title={isInCompareList ? '已添加到对比' : '添加到对比'}
          >
            {isInCompareList ? (
              <CheckIcon className="h-4 w-4" />
            ) : (
              <PlusIcon className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Specs */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-sm text-text-secondary">上下文窗口</span>
            <span className="text-sm font-medium text-text-primary">
              {formatWindow(model.window)} tokens
            </span>
          </div>
          
          {model.data_amount && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">训练数据</span>
              <span className="text-sm font-medium text-text-primary">
                {model.data_amount}B tokens
              </span>
            </div>
          )}
        </div>

        {/* Pricing */}
        {model.tokens && (
          <div className="bg-gradient-to-r from-secondary-100 to-secondary-200 rounded-xl p-4 mb-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-text-primary">
                  {formatPrice(model.tokens.input, model.tokens.unit)}
                </div>
                <div className="text-xs text-text-secondary">输入/千tokens</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-text-primary">
                  {formatPrice(model.tokens.output, model.tokens.unit)}
                </div>
                <div className="text-xs text-text-secondary">输出/千tokens</div>
              </div>
            </div>
          </div>
        )}
        
        {/* 提供商数量信息 */}
        {model.providers && model.providers.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-text-secondary text-xs">可用提供商</span>
              </div>
              <span className="text-blue-600 text-xs font-medium">
                {model.providers.length} 个提供商
              </span>
            </div>
          </div>
        )}

        {/* Performance indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
            <span className="text-xs text-text-secondary">性价比推荐</span>
          </div>
          <ArrowRightIcon className="h-4 w-4 text-text-muted group-hover:text-primary-600 transition-colors duration-200" />
        </div>
      </div>
    </Link>
  );
};

const FeaturedModels: React.FC = () => {
  const { addToCompare, compareList } = useAppStore();

  const { data: featuredModels = [], isLoading, error } = useQuery({
    queryKey: ['featured-models'],
    queryFn: () => ModelsApi.getFeaturedModels(6),
  });

  const handleAddToCompare = (model: Model) => {
    addToCompare(model);
  };

  const isInCompareList = (modelId: string) => {
    return compareList.some(model => model.id === modelId);
  };

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
          
          {compareList.length > 0 && (
            <div className="inline-flex items-center bg-primary-200 text-primary-600 px-4 py-2 rounded-full text-sm font-medium">
              已选择 {compareList.length} 个模型进行对比
              <Link
                to="/compare"
                className="ml-2 text-primary-600 hover:text-primary-700 font-semibold"
              >
                查看对比 →
              </Link>
            </div>
          )}
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
                key={model.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <ModelCard
                  model={model}
                  onAddToCompare={handleAddToCompare}
                  isInCompareList={isInCompareList(model.id!)}
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