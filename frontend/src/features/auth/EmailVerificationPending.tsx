import { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Mail, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthLayout } from "@/components/common/AuthLayout"
import { useResendVerification } from "@/hooks/use-auth"

const COOLDOWN_SECONDS = 30

export function EmailVerificationPending() {
  const location = useLocation()
  const prefillEmail = (location.state as { email?: string })?.email ?? ""
  const [email, setEmail] = useState(prefillEmail)
  const [cooldown, setCooldown] = useState(0)
  const { mutate: resend, isPending } = useResendVerification()

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  function handleResend() {
    if (!email || cooldown > 0) return
    resend(email, {
      onSuccess: () => setCooldown(COOLDOWN_SECONDS),
    })
  }

  return (
    <AuthLayout
      footer={
        <p className="text-center text-sm text-muted-foreground">
          Wrong email?{" "}
          <Link
            to="/register"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Register again
          </Link>
        </p>
      }
    >
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-muted">
            <Mail className="size-6 text-muted-foreground" />
          </div>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            We&apos;ve sent a verification link to{" "}
            {prefillEmail ? (
              <span className="font-medium text-foreground">{prefillEmail}</span>
            ) : (
              "your email address"
            )}
            . Click the link to activate your account.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-lg border bg-muted/50 p-3 text-sm text-muted-foreground">
            Didn&apos;t receive the email? Check your spam folder, or resend below.
          </div>

          <div className="space-y-2">
            <Label htmlFor="resend-email">Email address</Label>
            <Input
              id="resend-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <Button
            className="w-full"
            onClick={handleResend}
            disabled={isPending || cooldown > 0 || !email}
          >
            <RefreshCw className="size-4" />
            {isPending
              ? "Sending..."
              : cooldown > 0
                ? `Resend in ${cooldown}s`
                : "Resend Verification Email"}
          </Button>

          <Button variant="outline" asChild className="w-full">
            <Link to="/login">Back to Login</Link>
          </Button>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
