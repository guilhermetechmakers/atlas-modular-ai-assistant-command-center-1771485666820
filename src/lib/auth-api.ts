import { api } from '@/lib/api'
import type { AuthSession } from '@/types/auth'

export interface LoginBody {
  email: string
  password: string
}

export interface SignupBody {
  email: string
  password: string
  workspace_name?: string
}

export const authApi = {
  login: (body: LoginBody) =>
    api.post<AuthSession>('/auth/login', body),

  signup: (body: SignupBody) =>
    api.post<AuthSession>('/auth/signup', body),

  logout: () =>
    api.post<unknown>('/auth/logout'),

  me: () =>
    api.get<AuthSession['user']>('/auth/me'),
}
