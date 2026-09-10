# 架构边界

- React 前端使用 Supabase anon key 和用户 Session。
- FastAPI 接收用户 access token，通过 Supabase API 查询业务数据，默认受 RLS 约束。
- 后台每日巡检可以使用 service role key，但仅保存在服务端。
- Supabase 保存用户体系、客户、设备、合同、服务、付款、风险、提醒和知识文档元数据。
- Qdrant 只保存知识库向量；`knowledge_documents.qdrant_point_id` 关联向量点。
- Agent 不直接拼接数据库连接，而是通过封装后的 Supabase API/Client 工具读取数据。

```text
React + Supabase Auth
        |
        | JWT
        v
FastAPI Agent API ---- Supabase PostgREST + RLS
        |
        +------------- Qdrant Vector Store
```
