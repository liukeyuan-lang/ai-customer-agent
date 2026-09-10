from qdrant_client import QdrantClient
from .config import settings


def get_qdrant_client() -> QdrantClient:
    return QdrantClient(
        url=settings.qdrant_url,
        api_key=settings.qdrant_api_key or None,
        trust_env=False,
        check_compatibility=False,
    )
