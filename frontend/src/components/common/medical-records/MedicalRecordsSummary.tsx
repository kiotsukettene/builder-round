import type { ComponentType } from "react";
import { CalendarDays, ClipboardList, Pill } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatLastVisitDate } from "@/utils/medical-record-utils";

interface MedicalRecordsSummaryProps {
  totalVisits: number;
  prescriptionCount: number;
  lastVisit: string | null;
}

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <Card className="border-muted/60 shadow-none">
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/60">
          <Icon className="size-4 text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="truncate text-lg font-semibold tracking-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function MedicalRecordsSummary({
  totalVisits,
  prescriptionCount,
  lastVisit,
}: MedicalRecordsSummaryProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <SummaryCard
        icon={ClipboardList}
        label="Total Visits"
        value={String(totalVisits)}
      />
      <SummaryCard
        icon={Pill}
        label="Prescriptions"
        value={String(prescriptionCount)}
      />
      <SummaryCard
        icon={CalendarDays}
        label="Last Visit"
        value={lastVisit ? formatLastVisitDate(lastVisit) : "—"}
      />
    </div>
  );
}
