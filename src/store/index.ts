import { create } from 'zustand';
import { Model, FilterOptions, AppState } from '../types';

interface AppStore extends AppState {
  // Actions for models
  setModels: (models: Model[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Actions for filters
  setFilters: (filters: FilterOptions) => void;
  updateFilter: (key: keyof FilterOptions, value: any) => void;
  clearFilters: () => void;
  setSearchQuery: (query: string) => void;
  
  // Actions for compare functionality
  addToCompare: (model: Model) => void;
  removeFromCompare: (modelId: string) => void;
  clearCompareList: () => void;
  
  // Actions for UI state
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
}

const initialFilters: FilterOptions = {
  brands: [],
  priceRange: undefined,
  windowRange: undefined,
  sortBy: 'name',
  sortOrder: 'asc',
};

export const useAppStore = create<AppStore>((set, get) => ({
  // Initial state
  models: [],
  loading: false,
  error: null,
  filters: initialFilters,
  searchQuery: '',
  compareList: [],
  sidebarOpen: false,
  theme: 'light',
  
  // Model actions
  setModels: (models) => set({ models }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  
  // Filter actions
  setFilters: (filters) => set({ filters }),
  updateFilter: (key, value) => set((state) => ({
    filters: { ...state.filters, [key]: value }
  })),
  clearFilters: () => set({ filters: initialFilters }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  
  // Compare actions
  addToCompare: (model) => set((state) => {
    // 限制对比列表最多4个模型
    if (state.compareList.length >= 4) {
      return state;
    }
    // 检查是否已存在
    if (state.compareList.some(m => m.id === model.id)) {
      return state;
    }
    return {
      compareList: [...state.compareList, model]
    };
  }),
  removeFromCompare: (modelId) => set((state) => ({
    compareList: state.compareList.filter(m => m.id !== modelId)
  })),
  clearCompareList: () => set({ compareList: [] }),
  
  // UI actions
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setTheme: (theme) => set({ theme }),
  toggleTheme: () => set((state) => ({ 
    theme: state.theme === 'light' ? 'dark' : 'light' 
  })),
}));

// Selectors for computed values
export const useFilteredModels = () => {
  const { models, filters, searchQuery } = useAppStore();
  
  let filteredModels = [...models];
  
  // Apply search query
  if (searchQuery) {
    filteredModels = filteredModels.filter(model => 
      model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.brand.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }
  
  // Apply brand filter
  if (filters.brands && filters.brands.length > 0) {
    filteredModels = filteredModels.filter(model => 
      filters.brands!.includes(model.brand)
    );
  }
  
  // Apply price range filter
  if (filters.priceRange) {
    const [minPrice, maxPrice] = filters.priceRange;
    filteredModels = filteredModels.filter(model => {
      if (!model.providers || model.providers.length === 0) return false;
      const minInputPrice = Math.min(...model.providers.map(p => p.tokens.input));
      return minInputPrice >= minPrice && minInputPrice <= maxPrice;
    });
  }
  
  // Apply window range filter
  if (filters.windowRange) {
    const [minWindow, maxWindow] = filters.windowRange;
    filteredModels = filteredModels.filter(model => 
      model.window >= minWindow && model.window <= maxWindow
    );
  }
  
  // Apply sorting
  if (filters.sortBy) {
    filteredModels.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (filters.sortBy) {
        case 'price':
          aValue = a.providers && a.providers.length > 0 ? Math.min(...a.providers.map(p => p.tokens.input)) : 0;
          bValue = b.providers && b.providers.length > 0 ? Math.min(...b.providers.map(p => p.tokens.input)) : 0;
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
};

// Get unique brands from current models
export const useAvailableBrands = () => {
  const { models } = useAppStore();
  return [...new Set(models.map(model => model.brand))].sort();
};

// Get price range from current models
export const usePriceRange = () => {
  const { models } = useAppStore();
  if (models.length === 0) return [0, 100];
  const prices = models.flatMap(model => 
    model.providers?.map(p => p.tokens.input) || []
  );
  if (prices.length === 0) return [0, 100];
  return [Math.min(...prices), Math.max(...prices)];
};

// Get window range from current models
export const useWindowRange = () => {
  const { models } = useAppStore();
  if (models.length === 0) return [0, 1000000];
  const windows = models.map(model => model.window);
  return [Math.min(...windows), Math.max(...windows)];
};