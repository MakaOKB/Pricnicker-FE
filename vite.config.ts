import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    build: {
      sourcemap: mode === 'development' ? true : 'hidden',
      // 生产环境优化
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom'],
            query: ['@tanstack/react-query'],
            ui: ['@headlessui/react', '@heroicons/react'],
          },
        },
      },
    },
    plugins: [
      react()
    ],
    server: {
      port: 5173,
      host: true,
      // 开发环境代理配置（如果需要）
      proxy: env.VITE_DEV_PROXY === 'true' ? {
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://127.0.0.1:8000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      } : undefined,
    },
    // 环境变量配置
    define: {
      __DEV__: mode === 'development',
      __PROD__: mode === 'production',
    },
    // 优化依赖预构建
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@tanstack/react-query',
        'axios',
      ],
    },
  }
})
