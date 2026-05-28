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
import { BookingConfirmDialog } from "@/features/patients/components/BookingConfirmDialog"
import { useDoctorDetail, useDoctorSlots } from "@/hooks/use-discovery"
import { useDoctorReviews } from "@/hooks/use-rating"
import type { DoctorAvailability, PublicDoctorWithAvailability } from "@/types/doctor"
import { formatDateQueryParam, formatSlotTime } from "@/utils/appointment-datetime"

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const DAY_NAMES_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

function formatTime(time: string) {
  return formatSlotTime(time)
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

interface SlotPickerProps {
  doctorId: string
  availabilities: DoctorAvailability[]
  onSlotSelect?: (
    slot: string | null,
    date: Date,
    slotsData: { consultationDuration: number; consultationFee: number | null } | null
  ) => void
}

function SlotPicker({ doctorId, availabilities, onSlotSelect }: SlotPickerProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(today))
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)

  const dateStr = formatDateQueryParam(selectedDate)
  const { data: slotsData, isLoading } = useDoctorSlots(doctorId, dateStr)

  const dayHasSchedule = availabilities.some(
    (a) => a.dayOfWeek === selectedDate.getDay(),
  )
  const hasBookableSlots =
    !!slotsData?.slots.some((slot) => slot.available) 
  const isDateUnavailable =
    !dayHasSchedule ||
    (!isLoading && !!slotsData && !hasBookableSlots)

  function shiftDate(days: number) {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + days)
    if (d >= today) {
      setSelectedDate(d)
      setSelectedSlot(null)
      onSlotSelect?.(null, d, null)
    }
  }

  function handleSlotClick(slot: string) {
    const next = selectedSlot === slot ? null : slot
    setSelectedSlot(next)
    onSlotSelect?.(
      next,
      selectedDate,
      next && slotsData
        ? { consultationDuration: slotsData.consultationDuration, consultationFee: slotsData.consultationFee }
        : null
    )
  }

  const displayDate = selectedDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="space-y-4">
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
        <span
          className={`flex-1 text-center text-sm font-medium ${
            isDateUnavailable
          }`}
        >
          {displayDate}
        </span>
        <Button variant="ghost" size="icon" className="size-8" onClick={() => shiftDate(1)}>
          <ChevronRight className="size-4" />
        </Button>
      </div>

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
              variant={selectedSlot === slot.startTime ? "default" : "outline"}
              size="sm"
              disabled={!slot.available}
              className={!slot.available ? "line-through opacity-40" : ""}
              title={!slot.available ? "This slot is already booked" : undefined}
              onClick={() => slot.available && handleSlotClick(slot.startTime)}
            >
              {formatTime(slot.startTime)}
            </Button>
          ))}
        </div>
      ) : (
        <div
          className={`flex items-center gap-2 rounded-md border border-dashed p-4 text-sm ${
            isDateUnavailable ? "text-destructive" : "text-muted-foreground"
          }`}
        >
          <CalendarDays className="size-4 shrink-0" />
          No available slots for this day.
        </div>
      )}

      {slotsData && slotsData.consultationFee !== null && (
        <p className="text-xs text-muted-foreground">
          Consultation fee:{" "}
          <span className="font-medium text-foreground">${slotsData.consultationFee}</span>
          {" · "}
          Duration:{" "}
          <span className="font-medium text-foreground">{slotsData.consultationDuration} min</span>
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

interface BookingState {
  slot: string
  date: Date
  consultationDuration: number
  consultationFee: number | null
}

function DoctorDetailContent({ doctor }: { doctor: PublicDoctorWithAvailability }) {
  const navigate = useNavigate()
  const { data: reviewsData, isLoading: isReviewsLoading } = useDoctorReviews(doctor.id)
  const [bookingState, setBookingState] = useState<BookingState | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const availableDays = doctor.availabilities
    .map((a) => DAY_NAMES_FULL[a.dayOfWeek])
    .filter(Boolean)
  const uniqueDays = [...new Set(availableDays)]

  function handleSlotSelect(
    slot: string | null,
    date: Date,
    meta: { consultationDuration: number; consultationFee: number | null } | null
  ) {
    if (slot && meta) {
      setBookingState({ slot, date, consultationDuration: meta.consultationDuration, consultationFee: meta.consultationFee })
    } else {
      setBookingState(null)
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="size-4" />
        Back
      </Button>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <aside className="lg:col-span-1">
          <Card className="lg:sticky lg:top-6">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarDays className="size-4" />
                Available Slots
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <SlotPicker
                doctorId={doctor.id}
                availabilities={doctor.availabilities}
                onSlotSelect={handleSlotSelect}
              />
              <Separator />
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {bookingState
                    ? `Selected: ${formatTime(bookingState.slot)} on ${bookingState.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                    : "Select a time slot to book your consultation."}
                </p>
                <Button
                  disabled={!bookingState}
                  className="w-full"
                  onClick={() => setConfirmOpen(true)}
                >
                  Book Consultation
                </Button>
              </div>
            </CardContent>
          </Card>
        </aside>

        <div className="space-y-6 lg:col-span-3">
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

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Weekly Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <AvailabilityGrid availabilities={doctor.availabilities} />
            </CardContent>
          </Card>
        </div>
      </div>

      {bookingState && (
        <BookingConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          doctor={doctor}
          selectedDate={bookingState.date}
          selectedSlot={bookingState.slot}
          consultationDuration={bookingState.consultationDuration}
          consultationFee={bookingState.consultationFee}
        />
      )}
    </div>
  )
}

export function DoctorDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: doctor, isLoading, isError } = useDoctorDetail(id)

  if (isLoading) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-6xl">
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
        <div className="mx-auto max-w-6xl">
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

  return (
    <AppLayout>
      <DoctorDetailContent doctor={doctor} />
    </AppLayout>
  )
}
