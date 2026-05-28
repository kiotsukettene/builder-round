import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import {
  Sparkles,
  AlertCircle,
  RefreshCw,
  Stethoscope,
  ArrowRight,
  Search,
  History,
  MessageSquareText,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AppLayout } from "@/components/common/AppLayout"
import { DoctorCard } from "@/features/patients/components/DoctorCard"
import { SymptomSearchDialog } from "@/features/patients/components/SymptomSearchDialog"
import { useDefaultRecommendation, useCustomRecommendation } from "@/hooks/use-recommendation"
import { useRecommendationLimit } from "@/hooks/use-recommendation-limit"
import type { RecommendationResponse } from "@/types/recommendation"

interface LocationState {
  customRecommendation?: RecommendationResponse
}

type RecommendationSource = "history" | "symptoms"

function RecommendationSkeleton({ message }: { message: string }) {
  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="size-6 animate-pulse text-primary" />
          </div>
          <div className="space-y-1.5">
            <p className="font-medium">{message}</p>
            <p className="text-sm text-muted-foreground">
              This usually takes a few seconds.
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
  const location = useLocation()
  const locationState = location.state as LocationState | null

  const {
    data: historyData,
    isLoading: isHistoryLoading,
    isError: isHistoryError,
    error: historyError,
    refetch,
  } = useDefaultRecommendation()

  const { mutateAsync: getCustomRecommendation, isPending: isCustomPending } =
    useCustomRecommendation()

  const { remaining, canUse, resetLabel, maxAttempts, recordUsage } = useRecommendationLimit()

  const [symptomData, setSymptomData] = useState<RecommendationResponse | null>(
    () => locationState?.customRecommendation ?? null
  )
  const [source, setSource] = useState<RecommendationSource>(
    locationState?.customRecommendation ? "symptoms" : "history"
  )

  useEffect(() => {
    if (locationState?.customRecommendation) {
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [location.pathname, locationState?.customRecommendation, navigate])

  const displayData = source === "symptoms" && symptomData ? symptomData : historyData
  const isInitialLoading = isHistoryLoading && !symptomData
  const isAnalyzingSymptoms = isCustomPending

  const errorMessage =
    (historyError as { response?: { data?: { message?: string } } })?.response?.data?.message ??
    "Something went wrong. Please try again."

  function handleBrowseAll() {
    const specialization = displayData?.recommendation.specialization
    if (specialization) {
      navigate(`/doctors?specialization=${encodeURIComponent(specialization)}`)
    } else {
      navigate("/doctors")
    }
  }

  async function handleSymptomSubmit(symptoms: string) {
    if (!canUse) {
      toast.error(
        resetLabel
          ? `You've used all symptom-based recommendations. Try again in ${resetLabel}.`
          : "You've reached the symptom-based recommendation limit for now."
      )
      throw new Error("limit reached")
    }

    const res = await getCustomRecommendation(symptoms)
    setSymptomData(res.data)
    setSource("symptoms")
    recordUsage()
    toast.success("Recommendation updated based on your current symptoms.")
  }

  function handleShowHistoryRecommendation() {
    setSource("history")
    toast.message("Showing recommendation from your medical history.")
  }

  const subtitle =
    source === "symptoms"
      ? "Updated based on the symptoms you described."
      : "Based on your medical history — describe current symptoms if they differ."

  const sourceBadge =
    source === "symptoms" ? (
      <Badge variant="secondary" className="gap-1">
        <MessageSquareText className="size-3" />
        From your symptoms
      </Badge>
    ) : (
      <Badge variant="outline" className="gap-1">
        <History className="size-3" />
        From medical history
      </Badge>
    )

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                <Sparkles className="size-6 text-primary" />
                AI Doctor Recommendation
              </h1>
              <p className="text-sm text-muted-foreground">{subtitle}</p>
              {sourceBadge}
            </div>

            {!isInitialLoading && !isHistoryError && (
              <div className="flex flex-col items-end gap-2">
                <SymptomSearchDialog
                  onSubmit={handleSymptomSubmit}
                  isPending={isAnalyzingSymptoms}
                  disabled={!canUse}
                  remainingAttempts={remaining}
                  maxAttempts={maxAttempts}
                  resetLabel={resetLabel}
                />
                {!canUse && resetLabel && (
                  <p className="text-xs text-muted-foreground">
                    Symptom checks reset in {resetLabel}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {isInitialLoading && (
          <RecommendationSkeleton message="Analyzing your health profile..." />
        )}

        {isAnalyzingSymptoms && !isInitialLoading && (
          <RecommendationSkeleton message="Analyzing your described symptoms..." />
        )}

        {!isInitialLoading && !isAnalyzingSymptoms && isHistoryError && source === "history" && (
          <ErrorState message={errorMessage} onRetry={() => refetch()} />
        )}

        {!isInitialLoading &&
          !isAnalyzingSymptoms &&
          displayData &&
          !(isHistoryError && source === "history") && (
            <div className="space-y-8">
              {source === "symptoms" && historyData && (
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-muted/40 px-4 py-3 text-sm">
                  <span className="text-muted-foreground">
                    Want to see your original recommendation from medical history?
                  </span>
                  <Button variant="link" className="h-auto p-0" onClick={handleShowHistoryRecommendation}>
                    View history-based recommendation
                  </Button>
                </div>
              )}

              <Card className="border-primary/20 bg-linear-to-br from-primary/5 to-background">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Sparkles className="size-4 text-primary" />
                    AI Recommendation
                  </div>
                  <CardTitle className="flex flex-wrap items-center gap-3 text-xl">
                    <Stethoscope className="size-5 text-primary" />
                    {displayData.recommendation.specialization}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {displayData.recommendation.explanation}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={handleBrowseAll}>
                      Browse All {displayData.recommendation.specialization} Doctors
                      <ArrowRight className="size-4" />
                    </Button>
                    <Button variant="outline" onClick={() => navigate("/doctors")}>
                      <Search className="size-4" />
                      Explore All Doctors
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {displayData.doctors.length > 0 ? (
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold">Matching Doctors</h2>
                      <p className="text-sm text-muted-foreground">
                        {displayData.doctors.length}{" "}
                        {displayData.doctors.length === 1 ? "doctor" : "doctors"} found for{" "}
                        <Badge variant="secondary" className="text-xs font-normal">
                          {displayData.recommendation.specialization}
                        </Badge>
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {displayData.doctors.map((doctor) => (
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
