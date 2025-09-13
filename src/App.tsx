import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ModelsPage from './pages/ModelsPage';
import ModelDetailPage from './pages/ModelDetailPage';

import SearchPage from './pages/SearchPage';
import HelpPage from './pages/HelpPage';

// 创建React Query客户端
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 10 * 60 * 1000, // 10分钟
      staleTime: 5 * 60 * 1000,  // 5分钟
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Layout>
          <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/models" element={<ModelsPage />} />
          <Route path="/models/:id" element={<ModelDetailPage />} />

          <Route path="/search" element={<SearchPage />} />
          <Route path="/help" element={<HelpPage />} />
        </Routes>
        </Layout>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
