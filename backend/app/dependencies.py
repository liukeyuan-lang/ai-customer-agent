from fastapi import Header, HTTPException
from .supabase_client import get_user_client


def get_authenticated_client(authorization: str = Header(default="")):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="缺少登录凭证")
    token = authorization.removeprefix("Bearer ").strip()
    client = get_user_client(token)
    try:
        user = client.auth.get_user(token).user
    except Exception as exc:
        raise HTTPException(status_code=401, detail="登录凭证无效或已过期") from exc
    if not user:
        raise HTTPException(status_code=401, detail="未找到登录用户")
    return client, user
