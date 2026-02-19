/** Auth API response types for role/workspace membership */

export interface AuthUser {
  id: string
  email: string
  email_verified?: boolean
  role?: 'admin' | 'manager' | 'member'
  workspace_id?: string
  workspace_name?: string
}

export interface AuthSession {
  access_token: string
  refresh_token?: string
  expires_at?: number
  user: AuthUser
}

export interface LoginSignupRecord {
  id: string
  user_id: string
  title: string
  description?: string
  status: string
  created_at: string
  updated_at: string
}
