import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 根据货币单位获取对应的符号
export function getCurrencySymbol(unit: string): string {
  switch (unit.toUpperCase()) {
    case 'CNY':
      return '¥';
    case 'USD':
      return '$';
    default:
      return unit; // 如果是未知单位，直接返回单位字符串
  }
}

// 格式化价格显示
export function formatPrice(price: number, unit: string): string {
  const symbol = getCurrencySymbol(unit);
  return `${symbol}${price.toFixed(2)}`;
}

// 格式化数字，添加千分位分隔符
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

// 格式化窗口大小显示
export function formatWindow(window: number): string {
  if (window >= 1000000) {
    return `${(window / 1000000).toFixed(1)}M`;
  } else if (window >= 1000) {
    return `${(window / 1000).toFixed(0)}K`;
  }
  return window.toString();
}
