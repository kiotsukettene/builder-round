import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  getRelativeTimeLabel,
  isWithinJoinWindow,
} from "@/utils/appointment-datetime"

interface JoinSessionButtonProps {
  appointmentId: string
  scheduledAt: string
  durationMin?: number
}

function getTickIntervalMs(scheduledAt: string): number {
  const diffMinutes = Math.round(
    (new Date(scheduledAt).getTime() - Date.now()) / (60 * 1000),
  )
  return diffMinutes <= 15 ? 10_000 : 60_000
}

export function JoinSessionButton({
  appointmentId,
  scheduledAt,
  durationMin = 30,
}: JoinSessionButtonProps) {
  const navigate = useNavigate()
  const [, setTick] = useState(0)

  useEffect(() => {
    const intervalMs = getTickIntervalMs(scheduledAt)
    const id = setInterval(() => setTick((t) => t + 1), intervalMs)
    return () => clearInterval(id)
  }, [scheduledAt])

  const canJoin = isWithinJoinWindow(scheduledAt, durationMin)
  const timeLabel = getRelativeTimeLabel(scheduledAt, durationMin)

  const button = (
    <Button
      size="sm"
      disabled={!canJoin}
      className="gap-1.5 bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50"
      onClick={() => navigate(`/consultation/${appointmentId}`)}
    >
      <Video className="size-3.5" />
      {canJoin ? "Join Now" : "Join Session"}
    </Button>
  )

  if (canJoin) {
    return button
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex">{button}</span>
      </TooltipTrigger>
      <TooltipContent>{timeLabel}</TooltipContent>
    </Tooltip>
  )
}
