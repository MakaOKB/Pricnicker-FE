// 代币价格信息接口 (根据API规范)
export interface TokenInfo {
  input: number;
  output: number;
  unit: 'CNY' | 'USD';
}

// 向后兼容的别名
export interface ModelTokens extends TokenInfo {}

// 服务提供商信息接口 (根据API规范)
export interface ProviderInfo {
  name: string;
  display_name: string;
  api_endpoint: string;
  reliability_score: number;
  response_time_ms: number;
  uptime_percentage: number;
  region: string;
  support_streaming: boolean;
}

// AI模型信息接口 (根据API规范)
export interface ModelInfo {
  brand: string;
  name: string;
  data_amount: number | null;
  window: number;
  tokens: TokenInfo;
  providers: ProviderInfo[];
  recommended_provider?: string | null;
}

// 扩展的模型接口，包含前端需要的额外字段
export interface Model extends ModelInfo {
  id?: string; // 用于路由和唯一标识
}

// 品牌列表响应接口 (根据API规范)
export interface BrandsResponse {
  brands: string[];
  count: number;
}

// 插件信息接口 (根据API规范)
export interface PluginInfo {
  name: string;
  version: string;
  brand: string;
  enabled: boolean;
  description: string;
}

// 插件状态响应接口 (根据API规范)
export interface PluginStatusResponse {
  plugins: Record<string, PluginInfo>;
  total_count: number;
  enabled_count: number;
}

// 操作结果响应接口 (根据API规范)
export interface OperationResponse {
  message: string;
  success: boolean;
}

// 错误响应接口 (根据API规范)
export interface ErrorResponse {
  detail: string;
}

// API响应接口 (扩展用于前端分页)
export interface ModelListResponse {
  models: Model[];
  total: number;
  page: number;
  pageSize: number;
}

// 筛选选项接口
export interface FilterOptions {
  brands?: string[];
  priceRange?: [number, number];
  windowRange?: [number, number];
  sortBy?: 'price' | 'window' | 'name' | 'brand';
  sortOrder?: 'asc' | 'desc';
}

// 应用状态接口
export interface AppState {
  // 模型数据
  models: Model[];
  loading: boolean;
  error: string | null;
  
  // 筛选和排序
  filters: FilterOptions;
  searchQuery: string;
  
  // 对比功能
  compareList: Model[];
  
  // UI状态
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
}

// 价格计算器输入接口
export interface PriceCalculatorInput {
  inputTokens: number;
  outputTokens: number;
  model: Model;
}

// 价格计算结果接口
export interface PriceCalculatorResult {
  inputCost: number;
  outputCost: number;
  totalCost: number;
  unit: string;
}

// 统计数据接口
export interface PlatformStats {
  totalModels: number;
  totalBrands: number;
  avgInputPrice: number;
  avgOutputPrice: number;
}

// 搜索结果接口
export interface SearchResult {
  models: Model[];
  query: string;
  total: number;
}

// 路由参数接口
export interface RouteParams {
  id: string;
}

// API错误接口 (扩展的错误信息)
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  detail?: string;
}