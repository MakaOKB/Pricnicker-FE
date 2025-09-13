import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, SparklesIcon, ChartBarIcon, CpuChipIcon } from '@heroicons/react/24/outline';

const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const features = [
    {
      icon: CpuChipIcon,
      title: '全面覆盖',
      description: '整合主流AI模型平台数据',
    },
    {
      icon: ChartBarIcon,
      title: '实时比价',
      description: '准确的价格对比分析',
    },
    {
      icon: SparklesIcon,
      title: '智能推荐',
      description: '基于性价比的模型推荐',
    },
  ];

  return (
    <div className="relative bg-gradient-to-br from-background-primary via-background-secondary to-secondary-100 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary-200 rounded-full mix-blend-screen filter blur-xl opacity-10 animate-bounce-gentle"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary-200 rounded-full mix-blend-screen filter blur-xl opacity-10 animate-bounce-gentle" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-secondary-300 rounded-full mix-blend-screen filter blur-xl opacity-10 animate-bounce-gentle" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="text-center">
          {/* Main heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary mb-6">
            <span className="block">AI模型</span>
            <span className="block text-primary-600">智能比价平台</span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl sm:text-2xl text-text-secondary mb-8 max-w-3xl mx-auto leading-relaxed">
            整合硅基流动、AiHubMix、PPIO等主流平台，
            <br className="hidden sm:block" />
            帮您找到最具性价比的AI模型解决方案
          </p>

          {/* Search bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <form onSubmit={handleSearch} className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-6 w-6 text-neutral-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-12 pr-32 py-4 text-lg border-2 border-neutral-300 rounded-2xl leading-6 bg-background-tertiary/80 backdrop-blur-sm placeholder-text-muted text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent shadow-soft transition-all duration-200"
                placeholder="搜索AI模型，如 GPT-4、Claude、DeepSeek..."
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                <button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-xl text-sm font-medium transition-colors duration-200 shadow-medium"
                >
                  搜索
                </button>
              </div>
            </form>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button
              onClick={() => navigate('/models')}
              className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200 shadow-medium hover:shadow-strong transform hover:-translate-y-1"
            >
              浏览所有模型
            </button>
            <button
              onClick={() => navigate('/compare')}
              className="bg-background-tertiary hover:bg-neutral-200 text-primary-600 border-2 border-primary-600 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200 shadow-medium hover:shadow-strong transform hover:-translate-y-1"
            >
              开始比价
            </button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="bg-background-tertiary/60 backdrop-blur-sm rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all duration-300 transform hover:-translate-y-2"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-12 h-12 bg-primary-200 rounded-xl flex items-center justify-center mb-4 mx-auto">
                    <IconComponent className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-text-secondary">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;