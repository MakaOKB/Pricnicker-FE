import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ModelsApi } from '../api/models';
import { CpuChipIcon, BuildingOfficeIcon, CurrencyDollarIcon, ClockIcon } from '@heroicons/react/24/outline';

interface StatItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  description: string;
  color: string;
}

const PlatformStats: React.FC = () => {
  const [animatedValues, setAnimatedValues] = useState<Record<string, number>>({});

  const { data: models = [], isLoading } = useQuery({
    queryKey: ['models'],
    queryFn: ModelsApi.getModels,
  });

  // 计算统计数据
  const stats = React.useMemo(() => {
    if (!models.length) return [];

    const brands = [...new Set(models.map(model => model.brand))];
    const avgInputPrice = models.reduce((sum, model) => sum + model.tokens.input, 0) / models.length;
    const avgWindow = models.reduce((sum, model) => sum + model.window, 0) / models.length;

    return [
      {
        icon: CpuChipIcon,
        label: '收录模型',
        value: models.length.toString(),
        description: '个AI模型',
        color: 'text-primary-600',
        numericValue: models.length,
      },
      {
        icon: BuildingOfficeIcon,
        label: '支持平台',
        value: brands.length.toString(),
        description: '个AI平台',
        color: 'text-secondary-300',
        numericValue: brands.length,
      },
      {
        icon: CurrencyDollarIcon,
        label: '平均输入价格',
        value: avgInputPrice.toFixed(2),
        description: 'CNY/千tokens',
        color: 'text-primary-500',
        numericValue: avgInputPrice,
      },
      {
        icon: ClockIcon,
        label: '平均上下文',
        value: (avgWindow / 1000).toFixed(0) + 'K',
        description: 'tokens窗口',
        color: 'text-secondary-200',
        numericValue: avgWindow / 1000,
      },
    ];
  }, [models]);

  // 数字动画效果
  useEffect(() => {
    if (!stats.length) return;

    const animateValue = (key: string, start: number, end: number, duration: number) => {
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = start + (end - start) * easeOutQuart(progress);
        
        setAnimatedValues(prev => ({ ...prev, [key]: current }));
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    };

    // 为每个统计项启动动画
    stats.forEach((stat, index) => {
      setTimeout(() => {
        animateValue(stat.label, 0, stat.numericValue, 2000);
      }, index * 200);
    });
  }, [stats]);

  // 缓动函数
  const easeOutQuart = (t: number): number => {
    return 1 - Math.pow(1 - t, 4);
  };

  // 格式化动画值
  const formatAnimatedValue = (stat: any): string => {
    const animatedValue = animatedValues[stat.label] || 0;
    
    if (stat.label === '平均输入价格') {
      return animatedValue.toFixed(2);
    } else if (stat.label === '平均上下文') {
      return Math.floor(animatedValue) + 'K';
    } else {
      return Math.floor(animatedValue).toString();
    }
  };

  if (isLoading) {
    return (
      <div className="bg-background-primary py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-neutral-300 rounded-2xl mx-auto mb-4 animate-pulse"></div>
                <div className="h-8 bg-neutral-300 rounded mb-2 animate-pulse"></div>
                <div className="h-4 bg-neutral-300 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-primary py-16 border-t border-neutral-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-text-primary mb-4">
            平台数据概览
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            实时更新的AI模型市场数据，帮助您做出明智的选择
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div
                key={stat.label}
                className="text-center group hover:scale-105 transition-transform duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="bg-gradient-to-br from-background-secondary to-background-tertiary rounded-2xl p-8 shadow-soft hover:shadow-medium transition-shadow duration-300">
                  <div className={`w-16 h-16 bg-background-tertiary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-soft group-hover:shadow-medium transition-shadow duration-300`}>
                    <IconComponent className={`h-8 w-8 ${stat.color}`} />
                  </div>
                  
                  <div className={`text-4xl font-bold ${stat.color} mb-2`}>
                    {formatAnimatedValue(stat)}
                  </div>
                  
                  <div className="text-lg font-semibold text-text-primary mb-1">
                    {stat.label}
                  </div>
                  
                  <div className="text-sm text-text-secondary">
                    {stat.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional info */}
        <div className="mt-12 text-center">
          <p className="text-sm text-text-muted">
            数据每小时更新一次，最后更新时间：{new Date().toLocaleString('zh-CN')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlatformStats;