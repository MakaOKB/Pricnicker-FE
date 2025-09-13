# AI 模型智能比价平台（Pricnicker）

一个面向开发者、研究者与企业的 AI 模型价格与能力对比平台。聚合主流平台公开数据，统一展示“每 1K tokens 的输入/输出定价”、上下文窗口与提供商信息，帮助你在数分钟内完成可靠的模型选型与成本预估。

## 主要特性
- 聚合与标准化：统一展示多平台模型信息（价格单位、输入/输出分开计价、上下文窗口等），可横向对比。
- 智能搜索与高亮：支持名称、品牌关键词搜索，快速定位候选模型。
- 多维筛选与排序：按品牌、提供商、价格区间、上下文窗口范围筛选；支持按价格/窗口/名称/品牌排序。
- 价格极值聚合：自动计算最低输入/输出价格，直观呈现性价比线索。
- 详情直达：模型详情包含各提供商价格明细与官网链接，决策后快速落地对接。
- 友好上手：提供 FAQ 与平台介绍，降低非专业用户理解成本。

## 技术栈
- 前端：React 18 + TypeScript + Vite
- 路由：React Router
- 数据：TanStack React Query（请求/缓存） + Axios
- 状态：Zustand（全局筛选/排序/派生选择器）
- UI：Tailwind CSS + Headless UI + Heroicons / Lucide

## 快速开始
1. 安装依赖：
   - npm install
2. 配置环境变量（可选）：在根目录创建 .env.local：
   - VITE_API_BASE_URL=http://127.0.0.1:8000  （不配置则默认此地址）
3. 本地开发：
   - npm run dev  （默认访问 http://localhost:5173）
4. 生产构建与预览：
   - npm run build
   - npm run preview

## 可用脚本
- npm run dev：启动开发服务
- npm run build：类型检查 + 构建生产包
- npm run preview：本地预览生产构建
- npm run lint：代码检查
- npm run type-check：TypeScript 检查（不输出文件）

## 环境变量

### 开发环境
- VITE_API_BASE_URL：后端 API 根地址（默认 http://127.0.0.1:8000）

### 生产环境
项目已配置生产环境API端点，支持以下环境变量：

- **VITE_API_BASE_URL**：生产环境API根地址（https://api.pc.msaos.tech）
- **VITE_API_TIMEOUT**：API请求超时时间（默认30000ms）
- **VITE_API_RETRY_ATTEMPTS**：API请求重试次数（默认3次）
- **VITE_API_RETRY_DELAY**：重试延迟时间（默认1000ms）
- **VITE_USE_API_RETRY**：是否启用API重试机制（生产环境默认启用）

### 环境配置文件
- `.env.production`：生产环境配置
- 生产构建时会自动使用生产环境配置

### 安全特性
- 自动重试机制：网络错误和5xx服务器错误时自动重试
- 指数退避策略：重试间隔递增，避免服务器压力
- 详细错误处理：针对不同HTTP状态码提供具体错误信息
- 请求/响应日志：便于调试和监控
- 安全头设置：包含必要的安全HTTP头

## API 概览（示例）
- GET /v1/query/models：获取模型列表（包含品牌、名称、窗口、提供商及其输入/输出价格）。
- GET /v1/query/models/brand/{brand_name}：按品牌获取模型列表。
- GET /v1/query/models/brands：获取可用品牌集合。
- GET /v1/providers：获取所有提供商信息。
- GET /v1/providers/{provider_name}：获取指定提供商信息。
- 更多字段与结构见根目录 Default_module.openapi.json。

## 目录结构（节选）
- src/
  - pages/：Home、Models、ModelDetail、Search、Help 等页面
  - components/：Header、Footer、HeroSection、FeaturedModels、PlatformStats 等
  - api/：Axios 实例与 ModelsApi 数据访问层
  - store/：Zustand 全局状态与派生选择器（筛选/排序/价格&窗口范围）
  - lib/：工具函数（格式化、单位转换等）
  - types/：类型定义（模型、请求响应等）

## 关键能力说明
- 比价与筛选：基于最低输入/输出价格与窗口范围计算，支持多条件组合筛选与排序。
- 结果派生：通过派生选择器计算全局价格/窗口范围，保证筛选上下限与数据一致。
- 直达落地：详情页提供商官网链接，便于比价后快速接入。


如需集成更多平台或新增指标（如吞吐、延迟、速率限制、稳定性），可在 api 与 store 层扩展数据结构与筛选逻辑，UI 将自然承载更多维度对比。
