import React from 'react';
import { Link } from 'react-router-dom';
import ApiStatus from './ApiStatus';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: '模型列表', href: '/models' },
      { name: '搜索', href: '/search' },
    ],
    support: [
        { name: '帮助中心', href: '/help' },
        { name: '联系我们', href: '#' },
        { name: 'API文档', href: '#' },
      ],
  };

  const supportedPlatforms = [
    'AiHubMix',
    'ZenMux',
  ];

  return (
    <footer className="bg-background-secondary border-t border-neutral-300">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center mb-4">
              <img 
                src="/image.png" 
                alt="Pricnicker Logo" 
                className="w-8 h-8 rounded-xl object-cover shadow-sm"
              />
              <span className="ml-2 text-xl font-bold text-text-primary">Pricnicker</span>
            </div>
            <p className="text-text-secondary text-sm mb-4">
              AI模型聚合比价平台，帮助您找到最具性价比的AI模型解决方案。
            </p>
            <div className="text-sm text-text-muted">
              <p className="mb-1">支持平台：</p>
              <div className="flex flex-wrap gap-1">
                {supportedPlatforms.map((platform, index) => (
                  <span key={platform} className="text-xs">
                    {platform}
                    {index < supportedPlatforms.length - 1 && '、'}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary tracking-wider uppercase mb-4">
              产品
            </h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-text-secondary hover:text-primary-600 text-sm transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary tracking-wider uppercase mb-4">
              支持
            </h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-text-secondary hover:text-primary-600 text-sm transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>


        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-neutral-300">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <p className="text-text-muted text-sm">
                &copy; {currentYear} 天津静海汇智卓创文化发展有限公司. 保留所有权利。
              </p>
              <ApiStatus showDetails={true} />
            </div>
            <div className="mt-4 md:mt-0">
              <p className="text-text-muted text-xs">
                数据更新时间：{new Date().toLocaleString('zh-CN')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;