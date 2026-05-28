import { useEffect, useRef, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, Stethoscope } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AppLayout } from "@/components/common/AppLayout"
import { DoctorCard } from "@/features/patients/components/DoctorCard"
import { SymptomSearchDialog } from "@/features/patients/components/SymptomSearchDialog"
import { useDoctorList } from "@/hooks/use-discovery"
import { useCustomRecommendation } from "@/hooks/use-recommendation"
import { useRecommendationLimit } from "@/hooks/use-recommendation-limit"

const ITEMS_PER_PAGE = 9

function DoctorGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="flex flex-col gap-4 p-5">
            <div className="flex items-start gap-3">
              <Skeleton className="size-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3.5 w-20" />
              </div>
            </div>
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-8 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function DoctorDiscoveryPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const { mutateAsync: getCustomRecommendation, isPending: isCustomPending } =
    useCustomRecommendation()
  const { remaining, canUse, resetLabel, maxAttempts, recordUsage } = useRecommendationLimit()

  // Filters driven by URL params for shareability
  const [search, setSearch] = useState(searchParams.get("search") ?? "")
  const [specialization, setSpecialization] = useState(
    searchParams.get("specialization") ?? ""
  )
  const [page, setPage] = useState(Number(searchParams.get("page") ?? "1"))

  // Debounced search value
  const [debouncedSearch, setDebouncedSearch] = useState(search)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Collect all unique specializations seen across pages
  const [knownSpecializations, setKnownSpecializations] = useState<string[]>([])

  const { data, isLoading, isFetching } = useDoctorList({
    search: debouncedSearch || undefined,
    specialization: specialization || undefined,
    page,
    limit: ITEMS_PER_PAGE,
  })

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    if (debouncedSearch) params.set("search", debouncedSearch)
    if (specialization) params.set("specialization", specialization)
    if (page > 1) params.set("page", String(page))
    setSearchParams(params, { replace: true })
  }, [debouncedSearch, specialization, page, setSearchParams])

  // Debounce the search input
  function handleSearchChange(value: string) {
    setSearch(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(value)
      setPage(1)
    }, 350)
  }

  function handleSpecializationChange(value: string) {
    setSpecialization(value === "all" ? "" : value)
    setPage(1)
  }

  // Collect specializations from the loaded results
  useEffect(() => {
    if (!data?.data) return
    setKnownSpecializations((prev) => {
      const all = new Set([...prev, ...data.data.map((d) => d.specialization)])
      return Array.from(all).sort()
    })
  }, [data])

  const doctors = data?.data ?? []
  const meta = data?.meta
  const totalPages = meta?.totalPages ?? 1
  const totalResults = meta?.total ?? 0

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
    recordUsage()
    navigate("/recommendations", {
      state: { customRecommendation: res.data },
    })
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Find a Doctor</h1>
            <p className="text-sm text-muted-foreground">
              Browse available specialists and book a consultation.
            </p>
          </div>
          <SymptomSearchDialog
            onSubmit={handleSymptomSubmit}
            isPending={isCustomPending}
            disabled={!canUse}
            remainingAttempts={remaining}
            maxAttempts={maxAttempts}
            resetLabel={resetLabel}
            trigger={
              <Button variant="outline" disabled={!canUse}>
                <Search className="size-4" />
                Search by Symptoms
              </Button>
            }
          />
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by doctor name..."
              className="pl-9"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="size-4 shrink-0 text-muted-foreground" />
            <Select
              value={specialization || "all"}
              onValueChange={handleSpecializationChange}
            >
              <SelectTrigger className="w-52">
                <SelectValue placeholder="All Specializations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specializations</SelectItem>
                {knownSpecializations.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Doctor grid */}
        {(isLoading || isFetching) && doctors.length === 0 ? (
          <DoctorGridSkeleton />
        ) : doctors.length > 0 ? (
          <>
            <div className="mb-3 text-sm text-muted-foreground">
              {totalResults} doctor{totalResults !== 1 ? "s" : ""} found
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {doctors.map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} />
              ))}
            </div>
          </>
        ) : (
          !isLoading && (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <Stethoscope className="size-10 text-muted-foreground/40" />
              <div className="space-y-1">
                <p className="font-medium">No doctors found</p>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search or removing the specialization filter.
                </p>
              </div>
              {(debouncedSearch || specialization) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearch("")
                    setDebouncedSearch("")
                    setSpecialization("")
                    setPage(1)
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || isFetching}
            >
              <ChevronLeft className="size-4" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || isFetching}
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
