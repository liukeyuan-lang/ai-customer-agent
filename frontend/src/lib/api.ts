import { supabase } from './supabase'
import { DEMO_MODE, demoApi } from './demo'

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8010'
const CACHE_TTL_MS = 60_000
const responseCache = new Map<string, { expiresAt: number; value: unknown }>()
const pendingRequests = new Map<string, Promise<unknown>>()

export class ApiError extends Error {
  constructor(message: string, public status = 0, public code = '') {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(path: string, options: RequestInit, token: string): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, { ...options, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...options.headers } })
  } catch {
    throw new ApiError('无法连接后端服务，请确认后端已启动后重试。', 0, 'NETWORK_ERROR')
  }
  const contentType = response.headers.get('content-type') || ''
  const body = contentType.includes('application/json') ? await response.json() : null
  if (!response.ok) {
    if (response.status === 401) throw new ApiError('登录已过期，请重新登录。', 401, body?.code || 'UNAUTHORIZED')
    throw new ApiError(body?.detail || `请求失败（${response.status}）`, response.status, body?.code || '')
  }
  return body as T
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (DEMO_MODE) return demoApi<T>(path, options)

  const { data, error: sessionError } = await supabase.auth.getSession()
  if (sessionError) throw new ApiError('登录状态读取失败，请退出后重新登录。', 401, 'SESSION_ERROR')
  const token = data.session?.access_token
  if (!token) throw new ApiError('登录已过期，请重新登录。', 401, 'SESSION_MISSING')

  const method = (options.method || 'GET').toUpperCase()
  if (method !== 'GET') {
    responseCache.clear()
    return request<T>(path, options, token)
  }

  const cacheKey = `${token}:${path}`
  const cached = responseCache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now()) return cached.value as T
  if (cached) responseCache.delete(cacheKey)
  const pending = pendingRequests.get(cacheKey)
  if (pending) return pending as Promise<T>

  const current = request<T>(path, options, token).then(value => {
    if (responseCache.size >= 100) responseCache.clear()
    responseCache.set(cacheKey, { expiresAt: Date.now() + CACHE_TTL_MS, value })
    return value
  }).finally(() => pendingRequests.delete(cacheKey))
  pendingRequests.set(cacheKey, current)
  return current
}
