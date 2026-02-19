import { useState, useCallback, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  AuthForm,
  validateAuthForm,
  OAuthButtons,
  CreateWorkspaceFlow,
  validateWorkspaceName,
  SsoMfaCta,
  FooterLinks,
} from '@/components/login-signup'
import type { AuthFormValues, AuthFormErrors, AuthMode } from '@/components/login-signup'
import { authApi } from '@/lib/auth-api'

export function LoginSignupPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [workspaceName, setWorkspaceName] = useState('')
  const [formErrors, setFormErrors] = useState<AuthFormErrors>({})
  const [workspaceError, setWorkspaceError] = useState<string | undefined>()
  const [isLoading, setIsLoading] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)

  const values: AuthFormValues = { email, password }

  useEffect(() => {
    document.title = mode === 'login' ? 'Sign in — Atlas' : 'Sign up — Atlas'
  }, [mode])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      const errors = validateAuthForm(mode, values)
      setFormErrors(errors)
      if (Object.keys(errors).length > 0) return

      if (mode === 'signup') {
        const wsError = validateWorkspaceName(workspaceName)
        setWorkspaceError(wsError)
        if (wsError) return
      }

      setIsLoading(true)
      try {
        if (mode === 'login') {
          await authApi.login({ email: email.trim(), password })
          toast.success('Welcome back')
        } else {
          await authApi.signup({
            email: email.trim(),
            password,
            workspace_name: workspaceName.trim() || undefined,
          })
          toast.success('Account created')
        }
        navigate('/dashboard')
      } catch (err: unknown) {
        const message =
          err && typeof err === 'object' && 'message' in err
            ? String((err as { message: string }).message)
            : 'Something went wrong. Please try again.'
        toast.error(message)
        setFormErrors({ email: message })
      } finally {
        setIsLoading(false)
      }
    },
    [mode, email, password, workspaceName, navigate]
  )

  const handleOAuthGitHub = useCallback(() => {
    toast.info('GitHub OAuth — connect in Supabase Auth')
  }, [])

  const handleOAuthGoogle = useCallback(() => {
    toast.info('Google OAuth — connect in Supabase Auth')
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Animated gradient background */}
      <div
        className="fixed inset-0 -z-10 overflow-hidden"
        aria-hidden
      >
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-accent-cyan/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md animate-slide-up">
          <Card className="border-border bg-card shadow-card overflow-hidden">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold text-foreground">
                {mode === 'login' ? 'Welcome back' : 'Create your workspace'}
              </CardTitle>
              <CardDescription>
                {mode === 'login'
                  ? 'Sign in to your Atlas workspace'
                  : 'Get started with Atlas in a few steps'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Tabs: Login / Sign up */}
              <div
                className="flex rounded-lg border border-border bg-background-secondary p-1"
                role="tablist"
                aria-label="Auth mode"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'login'}
                  onClick={() => {
                    setMode('login')
                    setFormErrors({})
                  }}
                  className={cn(
                    'flex-1 rounded-md py-2 text-sm font-medium transition-all duration-200',
                    mode === 'login'
                      ? 'bg-primary text-primary-foreground shadow'
                      : 'text-foreground-muted hover:text-foreground'
                  )}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'signup'}
                  onClick={() => {
                    setMode('signup')
                    setFormErrors({})
                    setWorkspaceError(undefined)
                  }}
                  className={cn(
                    'flex-1 rounded-md py-2 text-sm font-medium transition-all duration-200',
                    mode === 'signup'
                      ? 'bg-primary text-primary-foreground shadow'
                      : 'text-foreground-muted hover:text-foreground'
                  )}
                >
                  Sign up
                </button>
              </div>

              <AuthForm
                mode={mode}
                values={values}
                errors={formErrors}
                isLoading={isLoading}
                onSubmit={handleSubmit}
                onEmailChange={setEmail}
                onPasswordChange={setPassword}
                extraFields={
                  mode === 'signup' ? (
                    <CreateWorkspaceFlow
                      workspaceName={workspaceName}
                      onWorkspaceNameChange={(v) => {
                        setWorkspaceName(v)
                        setWorkspaceError(validateWorkspaceName(v) ?? undefined)
                      }}
                      error={workspaceError}
                    />
                  ) : undefined
                }
              />

              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden>
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-card px-2 text-foreground-subdued">
                    or continue with
                  </span>
                </div>
              </div>

              <OAuthButtons
                onGitHubClick={handleOAuthGitHub}
                onGoogleClick={handleOAuthGoogle}
                isLoading={isLoading}
              />

              {mode === 'signup' && (
                <SsoMfaCta
                  twoFactorEnabled={twoFactorEnabled}
                  onTwoFactorChange={setTwoFactorEnabled}
                  disabled
                />
              )}

              <p className="text-center text-sm text-foreground-subdued">
                {mode === 'login' ? (
                  <>
                    Don&apos;t have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('signup')}
                      className="text-primary hover:underline font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary rounded"
                    >
                      Sign up
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="text-primary hover:underline font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary rounded"
                    >
                      Log in
                    </button>
                  </>
                )}
              </p>
            </CardContent>
          </Card>

          <div className="mt-8 flex flex-col items-center gap-4">
            <FooterLinks />
            <Link
              to="/"
              className="text-sm text-foreground-subdued hover:text-foreground-muted transition-colors"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginSignupPage
