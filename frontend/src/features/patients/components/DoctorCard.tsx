import { useNavigate } from "react-router-dom"
import { Sparkles, Clock, DollarSign, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { PublicDoctor } from "@/types/recommendation"

interface DoctorCardProps {
  doctor: PublicDoctor
  isRecommended?: boolean
}

export function DoctorCard({ doctor, isRecommended = false }: DoctorCardProps) {
  const navigate = useNavigate()
  const initials = `${doctor.firstName[0]}${doctor.lastName[0]}`.toUpperCase()

  return (
    <Card className="group flex flex-col overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="flex flex-1 flex-col gap-4 p-5">
        {/* Header row */}
        <div className="flex items-start gap-3">
          <Avatar className="size-12 shrink-0">
            <AvatarImage src={doctor.profilePicture ?? undefined} alt={`Dr. ${doctor.firstName} ${doctor.lastName}`} />
            <AvatarFallback className="text-sm font-medium">
              <User className="size-5" />
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-sm font-semibold">
                Dr. {doctor.firstName} {doctor.lastName}
              </p>
              {isRecommended && (
                <Badge variant="secondary" className="flex shrink-0 items-center gap-1 text-xs">
                  <Sparkles className="size-3" />
                  AI Match
                </Badge>
              )}
            </div>
            <Badge variant="outline" className="mt-1 text-xs font-normal">
              {doctor.specialization}
            </Badge>
          </div>
        </div>

        {/* Bio preview */}
        {doctor.bio && (
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {doctor.bio}
          </p>
        )}

        {/* Meta row */}
        <div className="mt-auto flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {doctor.fee !== null && (
            <span className="flex items-center gap-1">
              <DollarSign className="size-3.5" />
              {doctor.fee} / session
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="size-3.5" />
            {doctor.consultationDuration} min
          </span>
        </div>

        <Button
          size="sm"
          variant="outline"
          className="w-full"
          onClick={() => navigate(`/doctors/${doctor.id}`)}
        >
          View Profile
        </Button>
      </CardContent>
    </Card>
  )
}
