# 空香 AI 客户经营 Agent

> **[打开在线作品集演示](https://liukeyuan-lang.github.io/ai-customer-agent/)**

面向客户经营和售后履约的 AI Agent 概念项目，包含经营看板、客户资产、客户 360 详情、风险分析、经营问答和报告导出。

## 在线演示

GitHub Pages 上的版本是无登录、无后端的纯静态作品集演示：

- 打开即用，不需要 Supabase、FastAPI、Qdrant 或任何环境变量。
- 客户、联系方式和经营数据均为专门编写的虚构样例，不包含真实用户数据。
- 交互完全在浏览器内运行；经营 Agent 使用可复现的演示回答，不请求网络 API。
- 支持客户搜索、详情浏览、示例问答以及 PPT / Excel 本地导出。
- 使用 hash 路由，可在 `/ai-customer-agent/` 子路径下稳定刷新和分享具体页面。

### 本地运行静态演示

```bash
cd frontend
npm ci
npm run dev:demo
```

访问 `http://127.0.0.1:5174/ai-customer-agent/`。

生产构建验证：

```bash
cd frontend
npm run build:demo
```

每次推送到 `main` 后，[GitHub Actions](.github/workflows/deploy-pages.yml) 会自动构建并发布 `frontend/dist` 到 GitHub Pages。工作流权限仅包含读取仓库内容和发布 Pages 所需的权限。

## 完整系统架构

仓库同时保留了需要用户自行配置的完整应用架构：

- React + Vite 前端
- Supabase Auth / PostgreSQL / RLS
- FastAPI 业务 API 和多意图 Agent Router
- Qdrant 知识库客户端
- 客户、设备、合同、服务、付款、风险和提醒数据模型

该部分与 GitHub Pages 静态演示互相独立。

## 完整系统本地配置

复制 `.env.example` 为 `.env`，填写自己的 Supabase 和 Qdrant 配置。前端只能使用 anon key，service role key 只能留在后端，不得提交到仓库。

在 Supabase SQL Editor 依次执行：

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_seed_demo_function.sql`
3. `supabase/migrations/003_customer_name_unique.sql`
4. `supabase/migrations/004_atomic_customer_import.sql`

### 运行前端（完整系统模式）

```bash
cd frontend
npm ci
npm run dev
```

如需连接真实服务，配置 `VITE_SUPABASE_URL`、`VITE_SUPABASE_ANON_KEY` 和 `VITE_API_URL`；不要设置 `VITE_DEMO_MODE=true`。

### 运行后端

```bash
cd backend
python -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python -m uvicorn app.main:app --reload --port 8010
```

API 文档：`http://127.0.0.1:8010/docs`。

### 运行 Qdrant

```bash
docker compose up -d qdrant
```

Qdrant 默认地址：`http://127.0.0.1:6333`。
