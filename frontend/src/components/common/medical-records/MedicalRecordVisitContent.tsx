import { FileText, Pill } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type { ConsultationNote, Prescription } from "@/types/consultation";

export function RecordSection({
  title,
  content,
}: {
  title: string;
  content: string | null | undefined;
}) {
  if (!content) return null;

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <p className="text-sm leading-relaxed text-foreground/90">{content}</p>
    </div>
  );
}

interface MedicalRecordVisitContentProps {
  note: ConsultationNote | null;
  prescriptions: Prescription[];
  emptyMessage?: string;
  showSectionHeaders?: boolean;
}

export function MedicalRecordVisitContent({
  note,
  prescriptions,
  emptyMessage = "No notes or prescriptions for this visit.",
  showSectionHeaders = true,
}: MedicalRecordVisitContentProps) {
  const hasNotes = note?.diagnosis || note?.notes || note?.recommendations;
  const hasPrescriptions = prescriptions.length > 0;

  if (!hasNotes && !hasPrescriptions) {
    return (
      <p className="text-xs text-muted-foreground">{emptyMessage}</p>
    );
  }

  return (
    <div className="space-y-4">
      {hasNotes && (
        <div className="space-y-3">
          {showSectionHeaders && (
            <div className="flex items-center gap-2 text-sm font-medium">
              <FileText className="size-3.5 text-muted-foreground" />
              Consultation Notes
            </div>
          )}
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
        <div className="space-y-2">
          {showSectionHeaders && (
            <div className="flex items-center gap-2 text-sm font-medium">
              <Pill className="size-3.5 text-muted-foreground" />
              Prescriptions
            </div>
          )}
          <div className="space-y-2">
            {prescriptions.map((prescription) => (
              <div
                key={prescription.id}
                className="rounded-lg border bg-muted/20 p-3"
              >
                <p className="text-sm font-medium">{prescription.medication}</p>
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
  );
}
