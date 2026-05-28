import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  Clock,
  DollarSign,
  CalendarDays,
  User,
  Calendar,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { AppLayout } from "@/components/common/AppLayout"
import { StarRating } from "@/components/common/StarRating"
import { useDoctorDetail, useDoctorSlots } from "@/hooks/use-discovery"
import { useDoctorReviews } from "@/hooks/use-rating"
import type { DoctorAvailability } from "@/types/doctor"

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const DAY_NAMES_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

function formatTime(time: string) {
  const [hStr, mStr] = time.split(":")
  const h = Number(hStr)
  const m = Number(mStr)
  const ampm = h >= 12 ? "PM" : "AM"
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`
}

function AvailabilityGrid({ availabilities }: { availabilities: DoctorAvailability[] }) {
  if (availabilities.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No availability schedule set yet.</p>
    )
  }

  const byDay = DAY_NAMES.reduce<Record<number, DoctorAvailability[]>>((acc, _, i) => {
    acc[i] = availabilities.filter((a) => a.dayOfWeek === i)
    return acc
  }, {})

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {DAY_NAMES.map((day, i) => {
        const slots = byDay[i] ?? []
        return (
          <div key={i} className="flex items-start gap-3 rounded-md border px-3 py-2.5">
            <div
              className={`w-10 shrink-0 text-center text-xs font-semibold ${
                slots.length > 0 ? "text-foreground" : "text-muted-foreground/50"
              }`}
            >
              {day}
            </div>
            <div className="flex-1">
              {slots.length > 0 ? (
                <div className="flex flex-col gap-0.5">
                  {slots.map((slot) => (
                    <span key={slot.id} className="text-xs text-muted-foreground">
                      {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-muted-foreground/50">Not available</span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function SlotPicker({ doctorId }: { doctorId: string }) {
  const today = new Date()
  const [selectedDate, setSelectedDate] = useState<Date>(today)

  const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`
  const { data: slotsData, isLoading } = useDoctorSlots(doctorId, dateStr)

  function shiftDate(days: number) {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + days)
    if (d >= today) setSelectedDate(d)
  }

  const displayDate = selectedDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="space-y-4">
      {/* Date navigation */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={() => shiftDate(-1)}
          disabled={selectedDate <= today}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="flex-1 text-center text-sm font-medium">{displayDate}</span>
        <Button variant="ghost" size="icon" className="size-8" onClick={() => shiftDate(1)}>
          <ChevronRight className="size-4" />
        </Button>
      </div>

      {/* Slots */}
      {isLoading ? (
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20" />
          ))}
        </div>
      ) : slotsData && slotsData.slots.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {slotsData.slots.map((slot) => (
            <Button
              key={slot.startTime}
              variant="outline"
              size="sm"
              disabled={!slot.available}
              className={!slot.available ? "line-through opacity-40" : ""}
              title={!slot.available ? "This slot is already booked" : undefined}
            >
              {formatTime(slot.startTime)}
            </Button>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-md border border-dashed p-4 text-sm text-muted-foreground">
          <CalendarDays className="size-4 shrink-0" />
          No available slots for this day.
        </div>
      )}

      {slotsData && slotsData.consultationFee !== null && (
        <p className="text-xs text-muted-foreground">
          Consultation fee: <span className="font-medium text-foreground">${slotsData.consultationFee}</span>
          {" · "}
          Duration: <span className="font-medium text-foreground">{slotsData.consultationDuration} min</span>
        </p>
      )}
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <Skeleton className="size-20 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-5 w-28" />
          <div className="flex gap-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </div>
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  )
}

export function DoctorDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: doctor, isLoading, isError } = useDoctorDetail(id)
  const { data: reviewsData, isLoading: isReviewsLoading } = useDoctorReviews(id)

  if (isLoading) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-3xl">
          <Button
            variant="ghost"
            size="sm"
            className="mb-6 -ml-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>
          <DetailSkeleton />
        </div>
      </AppLayout>
    )
  }

  if (isError || !doctor) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-3xl">
          <Button
            variant="ghost"
            size="sm"
            className="mb-6 -ml-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>
          <Card className="border-destructive/30">
            <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
              <AlertCircle className="size-10 text-destructive/60" />
              <p className="font-medium">Doctor not found</p>
              <p className="text-sm text-muted-foreground">
                This doctor's profile may no longer be available.
              </p>
              <Button variant="outline" onClick={() => navigate("/doctors")}>
                Back to Doctor List
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    )
  }

  const availableDays = doctor.availabilities
    .map((a) => DAY_NAMES_FULL[a.dayOfWeek])
    .filter(Boolean)
  const uniqueDays = [...new Set(availableDays)]

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Back nav */}
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="size-4" />
          Back
        </Button>

        {/* Doctor header card */}
        <Card>
          <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-start">
            <Avatar className="size-20 shrink-0 self-center sm:self-start">
              <AvatarImage
                src={doctor.profilePicture ?? undefined}
                alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
              />
              <AvatarFallback className="text-xl">
                <User className="size-8" />
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-3 text-center sm:text-left">
              <div>
                <h1 className="text-xl font-bold">
                  Dr. {doctor.firstName} {doctor.lastName}
                </h1>
                <Badge variant="outline" className="mt-1">
                  {doctor.specialization}
                </Badge>
                <div className="mt-2 flex justify-center sm:justify-start">
                  <StarRating
                    rating={doctor.averageRating}
                    totalReviews={doctor.totalReviews}
                    size="md"
                  />
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-4 sm:justify-start">
                {doctor.fee !== null && (
                  <div className="flex items-center gap-1.5 text-sm">
                    <DollarSign className="size-4 text-muted-foreground" />
                    <span className="font-medium">${doctor.fee}</span>
                    <span className="text-muted-foreground">/ session</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-sm">
                  <Clock className="size-4 text-muted-foreground" />
                  <span className="font-medium">{doctor.consultationDuration} min</span>
                  <span className="text-muted-foreground">consultation</span>
                </div>
                {uniqueDays.length > 0 && (
                  <div className="flex items-center gap-1.5 text-sm">
                    <Calendar className="size-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{uniqueDays.join(", ")}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bio */}
        {doctor.bio && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">{doctor.bio}</p>
            </CardContent>
          </Card>
        )}

        {/* Patient reviews */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Patient Reviews</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isReviewsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : reviewsData && reviewsData.reviews.length > 0 ? (
              <>
                <StarRating
                  rating={reviewsData.averageRating}
                  totalReviews={reviewsData.totalReviews}
                  size="md"
                />
                <div className="space-y-3">
                  {reviewsData.reviews.map((review) => (
                    <div key={review.id} className="rounded-lg border p-4">
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-medium">{review.patientName}</p>
                        <StarRating rating={review.rating} showCount={false} />
                      </div>
                      {review.comment && (
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {review.comment}
                        </p>
                      )}
                      <p className="mt-2 text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                No patient reviews yet. Be the first to share your experience after a consultation.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Weekly availability */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Weekly Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <AvailabilityGrid availabilities={doctor.availabilities} />
          </CardContent>
        </Card>

        {/* Slot picker + booking CTA */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarDays className="size-4" />
              Available Slots
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <SlotPicker doctorId={doctor.id} />
            <Separator />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Select a time slot to book your consultation.
              </p>
              <Button disabled className="sm:shrink-0" title="Booking coming soon">
                Book Consultation
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Appointment booking will be available soon.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
