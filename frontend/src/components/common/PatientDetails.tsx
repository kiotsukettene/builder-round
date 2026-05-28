import { useState } from "react"
import { Cake, ChevronRight, FileText, MessageSquare, Phone, Ruler, Weight } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { AppointmentPatient } from "@/types/appointment"

function getAge(birthday: string): number {
  const birth = new Date(birthday)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1
  }
  return age
}

function formatBirthday(birthday: string | null): string | null {
  if (!birthday) return null
  const date = new Date(birthday)
  const formatted = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
  return `${formatted} (${getAge(birthday)} yrs)`
}

function truncateText(text: string, maxLength = 60): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength).trim()}…`
}

interface DetailModalRowProps {
  icon: React.ReactNode
  label: string
  preview?: string
  onClick: () => void
}

function DetailModalRow({ icon, label, preview, onClick }: DetailModalRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded-md bg-muted/40 p-2.5 text-left transition-colors hover:bg-muted/60"
    >
      <span className="text-muted-foreground">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-medium text-muted-foreground">{label}</span>
        {preview && (
          <span className="mt-0.5 block truncate text-xs leading-relaxed text-foreground/80">
            {preview}
          </span>
        )}
      </span>
      <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
    </button>
  )
}

interface PatientDetailsProps {
  patient: AppointmentPatient
  appointmentNotes?: string | null
}

export function PatientDetails({ patient, appointmentNotes }: PatientDetailsProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [modalTitle, setModalTitle] = useState("")
  const [modalContent, setModalContent] = useState("")

  const birthday = formatBirthday(patient.birthday)
  const hasVitals = patient.weight !== null || patient.height !== null
  const vitals =
    patient.weight !== null && patient.height !== null
      ? `${patient.weight} kg · ${patient.height} cm`
      : patient.weight !== null
        ? `${patient.weight} kg`
        : patient.height !== null
          ? `${patient.height} cm`
          : null

  const hasDetails =
    patient.phone || birthday || hasVitals || patient.history || appointmentNotes

  function openDetailModal(title: string, content: string) {
    setModalTitle(title)
    setModalContent(content)
    setModalOpen(true)
  }

  if (!hasDetails) {
    return (
      <p className="text-xs text-muted-foreground">
        No additional patient profile details available.
      </p>
    )
  }

  return (
    <>
      <div className="space-y-2">
        {(patient.phone || birthday) && (
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            {patient.phone && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Phone className="size-3.5 shrink-0" />
                <span>{patient.phone}</span>
              </div>
            )}
            {birthday && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Cake className="size-3.5 shrink-0" />
                <span>{birthday}</span>
              </div>
            )}
          </div>
        )}

        {vitals && (
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Weight className="size-3.5 shrink-0" />
              <Ruler className="size-3.5 shrink-0" />
              <span>{vitals}</span>
            </div>
          </div>
        )}

        {patient.history && (
          <DetailModalRow
            icon={<FileText className="size-3.5" />}
            label="Medical History"
            preview={truncateText(patient.history)}
            onClick={() => openDetailModal("Medical History", patient.history!)}
          />
        )}

        {appointmentNotes && (
          <DetailModalRow
            icon={<MessageSquare className="size-3.5" />}
            label="Note on appointment"
            preview={truncateText(appointmentNotes)}
            onClick={() => openDetailModal("Note on appointment", appointmentNotes)}
          />
        )}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{modalTitle}</DialogTitle>
            <DialogDescription>Patient information for this appointment.</DialogDescription>
          </DialogHeader>
          <p className="text-sm leading-relaxed text-foreground/90">{modalContent}</p>
        </DialogContent>
      </Dialog>
    </>
  )
}
