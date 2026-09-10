from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    supabase_url: str = "http://127.0.0.1:54321"
    supabase_anon_key: str = "configure-supabase-anon-key"
    supabase_service_role_key: str = "configure-supabase-service-role-key"
    qdrant_url: str = "http://localhost:6333"
    qdrant_api_key: str = ""
    qdrant_collection: str = "customer_knowledge"
    ai_provider: str = "mock"
    openai_api_key: str = ""
    deepseek_api_key: str = ""
    cors_origins: str = "http://localhost:5174,http://127.0.0.1:5174"
    model_config = SettingsConfigDict(env_file="../.env", extra="ignore")

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
