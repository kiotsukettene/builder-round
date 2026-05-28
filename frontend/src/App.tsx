import { lazy, Suspense } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "@/components/ui/sonner"
import { ProtectedRoute } from "@/components/common/ProtectedRoute"

const ConsultationRoom = lazy(() =>
  import("@/features/consultation/ConsultationRoom").then((m) => ({ default: m.ConsultationRoom }))
)
const LoginPage = lazy(() =>
  import("@/features/auth/LoginPage").then((m) => ({ default: m.LoginPage }))
)
const RegisterPage = lazy(() =>
  import("@/features/auth/RegisterPage").then((m) => ({ default: m.RegisterPage }))
)
const VerifyEmailPage = lazy(() =>
  import("@/features/auth/VerifyEmailPage").then((m) => ({ default: m.VerifyEmailPage }))
)
const EmailVerificationPending = lazy(() =>
  import("@/features/auth/EmailVerificationPending").then((m) => ({
    default: m.EmailVerificationPending,
  }))
)
const PatientCompleteProfilePage = lazy(() =>
  import("@/features/patients/CompleteProfilePage").then((m) => ({
    default: m.CompleteProfilePage,
  }))
)
const PatientProfilePage = lazy(() =>
  import("@/features/patients/PatientProfilePage").then((m) => ({
    default: m.PatientProfilePage,
  }))
)
const DoctorCompleteProfilePage = lazy(() =>
  import("@/features/doctors/CompleteProfilePage").then((m) => ({
    default: m.DoctorCompleteProfilePage,
  }))
)
const DoctorProfilePage = lazy(() =>
  import("@/features/doctors/DoctorProfilePage").then((m) => ({
    default: m.DoctorProfilePage,
  }))
)
const RecommendationPage = lazy(() =>
  import("@/features/patients/RecommendationPage").then((m) => ({
    default: m.RecommendationPage,
  }))
)
const DoctorDiscoveryPage = lazy(() =>
  import("@/features/patients/DoctorDiscoveryPage").then((m) => ({
    default: m.DoctorDiscoveryPage,
  }))
)
const DoctorDetailPage = lazy(() =>
  import("@/features/patients/DoctorDetailPage").then((m) => ({
    default: m.DoctorDetailPage,
  }))
)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
    },
  },
})

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="size-8 animate-spin rounded-full border-4 border-muted border-t-foreground" />
    </div>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public routes — redirect if already authenticated */}
            <Route element={<ProtectedRoute redirectIfAuthenticated />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* Email verification (always accessible) */}
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/verify-email-pending" element={<EmailVerificationPending />} />

            {/* Patient: complete profile — auth + patient role + verified, profile NOT complete */}
            <Route
              element={
                <ProtectedRoute
                  requiredRole="PATIENT"
                  requireVerified
                />
              }
            >
              <Route path="/complete-profile" element={<PatientCompleteProfilePage />} />
            </Route>

            {/* Doctor: complete profile — auth + doctor role + verified, profile NOT complete */}
            <Route
              element={
                <ProtectedRoute
                  requiredRole="DOCTOR"
                  requireVerified
                />
              }
            >
              <Route path="/doctor/complete-profile" element={<DoctorCompleteProfilePage />} />
            </Route>

            {/* Patient protected routes — needs complete profile */}
            <Route
              element={
                <ProtectedRoute
                  requiredRole="PATIENT"
                  requireVerified
                  requireCompleteProfile
                />
              }
            >
              <Route path="/profile" element={<PatientProfilePage />} />
              <Route path="/recommendations" element={<RecommendationPage />} />
              <Route path="/doctors" element={<DoctorDiscoveryPage />} />
              <Route path="/doctors/:id" element={<DoctorDetailPage />} />
            </Route>

            {/* Doctor protected routes — needs complete profile */}
            <Route
              element={
                <ProtectedRoute
                  requiredRole="DOCTOR"
                  requireVerified
                  requireCompleteProfile
                />
              }
            >
              <Route path="/doctor/profile" element={<DoctorProfilePage />} />
            </Route>

            {/* Consultation room — requires auth only */}
            <Route element={<ProtectedRoute requireVerified />}>
              <Route path="/consultation/:appointmentId" element={<ConsultationRoom />} />
            </Route>

            {/* Catch-all: redirect to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>

        <Toaster richColors closeButton />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
