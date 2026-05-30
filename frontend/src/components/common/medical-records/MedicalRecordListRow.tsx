import { User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PrescriptionBadge } from "@/components/common/medical-records/PrescriptionBadge";
import { cn } from "@/lib/utils";
import type { MedicalRecordListItem } from "@/types/consultation";
import {
  formatConsultationDate,
  getDiagnosisPreview,
  getMedicationPreview,
} from "@/utils/medical-record-utils";

interface MedicalRecordListRowProps {
  record: MedicalRecordListItem;
  role: "PATIENT" | "DOCTOR";
  isSelected: boolean;
  onSelect: () => void;
}

export function MedicalRecordListRow({
  record,
  role,
  isSelected,
  onSelect,
}: MedicalRecordListRowProps) {
  const isPatient = role === "PATIENT";
  const counterpart = isPatient ? record.doctor : record.patient;

  if (!counterpart) return null;

  const counterpartName = isPatient
    ? `Dr. ${record.doctor!.firstName} ${record.doctor!.lastName}`
    : `${record.patient!.firstName} ${record.patient!.lastName}`;

  const counterpartSub = isPatient
    ? record.doctor!.specialization
    : "Patient";

  const diagnosisPreview = getDiagnosisPreview(record);
  const medicationPreview = getMedicationPreview(record);
  const hasDiagnosis = !!record.consultationNote?.diagnosis?.trim();

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full cursor-pointer items-start gap-3 px-3 py-3 text-left transition-colors",
        isSelected
          ? "bg-primary/5 shadow-sm ring-1 ring-inset ring-primary/30"
          : "bg-background hover:bg-muted/40",
      )}
    >
      <Avatar className="size-9 shrink-0">
        <AvatarImage
          src={counterpart.profilePicture ?? undefined}
          alt={counterpartName}
        />
        <AvatarFallback>
          <User className="size-4" />
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{counterpartName}</p>
            <p className="truncate text-xs text-muted-foreground">
              {counterpartSub}
            </p>
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">
            {formatConsultationDate(record.scheduledAt, "short")}
          </span>
        </div>

        <p
          className={cn(
            "line-clamp-1 text-xs leading-relaxed",
            hasDiagnosis
              ? "text-foreground/80"
              : "italic text-muted-foreground",
          )}
        >
          {diagnosisPreview}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <PrescriptionBadge count={record.prescriptions.length} />
          {medicationPreview && (
            <span className="line-clamp-1 text-xs text-muted-foreground">
              {medicationPreview}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
