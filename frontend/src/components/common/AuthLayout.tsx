interface AuthLayoutProps {
  children: React.ReactNode
  footer?: React.ReactNode
}

export function AuthLayout({ children, footer }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight">TellMD</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tell us your symptoms. We connect you to the right doctor.
          </p>
        </div>
        {children}
        {footer ? <div className="mt-4">{footer}</div> : null}
      </div>
    </div>
  )
}
