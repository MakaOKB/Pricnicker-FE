import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store';
import { Model } from '../types';
import { 
  XMarkIcon,
  ScaleIcon,
  CalculatorIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ClockIcon,
  DocumentTextIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { formatPrice, formatWindow, getCurrencySymbol } from '../lib/utils';

const ComparePage: React.FC = () => {
  const { compareList, removeFromCompare, clearCompareList } = useAppStore();
  const [inputTokens, setInputTokens] = useState<number>(1000);
  const [outputTokens, setOutputTokens] = useState<number>(1000);

  // 计算每个模型的成本
  const calculateCosts = () => {
    return compareList.map(model => {
      const inputCost = (inputTokens / 1000) * model.tokens.input;
      const outputCost = (outputTokens / 1000) * model.tokens.output;
      const totalCost = inputCost + outputCost;
      
      return {
        model,
        inputCost,
        outputCost,
        totalCost,
        unit: model.tokens.unit
      };
    });
  };

  const costs = calculateCosts();
  const bestValue = costs.length > 0 ? costs.reduce((min, current) => 
    current.totalCost < min.totalCost ? current : min
  ) : null;

  if (compareList.length === 0) {
    return (
      <div className="min-h-screen bg-background-primary py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <ScaleIcon className="h-16 w-16 text-text-muted mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-text-primary mb-4">
              模型价格对比
            </h1>
            <p className="text-text-secondary mb-8">
              暂无模型进行对比，请先添加模型到对比列表
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                to="/models"
                className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
              >
                浏览模型
              </Link>
              <Link
                to="/search"
                className="bg-background-secondary text-text-primary px-6 py-3 rounded-lg hover:bg-background-tertiary transition-colors"
              >
                搜索模型
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
        {/* 页面标题 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">
                模型价格对比
              </h1>
              <p className="text-text-secondary">
                对比 {compareList.length} 个模型的价格和性能
              </p>
            </div>
            <button
              onClick={clearCompareList}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              <XMarkIcon className="h-4 w-4" />
              清空列表
            </button>
          </div>
        </div>

        {/* 价格计算器 */}
        <div className="bg-background-secondary border border-neutral-300 rounded-lg p-6 mb-8 shadow-soft">
          <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
            <CalculatorIcon className="h-6 w-6" />
            成本计算器
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
          </div>
          
          {bestValue && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <p className="text-green-400 text-sm font-medium">
                💡 最优选择: {bestValue.model.brand} {bestValue.model.name} - 
                总成本 {getCurrencySymbol(bestValue.unit)}{bestValue.totalCost.toFixed(4)}
              </p>
            </div>
          )}
        </div>

        {/* 对比表格 */}
        <div className="bg-background-secondary border border-neutral-300 rounded-lg overflow-hidden shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background-tertiary">
                <tr>
                  <th className="px-6 py-4 text-left text-text-primary font-semibold">模型信息</th>
                  <th className="px-6 py-4 text-center text-text-primary font-semibold">输入价格</th>
                  <th className="px-6 py-4 text-center text-text-primary font-semibold">输出价格</th>
                  <th className="px-6 py-4 text-center text-text-primary font-semibold">上下文窗口</th>
                  <th className="px-6 py-4 text-center text-text-primary font-semibold">训练数据</th>
                  <th className="px-6 py-4 text-center text-text-primary font-semibold">预估成本</th>
                  <th className="px-6 py-4 text-center text-text-primary font-semibold">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-300">
                {costs.map(({ model, inputCost, outputCost, totalCost, unit }) => (
                  <tr key={model.id} className="hover:bg-background-primary/50 transition-colors">
                    {/* 模型信息 */}
                    <td className="px-6 py-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="inline-block px-2 py-1 bg-primary-600/20 text-primary-600 text-xs font-medium rounded-full">
                            {model.brand}
                          </span>
                          {bestValue?.model.id === model.id && (
                            <span className="inline-block px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
                              最优
                            </span>
                          )}
                        </div>
                        <h3 className="text-text-primary font-medium line-clamp-2">
                          {model.name}
                        </h3>
                      </div>
                    </td>
                    
                    {/* 输入价格 */}
                    <td className="px-6 py-4 text-center">
                      <div className="text-text-primary font-semibold">
                        {formatPrice(model.tokens.input, model.tokens.unit)}
                      </div>
                      <div className="text-text-muted text-xs">
                        /1K tokens
                      </div>
                    </td>
                    
                    {/* 输出价格 */}
                    <td className="px-6 py-4 text-center">
                      <div className="text-text-primary font-semibold">
                        {formatPrice(model.tokens.output, model.tokens.unit)}
                      </div>
                      <div className="text-text-muted text-xs">
                        /1K tokens
                      </div>
                    </td>
                    
                    {/* 上下文窗口 */}
                    <td className="px-6 py-4 text-center">
                      <div className="text-text-primary font-semibold">
                        {formatWindow(model.window)}
                      </div>
                      <div className="text-text-muted text-xs">
                        tokens
                      </div>
                    </td>
                    
                    {/* 训练数据 */}
                    <td className="px-6 py-4 text-center">
                      {model.data_amount ? (
                        <>
                          <div className="text-text-primary font-semibold">
                            {model.data_amount}B
                          </div>
                          <div className="text-text-muted text-xs">
                            parameters
                          </div>
                        </>
                      ) : (
                        <span className="text-text-muted">-</span>
                      )}
                    </td>
                    
                    {/* 预估成本 */}
                    <td className="px-6 py-4 text-center">
                      <div className={`font-bold ${
                        bestValue?.model.id === model.id 
                          ? 'text-green-400' 
                          : 'text-text-primary'
                      }`}>
                        {getCurrencySymbol(unit)}{totalCost.toFixed(4)}
                      </div>
                      <div className="text-text-muted text-xs mt-1">
                        输入: {getCurrencySymbol(unit)}{inputCost.toFixed(4)}<br/>
                        输出: {getCurrencySymbol(unit)}{outputCost.toFixed(4)}
                      </div>
                    </td>
                    
                    {/* 操作 */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          to={`/models/${model.id}`}
                          className="text-primary-600 hover:text-primary-700 transition-colors"
                          title="查看详情"
                        >
                          <ArrowRightIcon className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => removeFromCompare(model.id!)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                          title="移除对比"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 成本分析 */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 价格对比图表 */}
          <div className="bg-background-secondary border border-neutral-300 rounded-lg p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <ChartBarIcon className="h-5 w-5" />
              价格对比分析
            </h3>
            
            <div className="space-y-4">
              {costs.map(({ model, totalCost, unit }) => {
                const maxCost = Math.max(...costs.map(c => c.totalCost));
                const percentage = maxCost > 0 ? (totalCost / maxCost) * 100 : 0;
                
                return (
                  <div key={model.id}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-text-secondary text-sm">
                        {model.brand} {model.name.substring(0, 20)}...
                      </span>
                      <span className="text-text-primary font-medium">
                        {getCurrencySymbol(unit)}{totalCost.toFixed(4)}
                      </span>
                    </div>
                    <div className="w-full bg-background-primary rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          bestValue?.model.id === model.id 
                            ? 'bg-green-500' 
                            : 'bg-primary-600'
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* 性价比分析 */}
          <div className="bg-background-secondary border border-neutral-300 rounded-lg p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <ScaleIcon className="h-5 w-5" />
              性价比分析
            </h3>
            
            <div className="space-y-4">
              {costs
                .sort((a, b) => {
                  const aRatio = a.model.window / a.totalCost;
                  const bRatio = b.model.window / b.totalCost;
                  return bRatio - aRatio;
                })
                .map(({ model, totalCost, unit }, index) => {
                  const ratio = model.window / totalCost;
                  
                  return (
                    <div key={model.id} className="flex items-center justify-between p-3 bg-background-primary rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0 ? 'bg-green-500 text-white' :
                          index === 1 ? 'bg-yellow-500 text-white' :
                          index === 2 ? 'bg-orange-500 text-white' :
                          'bg-background-tertiary text-text-muted'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-text-primary font-medium text-sm">
                            {model.brand} {model.name.substring(0, 15)}...
                          </p>
                          <p className="text-text-muted text-xs">
                            {ratio.toFixed(0)} tokens/{unit}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-text-primary font-semibold text-sm">
                          {getCurrencySymbol(unit)}{totalCost.toFixed(4)}
                        </p>
                        <p className="text-text-muted text-xs">
                          {formatWindow(model.window)} tokens
                        </p>
                      </div>
                    </div>
                  );
                })
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparePage;