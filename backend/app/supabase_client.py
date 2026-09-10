from functools import lru_cache
from supabase import Client, create_client
from .config import settings


@lru_cache(maxsize=128)
def get_user_client(access_token: str) -> Client:
    """使用用户 JWT 调用 Supabase，业务查询受 RLS 约束。"""
    client = create_client(settings.supabase_url, settings.supabase_anon_key)
    client.postgrest.auth(access_token)
    return client


def get_service_client() -> Client:
    """仅用于受控的后台定时任务，禁止把 service role key 返回前端。"""
    return create_client(settings.supabase_url, settings.supabase_service_role_key)
