import * as React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export type AuthMode = 'login' | 'signup'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 8

export interface AuthFormValues {
  email: string
  password: string
}

export interface AuthFormErrors {
  email?: string
  password?: string
}

export interface AuthFormProps {
  mode: AuthMode
  values: AuthFormValues
  errors: AuthFormErrors
  isLoading: boolean
  onSubmit: (e: React.FormEvent) => void
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  /** Rendered between password field and submit button (e.g. CreateWorkspaceFlow) */
  extraFields?: React.ReactNode
  className?: string
}

export function validateAuthForm(
  mode: AuthMode,
  values: AuthFormValues
): AuthFormErrors {
  const err: AuthFormErrors = {}
  if (!values.email.trim()) {
    err.email = 'Email is required'
  } else if (!EMAIL_REGEX.test(values.email.trim())) {
    err.email = 'Enter a valid email address'
  }
  if (!values.password) {
    err.password = 'Password is required'
  } else if (mode === 'signup' && values.password.length < MIN_PASSWORD_LENGTH) {
    err.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`
  }
  return err
}

export function AuthForm({
  mode,
  values,
  errors,
  isLoading,
  onSubmit,
  onEmailChange,
  onPasswordChange,
  extraFields,
  className,
}: AuthFormProps) {
  const passwordRef = React.useRef<HTMLInputElement>(null)

  return (
    <form
      onSubmit={onSubmit}
      className={cn('space-y-4', className)}
      noValidate
      aria-label={mode === 'login' ? 'Sign in form' : 'Sign up form'}
    >
      <div>
        <label
          htmlFor="auth-email"
          className="mb-1.5 block text-sm font-medium text-foreground-muted"
        >
          Email
        </label>
        <Input
          id="auth-email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="you@example.com"
          error={Boolean(errors.email)}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'auth-email-error' : undefined}
          className="transition-colors duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        {errors.email && (
          <p
            id="auth-email-error"
            className="mt-1.5 text-sm text-error animate-fade-in"
            role="alert"
          >
            {errors.email}
          </p>
        )}
      </div>
      <div>
        <label
          htmlFor="auth-password"
          className="mb-1.5 block text-sm font-medium text-foreground-muted"
        >
          Password
        </label>
        <Input
          ref={passwordRef}
          id="auth-password"
          type="password"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          value={values.password}
          onChange={(e) => onPasswordChange(e.target.value)}
          placeholder={mode === 'signup' ? 'At least 8 characters' : ''}
          minLength={mode === 'signup' ? MIN_PASSWORD_LENGTH : undefined}
          error={Boolean(errors.password)}
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? 'auth-password-error' : undefined}
          className="transition-colors duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        {errors.password && (
          <p
            id="auth-password-error"
            className="mt-1.5 text-sm text-error animate-fade-in"
            role="alert"
          >
            {errors.password}
          </p>
        )}
      </div>
      {extraFields}
      {mode === 'login' && (
        <div className="flex items-center justify-between text-sm">
          <Link
            to="/forgot-password"
            className="text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 rounded"
          >
            Forgot password?
          </Link>
        </div>
      )}
      <Button
        type="submit"
        className="w-full min-h-[44px] hover:scale-[1.02] hover:shadow-lg transition-all duration-200"
        size="md"
        isLoading={isLoading}
        disabled={isLoading}
      >
        {mode === 'login' ? 'Sign in' : 'Create account'}
      </Button>
    </form>
  )
}
