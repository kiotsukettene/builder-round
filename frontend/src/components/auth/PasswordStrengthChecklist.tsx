import { Check, Circle } from "lucide-react"
import { cn } from "@/lib/utils"

export const PASSWORD_CHECKS = [
  { label: "At least 8 characters", test: (v: string) => v.length >= 8 },
  { label: "One lowercase letter", test: (v: string) => /[a-z]/.test(v) },
  { label: "One uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
  { label: "One number", test: (v: string) => /\d/.test(v) },
  { label: "One special character", test: (v: string) => /[^A-Za-z0-9]/.test(v) },
] as const

interface PasswordStrengthChecklistProps {
  password: string
  className?: string
}

export function PasswordStrengthChecklist({ password, className }: PasswordStrengthChecklistProps) {
  if (!password) return null

  return (
    <ul className={cn("space-y-1.5", className)}>
      {PASSWORD_CHECKS.map(({ label, test }) => {
        const passed = test(password)
        return (
          <li
            key={label}
            className={cn(
              "flex items-center gap-2 text-xs transition-colors",
              passed ? "text-emerald-600 dark:text-emerald-500" : "text-muted-foreground"
            )}
          >
            {passed ? (
              <Check className="size-3 shrink-0" />
            ) : (
              <Circle className="size-3 shrink-0" />
            )}
            {label}
          </li>
        )
      })}
    </ul>
  )
}
