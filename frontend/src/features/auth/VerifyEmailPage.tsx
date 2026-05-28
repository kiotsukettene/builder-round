import { useEffect, useRef, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import * as authService from "@/services/auth.service"

type VerifyStatus = "idle" | "loading" | "success" | "error"

function getInitialStatus(token: string | null): VerifyStatus {
  if (!token) return "idle"
  if (sessionStorage.getItem(`tellmd-verified:${token}`)) return "success"
  return "loading"
}

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")
  const [status, setStatus] = useState<VerifyStatus>(() => getInitialStatus(token))
  const [errorMessage, setErrorMessage] = useState(
    "The verification link is invalid or has expired."
  )
  const verifiedTokenRef = useRef<string | null>(null)

  useEffect(() => {
    if (!token) return
    if (verifiedTokenRef.current === token || sessionStorage.getItem(`tellmd-verified:${token}`)) {
      setStatus("success")
      return
    }

    let cancelled = false
    setStatus("loading")

    authService
      .verifyEmail(token)
      .then(() => {
        if (!cancelled) {
          verifiedTokenRef.current = token
          sessionStorage.setItem(`tellmd-verified:${token}`, "1")
          setStatus("success")
        }
      })
      .catch((error: { response?: { data?: { message?: string } } }) => {
        if (!cancelled) {
          setErrorMessage(
            error?.response?.data?.message ??
              "The verification link is invalid or has expired."
          )
          setStatus("error")
        }
      })

    return () => {
      cancelled = true
    }
  }, [token])

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-destructive/10">
                <XCircle className="size-6 text-destructive" />
              </div>
              <CardTitle>Invalid Link</CardTitle>
              <CardDescription>No verification token found in the URL.</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button asChild className="w-full">
                <Link to="/login">Back to Login</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight">TellMD</h1>
        </div>

        <Card>
          <CardHeader className="text-center">
            {status === "loading" && (
              <>
                <div className="mx-auto mb-3 flex size-12 items-center justify-center">
                  <Loader2 className="size-8 animate-spin text-muted-foreground" />
                </div>
                <CardTitle>Verifying your email</CardTitle>
                <CardDescription>Please wait a moment...</CardDescription>
              </>
            )}

            {status === "success" && (
              <>
                <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10">
                  <CheckCircle className="size-6 text-primary" />
                </div>
                <CardTitle>Email Verified!</CardTitle>
                <CardDescription>
                  Your email has been successfully verified. You can now sign in to your account.
                </CardDescription>
              </>
            )}

            {status === "error" && (
              <>
                <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-destructive/10">
                  <XCircle className="size-6 text-destructive" />
                </div>
                <CardTitle>Verification Failed</CardTitle>
                <CardDescription>{errorMessage}</CardDescription>
              </>
            )}
          </CardHeader>

          <CardContent className="flex flex-col gap-3">
            {status === "success" && (
              <Button asChild className="w-full">
                <Link to="/login">Sign In</Link>
              </Button>
            )}
            {status === "error" && (
              <>
                <Button asChild className="w-full">
                  <Link to="/verify-email-pending">Resend Verification Email</Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link to="/login">Back to Login</Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
