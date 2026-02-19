import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

export interface FooterLinksProps {
  className?: string
}

const links = [
  { to: '/terms', label: 'Terms' },
  { to: '/privacy', label: 'Privacy' },
  { to: '/docs', label: 'Help' },
]

export function FooterLinks({ className }: FooterLinksProps) {
  return (
    <footer
      className={cn(
        'flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-foreground-subdued',
        className
      )}
    >
      {links.map(({ to, label }) => (
        <Link
          key={to}
          to={to}
          className="hover:text-foreground-muted transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 rounded"
        >
          {label}
        </Link>
      ))}
    </footer>
  )
}
