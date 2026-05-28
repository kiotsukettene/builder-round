import { useQuery } from "@tanstack/react-query"
import { FileText, Loader2, Pill } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { getMedicalRecord } from "@/services/consultation.service"

interface MedicalRecordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointmentId: string
  counterpartName: string
}

function RecordSection({
  title,
  content,
}: {
  title: string
  content: string | null | undefined
}) {
  if (!content) return null

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <p className="text-sm leading-relaxed text-foreground/90">{content}</p>
    </div>
  )
}

export function MedicalRecordDialog({
  open,
  onOpenChange,
  appointmentId,
  counterpartName,
}: MedicalRecordDialogProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["medical-record", appointmentId],
    queryFn: () => getMedicalRecord(appointmentId),
    enabled: open && !!appointmentId,
  })

  const note = data?.note
  const prescriptions = data?.prescriptions ?? []
  const hasNotes =
    note?.diagnosis || note?.notes || note?.recommendations
  const hasPrescriptions = prescriptions.length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Medical Record</DialogTitle>
          <DialogDescription>
            Consultation summary with {counterpartName}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="mr-2 size-5 animate-spin" />
            Loading records...
          </div>
        ) : isError ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-6 text-center text-sm text-destructive">
            Unable to load medical records. Please try again later.
          </div>
        ) : !hasNotes && !hasPrescriptions ? (
          <div className="flex flex-col items-center gap-2 rounded-md border border-dashed py-10 text-center">
            <FileText className="size-8 text-muted-foreground/40" />
            <p className="text-sm font-medium">No records available</p>
            <p className="text-xs text-muted-foreground">
              The doctor has not added consultation notes or prescriptions yet.
            </p>
          </div>
        ) : (
          <div className="space-y-5 py-1">
            {hasNotes && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <FileText className="size-4 text-muted-foreground" />
                  Consultation Notes
                </div>
                <RecordSection title="Diagnosis" content={note?.diagnosis} />
                <RecordSection title="Notes" content={note?.notes} />
                <RecordSection
                  title="Recommendations"
                  content={note?.recommendations}
                />
              </div>
            )}

            {hasNotes && hasPrescriptions && <Separator />}

            {hasPrescriptions && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Pill className="size-4 text-muted-foreground" />
                  Prescriptions
                </div>
                <div className="space-y-2">
                  {prescriptions.map((prescription) => (
                    <div
                      key={prescription.id}
                      className="rounded-md border bg-muted/20 p-3"
                    >
                      <p className="text-sm font-medium">
                        {prescription.medication}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                        {prescription.dosage && <span>{prescription.dosage}</span>}
                        {prescription.frequency && (
                          <span>· {prescription.frequency}</span>
                        )}
                        {prescription.duration && (
                          <span>· {prescription.duration}</span>
                        )}
                      </div>
                      {prescription.instructions && (
                        <p className="mt-1 text-xs italic text-muted-foreground">
                          {prescription.instructions}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
