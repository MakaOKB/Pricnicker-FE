import apiClient from './client';
import { Model, ModelInfo, FilterOptions, SearchResult, BrandsResponse, ErrorResponse, ProviderInfo } from '../types';

// 模型API服务类
export class ModelsApi {
  // 获取全局模型列表 (根据API规范: GET /v1/query/models)
  static async getModels(): Promise<Model[]> {
    try {
      const response = await apiClient.get<ModelInfo[]>('/v1/query/models');
      // 为每个模型添加唯一ID（基于brand和name）
      return response.data.map((model, index) => ({
        ...model,
        id: `${model.brand.toLowerCase().replace(/\s+/g, '-')}-${model.name.toLowerCase().replace(/\s+/g, '-')}-${index}`,
      }));
    } catch (error: any) {
      console.error('获取模型列表失败:', error);
      throw error;
    }
  }

  // 根据品牌获取模型列表 (根据API规范: GET /v1/query/models/brand/{brand_name})
  static async getModelsByBrand(brandName: string): Promise<Model[]> {
    try {
      const response = await apiClient.get<ModelInfo[]>(`/v1/query/models/brand/${encodeURIComponent(brandName)}`);
      return response.data.map((model, index) => ({
        ...model,
        id: `${model.brand.toLowerCase().replace(/\s+/g, '-')}-${model.name.toLowerCase().replace(/\s+/g, '-')}-${index}`,
      }));
    } catch (error: any) {
      console.error(`获取品牌 ${brandName} 的模型列表失败:`, error);
      throw error;
    }
  }

  // 获取可用品牌列表 (根据API规范: GET /v1/query/models/brands)
  static async getAvailableBrands(): Promise<string[]> {
    try {
      const response = await apiClient.get<BrandsResponse>('/v1/query/models/brands');
      return response.data.brands;
    } catch (error: any) {
      console.error('获取品牌列表失败:', error);
      // 如果API调用失败，回退到从模型列表中提取品牌
      return this.getBrands();
    }
  }

  // 根据ID获取单个模型
  static async getModelById(id: string): Promise<Model | null> {
    const models = await this.getModels();
    return models.find(model => model.id === id) || null;
  }

  // 搜索模型
  static async searchModels(query: string): Promise<SearchResult> {
    const models = await this.getModels();
    const filteredModels = models.filter(model => 
      model.name.toLowerCase().includes(query.toLowerCase()) ||
      model.brand.toLowerCase().includes(query.toLowerCase())
    );
    
    return {
      models: filteredModels,
      query,
      total: filteredModels.length,
    };
  }

  // 根据筛选条件过滤模型
  static async filterModels(filters: FilterOptions): Promise<Model[]> {
    const models = await this.getModels();
    let filteredModels = [...models];

    // 按品牌筛选
    if (filters.brands && filters.brands.length > 0) {
      filteredModels = filteredModels.filter(model => 
        filters.brands!.includes(model.brand)
      );
    }

    // 按价格范围筛选（基于输入token价格）
    if (filters.priceRange) {
      const [minPrice, maxPrice] = filters.priceRange;
      filteredModels = filteredModels.filter(model => 
        model.tokens.input >= minPrice && model.tokens.input <= maxPrice
      );
    }

    // 按窗口大小筛选
    if (filters.windowRange) {
      const [minWindow, maxWindow] = filters.windowRange;
      filteredModels = filteredModels.filter(model => 
        model.window >= minWindow && model.window <= maxWindow
      );
    }

    // 排序
    if (filters.sortBy) {
      filteredModels.sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (filters.sortBy) {
          case 'price':
            aValue = a.tokens.input;
            bValue = b.tokens.input;
            break;
          case 'window':
            aValue = a.window;
            bValue = b.window;
            break;
          case 'name':
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
          case 'brand':
            aValue = a.brand.toLowerCase();
            bValue = b.brand.toLowerCase();
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

    return filteredModels;
  }

  // 获取所有品牌列表 (从模型数据中提取，作为备用方法)
  static async getBrands(): Promise<string[]> {
    try {
      const models = await this.getModels();
      const brands = [...new Set(models.map(model => model.brand))];
      return brands.sort();
    } catch (error: any) {
      console.error('从模型数据提取品牌列表失败:', error);
      return [];
    }
  }

  // 获取价格范围
  static async getPriceRange(): Promise<[number, number]> {
    const models = await this.getModels();
    const prices = models.map(model => model.tokens.input);
    return [Math.min(...prices), Math.max(...prices)];
  }

  // 获取窗口大小范围
  static async getWindowRange(): Promise<[number, number]> {
    const models = await this.getModels();
    const windows = models.map(model => model.window);
    return [Math.min(...windows), Math.max(...windows)];
  }

  // 获取推荐模型（基于性价比）
  static async getFeaturedModels(limit: number = 6): Promise<Model[]> {
    const models = await this.getModels();
    // 简单的性价比计算：窗口大小 / (输入价格 + 输出价格)
    const modelsWithScore = models.map(model => ({
      ...model,
      score: model.window / (model.tokens.input + model.tokens.output),
    }));
    
    return modelsWithScore
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ score, ...model }) => model);
  }

  // 获取所有提供商信息 (根据API规范: GET /v1/providers)
  static async getAllProviders(): Promise<ProviderInfo[]> {
    try {
      const response = await apiClient.get<ProviderInfo[]>('/v1/providers');
      return response.data;
    } catch (error: any) {
      console.error('获取提供商列表失败:', error);
      throw error;
    }
  }

  // 获取指定提供商信息 (根据API规范: GET /v1/providers/{provider_name})
  static async getProviderByName(providerName: string): Promise<ProviderInfo> {
    try {
      const response = await apiClient.get<ProviderInfo>(`/v1/providers/${encodeURIComponent(providerName)}`);
      return response.data;
    } catch (error: any) {
      console.error(`获取提供商 ${providerName} 信息失败:`, error);
      throw error;
    }
  }

  // 获取指定提供商的模型列表 (根据API规范: GET /v1/providers/{provider_name}/models)
  static async getModelsByProvider(providerName: string): Promise<Model[]> {
    try {
      const response = await apiClient.get<ModelInfo[]>(`/v1/providers/${encodeURIComponent(providerName)}/models`);
      return response.data.map((model, index) => ({
        ...model,
        id: `${model.brand.toLowerCase().replace(/\s+/g, '-')}-${model.name.toLowerCase().replace(/\s+/g, '-')}-${index}`,
      }));
    } catch (error: any) {
      console.error(`获取提供商 ${providerName} 的模型列表失败:`, error);
      throw error;
    }
  }

  // 获取支持指定模型的提供商列表 (根据API规范: GET /v1/models/{model_name}/providers)
  static async getProvidersForModel(modelName: string): Promise<ProviderInfo[]> {
    try {
      const response = await apiClient.get<ProviderInfo[]>(`/v1/models/${encodeURIComponent(modelName)}/providers`);
      return response.data;
    } catch (error: any) {
      console.error(`获取模型 ${modelName} 的提供商列表失败:`, error);
      throw error;
    }
  }
}