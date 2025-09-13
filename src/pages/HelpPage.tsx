import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { MagnifyingGlassIcon, QuestionMarkCircleIcon, BookOpenIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    id: '1',
    question: '如何搜索AI模型？',
    answer: '您可以在首页搜索框中输入模型名称、厂商名称或关键词进行搜索。支持模糊匹配，会显示相关的模型结果。您也可以在模型页面使用筛选功能按厂商、价格范围等条件筛选。',
    category: '搜索'
  },
  {
    id: '2',
    question: '价格单位是什么意思？',
    answer: '价格通常以每1000个token为单位计算。输入价格是指处理输入文本的费用，输出价格是指生成回复文本的费用。不同模型的定价策略可能有所不同。',
    category: '价格'
  },
  {
    id: '3',
    question: '如何对比不同模型的价格？',
    answer: '在模型列表页面，您可以查看每个模型的输入和输出价格。点击"对比"按钮可以将多个模型加入对比列表，然后在对比页面查看详细的价格和性能对比。',
    category: '对比'
  },
  {
    id: '4',
    question: '支持哪些AI模型平台？',
    answer: '我们整合了硅基流动、AiHubMix、PPIO等主流AI模型服务平台的数据，涵盖了OpenAI、Anthropic、Google、Meta等主要厂商的模型。',
    category: '平台'
  },
  {
    id: '5',
    question: '数据更新频率如何？',
    answer: '我们会定期更新模型价格和可用性信息，通常每日更新。如果发现数据有误或过时，请通过联系方式告知我们。',
    category: '数据'
  },
  {
    id: '6',
    question: '如何理解模型的上下文长度？',
    answer: '上下文长度指模型能够处理的最大token数量，包括输入和输出。更长的上下文意味着模型能处理更长的文档或保持更长的对话记忆。',
    category: '模型'
  }
];

const HelpPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');

  const categories = ['全部', '搜索', '价格', '对比', '平台', '数据', '模型'];

  const filteredFAQ = faqData.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '全部' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <div className="min-h-screen bg-background-primary py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-text-primary mb-4">帮助中心</h1>
          <p className="text-xl text-text-secondary">找到您需要的答案和使用指南</p>
        </div>

        {/* 快速导航 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-background-secondary rounded-lg p-6 shadow-sm border border-neutral-300 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <BookOpenIcon className="h-8 w-8 text-primary-600 mr-3" />
              <h3 className="text-lg font-semibold text-text-primary">快速开始</h3>
            </div>
            <p className="text-text-secondary mb-4">了解如何使用我们的AI模型比价平台</p>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>• 搜索和筛选模型</li>
              <li>• 对比价格和性能</li>
              <li>• 理解价格计算</li>
            </ul>
          </div>

          <div className="bg-background-secondary rounded-lg p-6 shadow-sm border border-neutral-300 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <QuestionMarkCircleIcon className="h-8 w-8 text-green-600 mr-3" />
              <h3 className="text-lg font-semibold text-text-primary">常见问题</h3>
            </div>
            <p className="text-text-secondary mb-4">查看用户最常遇到的问题和解答</p>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>• 价格单位说明</li>
              <li>• 模型对比方法</li>
              <li>• 平台支持范围</li>
            </ul>
          </div>

          <div className="bg-background-secondary rounded-lg p-6 shadow-sm border border-neutral-300 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <ChatBubbleLeftRightIcon className="h-8 w-8 text-purple-600 mr-3" />
              <h3 className="text-lg font-semibold text-text-primary">联系支持</h3>
            </div>
            <p className="text-text-secondary mb-4">需要更多帮助？联系我们的支持团队</p>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>• 邮箱：support@smart-teach.cn</li>
              <li>• 工作时间：9:00-18:00</li>
              <li>• 响应时间：24小时内</li>
            </ul>
          </div>
        </div>

        {/* 平台介绍 */}
        <div className="bg-background-secondary rounded-lg p-8 shadow-sm border border-neutral-300 mb-8">
          <h2 className="text-2xl font-bold text-text-primary mb-6">平台介绍</h2>
          <div className="prose max-w-none text-text-secondary">
            <p className="mb-4">
              AI模型智能比价平台是一个专业的AI模型价格对比和选择工具。我们整合了AiHubMix、ZenMux等主流AI模型服务平台的数据，
              为用户提供全面、准确、实时的模型价格信息。
            </p>
            <p className="mb-4">
              无论您是开发者、研究人员还是企业用户，都可以通过我们的平台快速找到最适合您需求和预算的AI模型。
              我们支持按厂商、价格、上下文长度等多维度筛选，让您轻松做出明智的选择。
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <h4 className="font-semibold text-text-primary mb-2">核心功能</h4>
                <ul className="space-y-1 text-sm">
                  <li>• 实时价格对比</li>
                  <li>• 多维度筛选</li>
                  <li>• 模型详细信息</li>
                  <li>• 智能搜索</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-text-primary mb-2">支持平台</h4>
                <ul className="space-y-1 text-sm">
                  <li>• AiHubMix</li>
                  <li>• ZenMux</li>
                  <li>• 更多平台持续接入中...</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ搜索和筛选 */}
        <div className="bg-background-secondary rounded-lg p-8 shadow-sm border border-neutral-300">
          <h2 className="text-2xl font-bold text-text-primary mb-6">常见问题</h2>
          
          {/* 搜索框 */}
          <div className="relative mb-6">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-muted" />
            <input
              type="text"
              placeholder="搜索问题..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
            />
          </div>

          {/* 分类筛选 */}
          <div className="flex flex-wrap gap-2 mb-6">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-primary-600 text-white'
                      : 'bg-background-tertiary text-text-secondary hover:bg-neutral-300'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

          {/* FAQ列表 */}
          <div className="space-y-4">
            {filteredFAQ.length === 0 ? (
                <div className="text-center py-8 text-text-muted">
                  <QuestionMarkCircleIcon className="h-12 w-12 mx-auto mb-4 text-text-muted" />
                  <p>没有找到相关问题，请尝试其他关键词</p>
                </div>
              ) : (
                filteredFAQ.map((item) => (
                  <div key={item.id} className="border border-neutral-300 rounded-lg">
                    <button
                      onClick={() => toggleExpanded(item.id)}
                      className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-background-tertiary transition-colors"
                    >
                      <div className="flex items-center">
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-primary-600/20 text-primary-600 rounded mr-3">
                          {item.category}
                        </span>
                        <span className="font-medium text-text-primary">{item.question}</span>
                      </div>
                      {expandedItems.has(item.id) ? (
                        <ChevronUpIcon className="h-5 w-5 text-text-muted" />
                      ) : (
                        <ChevronDownIcon className="h-5 w-5 text-text-muted" />
                      )}
                    </button>
                    {expandedItems.has(item.id) && (
                      <div className="px-6 pb-4 text-text-secondary border-t border-neutral-300">
                        <p className="pt-4">{item.answer}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
          </div>
        </div>

        {/* 联系信息 */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">还有其他问题？</h3>
            <p className="text-white/80 mb-6">我们的支持团队随时为您提供帮助</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:support@smart-teach.cn"
                className="inline-flex items-center px-6 py-3 bg-white text-primary-600 font-medium rounded-lg hover:bg-primary-50 transition-colors"
              >
                <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                发送邮件
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;