import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, ClipboardList } from "lucide-react";
import { MedicalRecordVisitContent } from "@/components/common/medical-records/MedicalRecordVisitContent";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePatientMedicalRecords } from "@/hooks/use-patient-medical-records";
import type { MedicalRecordListItem } from "@/types/consultation";
import { formatConsultationDate } from "@/utils/medical-record-utils";

interface PatientPastMedicalRecordsProps {
  appointmentId: string;
  defaultExpanded?: boolean;
}

function PastRecordRow({ record }: { record: MedicalRecordListItem }) {
  const [visitExpanded, setVisitExpanded] = useState(false);
  const doctor = record.doctor;

  if (!doctor) return null;

  const doctorLabel = `Dr. ${doctor.firstName} ${doctor.lastName}`;
  const hasContent =
    record.consultationNote?.diagnosis ||
    record.consultationNote?.notes ||
    record.consultationNote?.recommendations ||
    record.prescriptions.length > 0;

  return (
    <div className="rounded-md border bg-muted/10">
      <button
        type="button"
        onClick={() => setVisitExpanded((open) => !open)}
        className="flex w-full items-center gap-2 p-2.5 text-left transition-colors hover:bg-muted/30"
      >
        {visitExpanded ? (
          <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
        )}
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-medium text-foreground">
            {formatConsultationDate(record.scheduledAt, "short")}
          </span>
          <span className="mt-0.5 block truncate text-xs text-muted-foreground">
            {doctorLabel} · {doctor.specialization}
          </span>
        </span>
        {!hasContent && (
          <span className="shrink-0 text-[10px] text-muted-foreground">
            No notes
          </span>
        )}
      </button>
      {visitExpanded && (
        <div className="border-t px-2.5 pb-2.5 pt-2">
          <MedicalRecordVisitContent
            note={record.consultationNote}
            prescriptions={record.prescriptions}
            showSectionHeaders
          />
        </div>
      )}
    </div>
  );
}

export function PatientPastMedicalRecords({
  appointmentId,
  defaultExpanded = false,
}: PatientPastMedicalRecordsProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [page, setPage] = useState(1);
  const [allRecords, setAllRecords] = useState<MedicalRecordListItem[]>([]);

  const { data, isContentLoading, isError } = usePatientMedicalRecords(
    appointmentId,
    { page, limit: 5, enabled: expanded },
  );

  useEffect(() => {
    if (!expanded) {
      setPage(1);
      setAllRecords([]);
    }
  }, [expanded]);

  useEffect(() => {
    if (!data?.data) return;

    if (page === 1) {
      setAllRecords(data.data);
    } else {
      setAllRecords((prev) => {
        const ids = new Set(prev.map((r) => r.id));
        const newRecords = data.data.filter((r) => !ids.has(r.id));
        return [...prev, ...newRecords];
      });
    }
  }, [data, page]);

  const meta = data?.meta;
  const hasMore = meta ? page < meta.totalPages : false;

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setExpanded((open) => !open)}
        className="flex w-full items-center gap-2 rounded-md bg-muted/40 p-2.5 text-left transition-colors hover:bg-muted/60"
      >
        <ClipboardList className="size-3.5 shrink-0 text-muted-foreground" />
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-medium text-muted-foreground">
            Past Medical Records
          </span>
          <span className="mt-0.5 block text-xs text-foreground/80">
            Prior visits — notes and prescriptions
          </span>
        </span>
        {expanded ? (
          <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="space-y-2 pl-1">
          {isContentLoading && allRecords.length === 0 ? (
            <div className="space-y-2">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : isError ? (
            <p className="text-xs text-destructive">
              Could not load past medical records.
            </p>
          ) : allRecords.length === 0 ? (
            <p className="rounded-md border border-dashed px-3 py-4 text-center text-xs text-muted-foreground">
              No prior consultation records for this patient.
            </p>
          ) : (
            <>
              {allRecords.map((record) => (
                <PastRecordRow key={record.id} record={record} />
              ))}
              {hasMore && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-full text-xs"
                  disabled={isContentLoading}
                  onClick={() => setPage((p) => p + 1)}
                >
                  {isContentLoading ? "Loading…" : "Load more"}
                </Button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
