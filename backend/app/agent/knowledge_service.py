from uuid import uuid4
from qdrant_client.models import Distance, PointStruct, VectorParams
from ..config import settings
from ..qdrant_client import get_qdrant_client


def ensure_collection(vector_size: int = 1536):
    client = get_qdrant_client()
    if not client.collection_exists(settings.qdrant_collection):
        client.create_collection(settings.qdrant_collection, vectors_config=VectorParams(size=vector_size, distance=Distance.COSINE))


def store_vector(vector: list[float], payload: dict) -> str:
    ensure_collection(len(vector))
    point_id = str(uuid4())
    get_qdrant_client().upsert(settings.qdrant_collection, [PointStruct(id=point_id, vector=vector, payload=payload)])
    return point_id
