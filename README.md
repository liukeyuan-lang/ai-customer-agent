# 空香 AI 客户经营 Agent SaaS MVP

## 已实现

- Supabase Auth 邮箱验证码登录（首次验证自动注册）
- Supabase PostgreSQL 建表迁移、RLS、用户 Profile 触发器
- 客户、设备、合同、服务、付款、风险、提醒数据模型
- FastAPI JWT 验证和 Supabase API 数据访问
- AI Agent 工作台、客户资产中心、客户360详情、AI 对话
- Customer Agent、Risk Agent、Report Agent
- 每日 08:00 主动巡检任务
- Qdrant 向量库客户端与知识文档元数据关联
- 20客户、50设备、20合同、100服务记录初始化函数

## 配置

复制 `.env.example` 为 `.env`，填写 Supabase 和 Qdrant 配置。前端只能使用 anon key，service role key 只能留在后端。

在 Supabase SQL Editor 依次执行：

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_seed_demo_function.sql`
3. `supabase/migrations/003_customer_name_unique.sql`
4. `supabase/migrations/004_atomic_customer_import.sql`

### 邮箱验证码模板

在 Supabase Dashboard 的 **Authentication → Email Templates → Magic Link** 中，将邮件正文里的确认链接改为验证码变量，例如：

```html
<h2>登录验证码</h2>
<p>你的验证码是：<strong>{{ .Token }}</strong></p>
<p>验证码仅用于本次登录，请勿转发。</p>
```

前端已使用 `signInWithOtp` 和 `verifyOtp` 完成发送及校验；邮件模板必须使用 `{{ .Token }}`，否则 Supabase 仍会发送网页链接。

验证登录后，可在 SQL/RPC 中以当前用户执行：

```sql
select public.seed_demo_data(auth.uid());
```

## 运行前端

```bash
cd frontend
npm install
npm run dev
```

访问 `http://127.0.0.1:5174`。

## 运行后端

```bash
cd backend
python -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python -m uvicorn app.main:app --reload --port 8010
```

API 文档：`http://127.0.0.1:8010/docs`。本机 `8000` 端口已有其他服务，因此本项目使用 `8010`。

## 运行 Qdrant

```powershell
docker compose up -d qdrant
```

Qdrant 地址：`http://127.0.0.1:6333`。

## 当前验证状态

- React TypeScript 生产构建通过。
- Python 后端全部模块语法编译通过。
- 真实 Supabase 建表、Auth、RLS 和数据读取需要填写用户自己的 Supabase 项目凭证后验证。
