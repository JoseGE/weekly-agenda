import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  children?: ReactNode
  className?: string
}

export function PageHeader({ title, description, children, className }: PageHeaderProps) {
  return (
    <section className={cn('page-enter', className)}>
      <div className="app-accent-bar mb-4" />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-semibold text-navy-dark">{title}</h2>
          {description && <p className="mt-2 max-w-2xl text-base text-stone-600">{description}</p>}
        </div>
        {children}
      </div>
    </section>
  )
}
