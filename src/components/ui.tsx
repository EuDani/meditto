import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react'

export function GlassCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-3xl border border-card-border bg-card p-5 text-fg shadow-lg backdrop-blur-md ${className}`}
    >
      {children}
    </div>
  )
}

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 disabled:bg-brand-600/50',
  secondary: 'bg-btn-secondary text-fg hover:bg-btn-secondary-hover',
  ghost: 'bg-transparent text-fg hover:bg-btn-secondary',
  danger: 'bg-red-700 text-white hover:bg-red-800',
}

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${VARIANT_CLASSES[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

export function TextField({ label, className = '', ...rest }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="flex flex-col gap-1 text-left text-sm font-medium text-fg">
      {label}
      <input
        className={`rounded-xl border border-line bg-field px-4 py-2.5 text-fg placeholder-fg-muted/70 outline-none focus:border-brand-500 ${className}`}
        {...rest}
      />
    </label>
  )
}
