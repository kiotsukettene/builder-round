import { useNavigate } from "react-router-dom"
import { Sparkles, AlertCircle, RefreshCw, Stethoscope, ArrowRight, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AppLayout } from "@/components/common/AppLayout"
import { DoctorCard } from "@/features/patients/components/DoctorCard"
import { SymptomSearchDialog } from "@/features/patients/components/SymptomSearchDialog"
import { useDefaultRecommendation } from "@/hooks/use-recommendation"

function RecommendationSkeleton() {
  return (
    <div className="space-y-6">
      {/* AI thinking card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="size-6 animate-pulse text-primary" />
          </div>
          <div className="space-y-1.5">
            <p className="font-medium">Analyzing your health profile...</p>
            <p className="text-sm text-muted-foreground">
              Our AI is reviewing your medical history to find the right specialist for you.
            </p>
          </div>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="size-2 animate-bounce rounded-full bg-primary/50"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Doctor card skeletons */}
      <div>
        <Skeleton className="mb-4 h-5 w-40" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <Card key={n}>
              <CardContent className="flex flex-col gap-4 p-5">
                <div className="flex items-start gap-3">
                  <Skeleton className="size-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3.5 w-20" />
                  </div>
                </div>
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Card className="border-destructive/30">
      <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="size-6 text-destructive" />
        </div>
        <div className="space-y-1">
          <p className="font-medium">Unable to get recommendation</p>
          <p className="max-w-sm text-sm text-muted-foreground">{message}</p>
        </div>
        <Button variant="outline" onClick={onRetry}>
          <RefreshCw className="size-4" />
          Try Again
        </Button>
      </CardContent>
    </Card>
  )
}

export function RecommendationPage() {
  const navigate = useNavigate()
  const { data, isLoading, isError, error, refetch } = useDefaultRecommendation()

  const errorMessage =
    (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
    "Something went wrong. Please try again."

  function handleBrowseAll() {
    if (data?.recommendation.specialization) {
      navigate(`/doctors?specialization=${encodeURIComponent(data.recommendation.specialization)}`)
    } else {
      navigate("/doctors")
    }
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl">
        {/* Page header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                <Sparkles className="size-6 text-primary" />
                AI Doctor Recommendation
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Based on your medical history, here's who we recommend seeing.
              </p>
            </div>
            {!isLoading && (
              <SymptomSearchDialog />
            )}
          </div>
        </div>

        {isLoading && <RecommendationSkeleton />}

        {isError && (
          <ErrorState
            message={errorMessage}
            onRetry={() => refetch()}
          />
        )}

        {!isLoading && !isError && data && (
          <div className="space-y-8">
            {/* Recommendation card */}
            <Card className="border-primary/20 bg-linear-to-br from-primary/5 to-background">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Sparkles className="size-4 text-primary" />
                  AI Recommendation
                </div>
                <CardTitle className="flex flex-wrap items-center gap-3 text-xl">
                  <Stethoscope className="size-5 text-primary" />
                  {data.recommendation.specialization}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {data.recommendation.explanation}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={handleBrowseAll}>
                    Browse All {data.recommendation.specialization} Doctors
                    <ArrowRight className="size-4" />
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/doctors")}>
                    <Search className="size-4" />
                    Explore All Doctors
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Matched doctors */}
            {data.doctors.length > 0 ? (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">Matching Doctors</h2>
                    <p className="text-sm text-muted-foreground">
                      {data.doctors.length} {data.doctors.length === 1 ? "doctor" : "doctors"} found for{" "}
                      <Badge variant="secondary" className="text-xs font-normal">
                        {data.recommendation.specialization}
                      </Badge>
                    </p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {data.doctors.map((doctor) => (
                    <DoctorCard key={doctor.id} doctor={doctor} isRecommended />
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <Separator className="mb-6" />
                <div className="flex flex-col items-center gap-3 py-10 text-center">
                  <Stethoscope className="size-10 text-muted-foreground/50" />
                  <div className="space-y-1">
                    <p className="font-medium">No doctors found for this specialization yet</p>
                    <p className="text-sm text-muted-foreground">
                      Browse all available doctors to find the right care for you.
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => navigate("/doctors")}>
                    Browse All Doctors
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
