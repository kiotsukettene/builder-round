import { useState } from "react"
import {
  Plus,
  Trash2,
  Clock,
  CalendarOff,
  Info,
  CalendarDays,
  ChevronDown,
} from "lucide-react"
import { AppLayout } from "@/components/common/AppLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar } from "@/components/ui/calendar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useAvailability,
  useSetAvailability,
  useBlockedDates,
  useBlockDate,
  useRemoveBlockedDate,
} from "@/hooks/use-schedule"
import type { SetAvailabilitySlot } from "@/types/schedule"
import { formatDateQueryParam } from "@/utils/appointment-datetime"

const DAYS = [
  { label: "Monday", short: "Mon", value: 1 },
  { label: "Tuesday", short: "Tue", value: 2 },
  { label: "Wednesday", short: "Wed", value: 3 },
  { label: "Thursday", short: "Thu", value: 4 },
  { label: "Friday", short: "Fri", value: 5 },
  { label: "Saturday", short: "Sat", value: 6 },
  { label: "Sunday", short: "Sun", value: 0 },
]

const TIME_OPTIONS: string[] = []
for (let h = 0; h < 24; h++) {
  for (const m of [0, 30]) {
    TIME_OPTIONS.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`)
  }
}

function formatTime(time: string) {
  const [hStr, mStr] = time.split(":")
  const h = Number(hStr)
  const m = Number(mStr)
  const ampm = h >= 12 ? "PM" : "AM"
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`
}

interface DaySlot {
  startTime: string
  endTime: string
}

interface DayConfig {
  enabled: boolean
  windows: DaySlot[]
}

function buildInitialDayConfig(
  slots: SetAvailabilitySlot[]
): Record<number, DayConfig> {
  const config: Record<number, DayConfig> = {}
  for (const day of DAYS) {
    const daySlots = slots.filter((s) => s.dayOfWeek === day.value)
    config[day.value] = {
      enabled: daySlots.length > 0,
      windows: daySlots.length > 0
        ? daySlots.map((s) => ({ startTime: s.startTime, endTime: s.endTime }))
        : [{ startTime: "09:00", endTime: "17:00" }],
    }
  }
  return config
}

function TimeSelect({
  value,
  onChange,
  excludeBefore,
}: {
  value: string
  onChange: (v: string) => void
  excludeBefore?: string
}) {
  const options = excludeBefore
    ? TIME_OPTIONS.filter((t) => t > excludeBefore)
    : TIME_OPTIONS

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex h-9 w-full appearance-none rounded-md border border-input bg-background px-3 py-1 pr-8 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
      >
        {options.map((t) => (
          <option key={t} value={t}>
            {formatTime(t)}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-2.5 size-4 text-muted-foreground" />
    </div>
  )
}

function AvailabilityEditor() {
  const { data: availability, isLoading } = useAvailability()
  const { mutate: saveAvailability, isPending: isSaving } = useSetAvailability()

  const [duration, setDuration] = useState<number>(30)
  const [dayConfig, setDayConfig] = useState<Record<number, DayConfig> | null>(null)
  const [hasLoaded, setHasLoaded] = useState(false)

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    )
  }

  if (!hasLoaded && availability) {
    setDuration(availability.consultationDuration)
    setDayConfig(buildInitialDayConfig(availability.slots))
    setHasLoaded(true)
  }

  const config = dayConfig ?? buildInitialDayConfig([])

  function toggleDay(dayValue: number) {
    setDayConfig((prev) => ({
      ...prev!,
      [dayValue]: {
        ...prev![dayValue],
        enabled: !prev![dayValue].enabled,
      },
    }))
  }

  function updateWindow(dayValue: number, idx: number, field: keyof DaySlot, value: string) {
    setDayConfig((prev) => {
      const windows = [...prev![dayValue].windows]
      windows[idx] = { ...windows[idx], [field]: value }
      if (field === "startTime" && value >= windows[idx].endTime) {
        const nextIdx = TIME_OPTIONS.indexOf(value) + 1
        windows[idx].endTime = TIME_OPTIONS[nextIdx] ?? "23:30"
      }
      return { ...prev!, [dayValue]: { ...prev![dayValue], windows } }
    })
  }

  function addWindow(dayValue: number) {
    setDayConfig((prev) => {
      const windows = [...prev![dayValue].windows]
      if (windows.length >= 4) return prev!
      windows.push({ startTime: "09:00", endTime: "17:00" })
      return { ...prev!, [dayValue]: { ...prev![dayValue], windows } }
    })
  }

  function removeWindow(dayValue: number, idx: number) {
    setDayConfig((prev) => {
      const windows = prev![dayValue].windows.filter((_, i) => i !== idx)
      return {
        ...prev!,
        [dayValue]: {
          ...prev![dayValue],
          windows: windows.length > 0 ? windows : [{ startTime: "09:00", endTime: "17:00" }],
        },
      }
    })
  }

  function handleSave() {
    const slots: SetAvailabilitySlot[] = []
    for (const day of DAYS) {
      const dc = config[day.value]
      if (dc.enabled) {
        for (const w of dc.windows) {
          slots.push({ dayOfWeek: day.value, startTime: w.startTime, endTime: w.endTime })
        }
      }
    }
    saveAvailability({ consultationDuration: duration, slots })
  }

  const enabledDays = DAYS.filter((d) => config[d.value]?.enabled).length

  return (
    <div className="space-y-6">
      {/* Consultation duration */}
      <div className="flex items-start gap-4 rounded-lg border bg-muted/30 p-4">
        <Clock className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="duration" className="text-sm font-medium">
              Consultation Duration
            </Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="size-3.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                Time slots will be generated in this increment
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex items-center gap-3">
            <Input
              id="duration"
              type="number"
              min={10}
              max={240}
              step={5}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-24"
            />
            <span className="text-sm text-muted-foreground">minutes per session</span>
          </div>
        </div>
      </div>

      {/* Day rows */}
      <div className="space-y-3">
        {DAYS.map((day) => {
          const dc = config[day.value]
          return (
            <div
              key={day.value}
              className={`rounded-lg border transition-colors ${dc.enabled ? "border-border bg-background" : "border-border/50 bg-muted/20"}`}
            >
              <div className="flex items-center gap-3 p-3">
                <Switch
                  id={`day-${day.value}`}
                  checked={dc.enabled}
                  onCheckedChange={() => toggleDay(day.value)}
                />
                <Label
                  htmlFor={`day-${day.value}`}
                  className={`w-24 cursor-pointer text-sm font-medium ${!dc.enabled ? "text-muted-foreground" : ""}`}
                >
                  {day.label}
                </Label>

                {dc.enabled ? (
                  <div className="flex flex-1 flex-col gap-2">
                    {dc.windows.map((w, idx) => (
                      <div key={idx} className="flex flex-wrap items-center gap-2">
                        <TimeSelect
                          value={w.startTime}
                          onChange={(v) => updateWindow(day.value, idx, "startTime", v)}
                        />
                        <span className="text-xs text-muted-foreground">to</span>
                        <TimeSelect
                          value={w.endTime}
                          onChange={(v) => updateWindow(day.value, idx, "endTime", v)}
                          excludeBefore={w.startTime}
                        />
                        {dc.windows.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-muted-foreground hover:text-destructive"
                            onClick={() => removeWindow(day.value, idx)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        )}
                      </div>
                    ))}
                    {dc.windows.length < 4 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-fit text-xs text-muted-foreground"
                        onClick={() => addWindow(day.value)}
                      >
                        <Plus className="size-3" />
                        Add window
                      </Button>
                    )}
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">Not available</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <Separator />

      {/* Save section */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">
          {enabledDays === 0 ? (
            <span className="text-amber-600">No days enabled — patients won't be able to book.</span>
          ) : (
            <span>
              Available <span className="font-medium text-foreground">{enabledDays}</span> day{enabledDays !== 1 ? "s" : ""} per week
            </span>
          )}
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button disabled={isSaving} className="sm:shrink-0">
              {isSaving ? "Saving..." : "Save Schedule"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Save weekly schedule?</AlertDialogTitle>
              <AlertDialogDescription>
                This will replace your entire availability schedule. Existing confirmed appointments
                will not be affected, but patients may no longer be able to book certain times.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleSave}>Save Schedule</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

function BlockedDatesManager() {
  const { data: blockedDates, isLoading } = useBlockedDates()
  const { mutate: blockDate, isPending: isBlocking } = useBlockDate()
  const { mutate: removeBlockedDate, isPending: isRemoving } = useRemoveBlockedDate()

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [reason, setReason] = useState("")

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const blockedDateStrings = (blockedDates ?? []).map((b) => b.date)

  function handleBlock() {
    if (!selectedDate) return
    const dateStr = formatDateQueryParam(selectedDate)
    blockDate(
      { date: dateStr, reason: reason.trim() || undefined },
      {
        onSuccess: () => {
          setSelectedDate(undefined)
          setReason("")
        },
      }
    )
  }

  function formatDisplayDate(dateStr: string) {
    const [year, month, day] = dateStr.split("-").map(Number)
    return new Date(year, month - 1, day).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const upcomingBlocked = (blockedDates ?? []).filter((b) => {
    const [year, month, day] = b.date.split("-").map(Number)
    return new Date(year, month - 1, day) >= today
  })

  const pastBlocked = (blockedDates ?? []).filter((b) => {
    const [year, month, day] = b.date.split("-").map(Number)
    return new Date(year, month - 1, day) < today
  })

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Left: calendar picker */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium">Select Date to Block</h3>
          <p className="text-xs text-muted-foreground">
            Patients will not be able to book on blocked dates.
          </p>
        </div>

        <div className="flex justify-center rounded-lg border p-3">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={(date) => {
              const d = new Date(date)
              d.setHours(0, 0, 0, 0)
              if (d < today) return true
              const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
              return blockedDateStrings.includes(dateStr)
            }}
            className="rounded-md"
          />
        </div>

        {selectedDate && (
          <div className="space-y-3 rounded-lg border p-4">
            <p className="text-sm font-medium">
              Blocking:{" "}
              <span className="text-muted-foreground">
                {selectedDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="reason" className="text-xs">
                Reason (optional)
              </Label>
              <Textarea
                id="reason"
                placeholder="e.g. Personal leave, Conference..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                maxLength={500}
                className="resize-none text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleBlock} disabled={isBlocking} size="sm" className="flex-1">
                {isBlocking ? "Blocking..." : "Block Date"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedDate(undefined)
                  setReason("")
                }}
              >
                Clear
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Right: blocked dates list */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Blocked Dates</h3>
          {blockedDates && blockedDates.length > 0 && (
            <Badge variant="secondary">{upcomingBlocked.length} upcoming</Badge>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : blockedDates && blockedDates.length > 0 ? (
          <ScrollArea className="h-[360px] pr-3">
            <div className="space-y-2">
              {upcomingBlocked.length > 0 && (
                <>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Upcoming
                  </p>
                  {upcomingBlocked.map((b) => (
                    <div
                      key={b.id}
                      className="flex items-start justify-between gap-3 rounded-lg border bg-background p-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{formatDisplayDate(b.date)}</p>
                        {b.reason && (
                          <p className="truncate text-xs text-muted-foreground">{b.reason}</p>
                        )}
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
                            disabled={isRemoving}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove blocked date?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Patients will be able to book appointments on{" "}
                              <strong>{formatDisplayDate(b.date)}</strong> again.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => removeBlockedDate(b.id)}>
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ))}
                </>
              )}

              {pastBlocked.length > 0 && (
                <>
                  <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Past
                  </p>
                  {pastBlocked.map((b) => (
                    <div
                      key={b.id}
                      className="flex items-start gap-3 rounded-lg border border-dashed p-3 opacity-50"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm">{formatDisplayDate(b.date)}</p>
                        {b.reason && (
                          <p className="truncate text-xs text-muted-foreground">{b.reason}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-10 text-center">
            <CalendarOff className="size-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">No blocked dates yet.</p>
            <p className="text-xs text-muted-foreground">
              Use the calendar to block unavailable days.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export function ScheduleManagementPage() {
  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Consultation Schedule</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your weekly availability and block specific dates.
          </p>
        </div>

        <Tabs defaultValue="availability">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="availability" className="flex items-center gap-1.5">
              <Clock className="size-3.5" />
              Weekly Availability
            </TabsTrigger>
            <TabsTrigger value="blocked" className="flex items-center gap-1.5">
              <CalendarDays className="size-3.5" />
              Blocked Dates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="availability" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Weekly Schedule</CardTitle>
                <CardDescription>
                  Set the days and times you are available for consultations. Changes replace your
                  entire schedule.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AvailabilityEditor />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="blocked" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Blocked Dates</CardTitle>
                <CardDescription>
                  Block specific dates when you are unavailable, regardless of your weekly schedule.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BlockedDatesManager />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
