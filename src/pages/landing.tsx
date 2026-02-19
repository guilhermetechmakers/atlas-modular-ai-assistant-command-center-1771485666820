import { Link } from 'react-router-dom'
import { ArrowRight, Zap, Shield, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-16 pb-24 md:px-8 md:pt-24 md:pb-32">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" aria-hidden />
        <div className="absolute top-20 left-1/4 h-72 w-72 rounded-full bg-primary/10 blur-3xl" aria-hidden />
        <div className="absolute bottom-20 right-1/4 h-64 w-64 rounded-full bg-accent-cyan/10 blur-3xl" aria-hidden />
        <div className="relative mx-auto max-w-4xl text-center animate-fade-in">
          <h1 className="text-hero font-bold text-foreground tracking-tight">
            Your unified command center
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-foreground-muted leading-relaxed">
            Projects, content, research, calendar, and finance in one searchable workspace—powered by domain-specific AI agents you control.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg" className="min-h-[44px]">
              <Link to="/signup">Get Started</Link>
            </Button>
            <Button asChild variant="secondary" size="lg" className="min-h-[44px]">
              <Link to="/docs">Self-host Guide</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Feature grid — bento-style */}
      <section className="border-t border-border bg-background-secondary/50 px-4 py-20 md:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-2xl font-bold text-foreground md:text-3xl">
            One workspace. Full control.
          </h2>
          <p className="mt-3 text-center text-foreground-muted max-w-xl mx-auto">
            Replace fragmented tools with a single system of record and agentic automation.
          </p>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Zap,
                title: 'Domain AI agents',
                description: 'PM, Personal, Social, Research, and Finance agents with memory and permissioned skills.',
              },
              {
                icon: Shield,
                title: 'Human-in-the-loop',
                description: 'Approve writes before they run. Immutable audit logs and self-host-first architecture.',
              },
              {
                icon: Layers,
                title: 'Agent Builder & Skills',
                description: 'Create custom agents and extend with connectors. Approval workflow for safety.',
              },
            ].map(({ icon: Icon, title, description }, i) => (
              <div
                key={title}
                className="card-atlas animate-slide-up"
                style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'backwards' }}
              >
                <Icon className="h-10 w-10 text-primary" aria-hidden />
                <h3 className="mt-4 text-lg font-semibold text-foreground">{title}</h3>
                <p className="mt-2 text-sm text-foreground-muted">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border px-4 py-16 md:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-foreground md:text-3xl">
            Ready to centralize your workflow?
          </h2>
          <p className="mt-3 text-foreground-muted">
            Sign up or deploy Atlas yourself. No lock-in.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg">
              <Link to="/signup">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link to="/login">Log in</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-8 md:px-8">
        <div className="mx-auto max-w-6xl flex flex-col items-center justify-between gap-4 sm:flex-row text-sm text-foreground-subdued">
          <span>Atlas — Unified command center for solo builders and small agencies.</span>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-foreground-muted transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-foreground-muted transition-colors">Terms</Link>
            <Link to="/docs" className="hover:text-foreground-muted transition-colors">Docs</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
