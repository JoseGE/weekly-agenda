import { Link, useLocation } from 'react-router-dom'
import { CalendarDays, Loader2, Mail, Settings } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { cn } from '@/lib/utils'

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const { loading, syncError, settings } = useApp()

  const navItems = [
    { to: '/', label: 'Programas', icon: CalendarDays, match: (path: string) => path === '/' || path.startsWith('/programa') },
    { to: '/cartas', label: 'Cartas', icon: Mail, match: (path: string) => path.startsWith('/cartas') },
    { to: '/configuracion', label: 'Configuración', icon: Settings, match: (path: string) => path.startsWith('/configuracion') },
  ]

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-stone-200/70 bg-white/90 px-8 py-10 shadow-[var(--shadow-card)]">
          <Loader2 className="h-8 w-8 animate-spin text-church-gold" />
          <p className="font-display text-lg text-navy-dark">Cargando programa...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-stone-200/60 bg-white/80 backdrop-blur-md">
        <div className="h-1 bg-gradient-to-r from-navy-dark via-church-gold to-church-gold-light" />
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-church-gold">
              Programa Semanal
            </p>
            <h1 className="truncate font-display text-xl font-semibold text-navy-dark sm:text-2xl">
              {settings.churchName}
            </h1>
          </div>
          <nav className="flex shrink-0 gap-1 rounded-xl border border-stone-200/80 bg-stone-50/80 p-1">
            {navItems.map(({ to, label, icon: Icon, match }) => {
              const active = match(location.pathname)
              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                    active
                      ? 'bg-navy-dark text-white shadow-sm'
                      : 'text-stone-600 hover:bg-white hover:text-navy-dark',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              )
            })}
          </nav>
        </div>
        {syncError && (
          <div className="border-t border-red-200/80 bg-red-50/90 px-4 py-2.5 text-center text-sm text-red-700">
            {syncError}
          </div>
        )}
      </header>
      <main className="mx-auto min-w-0 max-w-6xl overflow-x-hidden px-4 py-6 sm:px-6 sm:py-10">{children}</main>
    </div>
  )
}
