import { createBrowserRouter, Navigate } from 'react-router-dom'
import { DashboardLayout } from '@/layouts/dashboard-layout'
import { LandingPage } from '@/pages/landing'
import { LoginPage } from '@/pages/login'
import { SignupPage } from '@/pages/signup'
import { LoginSignupPage } from '@/pages/Login/Signup'
import { DashboardOverviewPage } from '@/pages/dashboard-overview'
import CommandCenterPage from '@/pages/Dashboard/CommandCenter'
import ProjectsPage from '@/pages/Dashboard/ProjectsPage'
import ResearchPage from '@/pages/Dashboard/ResearchPage'
import { DashboardPlaceholderPage } from '@/pages/dashboard-placeholder'
import SkillsRegistryPage from '@/pages/AgentBuilder/SkillsRegistry'
import { NotFoundPage } from '@/pages/not-found'

export const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/signup', element: <SignupPage /> },
  { path: '/login-/-signup', element: <LoginSignupPage /> },
  { path: '/dashboard-/-command-center', element: <Navigate to="/dashboard" replace /> },
  {
    path: '/dashboard',
    element: <DashboardLayout />,
    children: [
      { index: true, element: <CommandCenterPage /> },
      { path: 'command-center', element: <CommandCenterPage /> },
      { path: 'overview', element: <DashboardOverviewPage /> },
      { path: 'projects', element: <ProjectsPage /> },
      { path: 'content', element: <DashboardPlaceholderPage /> },
      { path: 'research', element: <ResearchPage /> },
      { path: 'calendar', element: <DashboardPlaceholderPage /> },
      { path: 'finance', element: <DashboardPlaceholderPage /> },
      { path: 'agents', element: <SkillsRegistryPage /> },
      { path: 'agent-builder-skills-registry', element: <SkillsRegistryPage /> },
      { path: 'settings', element: <DashboardPlaceholderPage /> },
      { path: 'admin', element: <DashboardPlaceholderPage /> },
    ],
  },
  { path: '/docs', element: <DocsPlaceholder /> },
  { path: '/privacy', element: <LegalPlaceholder title="Privacy Policy" /> },
  { path: '/terms', element: <LegalPlaceholder title="Terms of Service" /> },
  { path: '/forgot-password', element: <ForgotPasswordPlaceholder /> },
  { path: '/404', element: <NotFoundPage /> },
  { path: '*', element: <NotFoundPage /> },
])

function DocsPlaceholder() {
  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-2xl font-bold text-foreground">Docs & Help</h1>
      <p className="mt-2 text-foreground-muted">Documentation and self-host guide — coming soon.</p>
    </div>
  )
}

function LegalPlaceholder({ title }: { title: string }) {
  return (
    <div className="min-h-screen bg-background p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      <p className="mt-4 text-foreground-muted">Legal content placeholder.</p>
    </div>
  )
}

function ForgotPasswordPlaceholder() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-foreground">Password reset</h1>
        <p className="mt-2 text-foreground-muted">Request form and reset flow — connect to auth in next phase.</p>
      </div>
    </div>
  )
}
