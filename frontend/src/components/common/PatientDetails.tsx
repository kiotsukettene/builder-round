import { Cake, FileText, Phone, Ruler, Weight } from "lucide-react";
import type { AppointmentPatient } from "@/types/appointment";

function getAge(birthday: string): number {
  const birth = new Date(birthday);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}

function formatBirthday(birthday: string | null): string | null {
  if (!birthday) return null;
  const date = new Date(birthday);
  const formatted = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${formatted} (${getAge(birthday)} yrs)`;
}

interface PatientDetailsProps {
  patient: AppointmentPatient;
}

export function PatientDetails({ patient }: PatientDetailsProps) {
  const birthday = formatBirthday(patient.birthday);
  const hasVitals = patient.weight !== null || patient.height !== null;
  const vitals =
    patient.weight !== null && patient.height !== null
      ? `${patient.weight} kg · ${patient.height} cm`
      : patient.weight !== null
        ? `${patient.weight} kg`
        : patient.height !== null
          ? `${patient.height} cm`
          : null;

  const hasDetails = patient.phone || birthday || hasVitals || patient.history;

  if (!hasDetails) {
    return (
      <p className="text-xs text-muted-foreground">
        No additional patient profile details available.
      </p>
    );
  }

  return (
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
        <div className="rounded-md bg-muted/40 p-2.5">
          <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <FileText className="size-3.5" />
            Medical History
          </div>
          <p className="text-xs leading-relaxed text-foreground/80">
            {patient.history}
          </p>
        </div>
      )}
    </div>
  );
}
