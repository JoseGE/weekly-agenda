import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-navy-dark text-white',
        secondary: 'border-transparent bg-navy-soft text-navy-dark',
        destructive: 'border-transparent bg-red-100 text-red-800',
        warning: 'border-transparent bg-church-gold-soft text-amber-900 ring-1 ring-church-gold/20',
        outline: 'border-stone-300/80 bg-white/80 text-stone-700',
        gold: 'border-transparent bg-church-gold/15 text-church-gold ring-1 ring-church-gold/25',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
