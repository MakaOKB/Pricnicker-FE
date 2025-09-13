import React, { useState, useEffect } from 'react';
import { ModelsApi } from '../api/models';
import { getApiInfo } from '../api/client';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  InformationCircleIcon 
} from '@heroicons/react/24/outline';

interface ApiStatusProps {
  className?: string;
  showDetails?: boolean;
}

const ApiStatus: React.FC<ApiStatusProps> = ({ className = '', showDetails = false }) => {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiInfo, setApiInfo] = useState<any>(null);

  useEffect(() => {
    const checkHealth = async () => {
      setIsLoading(true);
      try {
        const healthy = await ModelsApi.checkHealth();
        setIsHealthy(healthy);
        setApiInfo(getApiInfo());
      } catch (error) {
        setIsHealthy(false);
        console.error('API健康检查失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkHealth();
    
    // 定期检查API状态（每30秒）
    const interval = setInterval(checkHealth, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
        <span className="text-text-secondary text-sm">检查API状态...</span>
      </div>
    );
  }

  const getStatusIcon = () => {
    if (isHealthy === null) {
      return <InformationCircleIcon className="h-4 w-4 text-text-muted" />;
    }
    return isHealthy ? (
      <CheckCircleIcon className="h-4 w-4 text-green-500" />
    ) : (
      <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
    );
  };

  const getStatusText = () => {
    if (isHealthy === null) return 'API状态未知';
    return isHealthy ? 'API连接正常' : 'API连接异常';
  };

  const getStatusColor = () => {
    if (isHealthy === null) return 'text-text-muted';
    return isHealthy ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {getStatusIcon()}
      <span className={`text-sm ${getStatusColor()}`}>
        {getStatusText()}
      </span>
      
      {showDetails && apiInfo && (
        <div className="ml-2 text-xs text-text-muted">
          ({new URL(apiInfo.baseURL).hostname})
        </div>
      )}
    </div>
  );
};

export default ApiStatus;