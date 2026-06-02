import { Link, useLocation } from 'react-router-dom'
import { CalendarDays, Loader2, Settings } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { cn } from '@/lib/utils'

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const { loading, syncError, settings } = useApp()

  const navItems = [
    { to: '/', label: 'Programas', icon: CalendarDays },
    { to: '/configuracion', label: 'Configuración', icon: Settings },
  ]

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <div className="flex items-center gap-3 text-stone-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          Cargando programa...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-stone-500">Programa Semanal</p>
            <h1 className="text-xl font-semibold text-stone-900">{settings.churchName}</h1>
          </div>
          <nav className="flex gap-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  location.pathname === to
                    ? 'bg-stone-900 text-white'
                    : 'text-stone-600 hover:bg-stone-100',
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
        </div>
        {syncError && (
          <div className="border-t border-red-200 bg-red-50 px-4 py-2 text-center text-sm text-red-700">
            {syncError}
          </div>
        )}
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  )
}
