import { useState, useEffect } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  FolderGit2,
  FileText,
  BookOpen,
  Calendar,
  Wallet,
  Bot,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
  Search,
  Menu,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const SIDEBAR_COLLAPSED_KEY = 'atlas-sidebar-collapsed'

const navItems = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/dashboard/projects', label: 'Projects', icon: FolderGit2 },
  { to: '/dashboard/content', label: 'Content', icon: FileText },
  { to: '/dashboard/research', label: 'Research', icon: BookOpen },
  { to: '/dashboard/calendar', label: 'Calendar & Travel', icon: Calendar },
  { to: '/dashboard/finance', label: 'Finance', icon: Wallet },
  { to: '/dashboard/agents', label: 'Agent Builder', icon: Bot },
  { to: '/dashboard/settings', label: 'Settings', icon: Settings },
]

const bottomItems = [
  { to: '/dashboard/admin', label: 'Admin', icon: Shield },
]

export function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true'
    } catch {
      return false
    }
  })
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(collapsed))
    } catch {
      // ignore
    }
  }, [collapsed])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const toggleSidebar = () => setCollapsed((c) => !c)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-col border-r border-border bg-background-secondary transition-[width] duration-300 ease-in-out',
          collapsed ? 'w-[72px]' : 'w-56'
        )}
      >
        <div className="flex h-14 shrink-0 items-center border-b border-border px-3">
          {!collapsed && (
            <span className="text-lg font-bold text-foreground">Atlas</span>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto h-8 w-8 p-0"
            onClick={toggleSidebar}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <ul className="space-y-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary border-l-4 border-primary'
                        : 'text-foreground-muted hover:bg-background hover:text-foreground',
                      collapsed && 'justify-center px-2'
                    )
                  }
                >
                  <Icon className="h-5 w-5 shrink-0" aria-hidden />
                  {!collapsed && <span>{label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
          <ul className="mt-8 space-y-1 border-t border-border pt-4">
            {bottomItems.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-accent-cyan/10 text-accent-cyan'
                        : 'text-foreground-muted hover:bg-background hover:text-foreground',
                      collapsed && 'justify-center px-2'
                    )
                  }
                >
                  <Icon className="h-5 w-5 shrink-0" aria-hidden />
                  {!collapsed && <span>{label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-56 flex-col border-r border-border bg-background-secondary transition-transform duration-300 md:hidden',
          'flex',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-14 items-center border-b border-border px-4">
          <span className="text-lg font-bold text-foreground">Atlas</span>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <ul className="space-y-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-foreground-muted hover:bg-background hover:text-foreground'
                    )
                  }
                >
                  <Icon className="h-5 w-5 shrink-0" aria-hidden />
                  <span>{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
          <ul className="mt-8 space-y-1 border-t border-border pt-4">
            {bottomItems.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
                      isActive
                        ? 'bg-accent-cyan/10 text-accent-cyan'
                        : 'text-foreground-muted hover:bg-background hover:text-foreground'
                    )
                  }
                >
                  <Icon className="h-5 w-5 shrink-0" aria-hidden />
                  <span>{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border bg-background-secondary px-4 md:px-6">
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden h-9 w-9 p-0"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="relative max-w-xl">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-subdued" aria-hidden />
              <input
                type="search"
                placeholder="Search repos, notes, events..."
                className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-4 text-sm text-foreground-muted placeholder:text-foreground-subdued focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                aria-label="Global search"
              />
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
