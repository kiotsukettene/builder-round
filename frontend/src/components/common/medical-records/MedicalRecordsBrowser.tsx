import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Search,
} from "lucide-react";
import { MedicalRecordDetailPanel } from "@/components/common/medical-records/MedicalRecordDetailPanel";
import { MedicalRecordListRow } from "@/components/common/medical-records/MedicalRecordListRow";
import { MedicalRecordsSummary } from "@/components/common/medical-records/MedicalRecordsSummary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  MedicalRecordListItem,
  MedicalRecordListMeta,
} from "@/types/consultation";
import { useMedicalRecords } from "@/hooks/use-medical-records";
import { getMedicalRecordDetail } from "@/services/medical-record.service";
import {
  detailToListItem,
  filterMedicalRecords,
  groupRecordsByMonth,
  type MedicalRecordFilter,
} from "@/utils/medical-record-utils";

interface MedicalRecordsBrowserProps {
  role: "PATIENT" | "DOCTOR";
  records: MedicalRecordListItem[];
  meta?: MedicalRecordListMeta;
  isLoading: boolean;
  isError: boolean;
  page: number;
  onPageChange: (page: number) => void;
  emptyTitle: string;
  emptyDescription: string;
  initialAppointmentId?: string | null;
}

function MedicalRecordsSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(280px,340px)_1fr]">
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
      <Skeleton className="h-[480px] w-full" />
    </div>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed py-16 text-center">
      <FileText className="size-10 text-muted-foreground/40" />
      <div>
        <p className="font-medium">{title}</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

export function MedicalRecordsBrowser({
  role,
  records,
  meta,
  isLoading,
  isError,
  page,
  onPageChange,
  emptyTitle,
  emptyDescription,
  initialAppointmentId = null,
}: MedicalRecordsBrowserProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<MedicalRecordFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: firstPageData } = useMedicalRecords({ page: 1, limit: 10 });

  const recordExistsInList = useMemo(
    () => records.some((record) => record.id === initialAppointmentId),
    [records, initialAppointmentId],
  );

  const { data: fetchedRecord } = useQuery({
    queryKey: ["medical-record-detail", initialAppointmentId],
    queryFn: () => getMedicalRecordDetail(initialAppointmentId!),
    enabled:
      !!initialAppointmentId && !recordExistsInList && !isLoading && !isError,
    staleTime: 1000 * 60 * 5,
  });

  const filteredRecords = useMemo(
    () => filterMedicalRecords(records, filter, searchQuery, role),
    [records, filter, searchQuery, role],
  );

  const groupedRecords = useMemo(
    () => groupRecordsByMonth(filteredRecords),
    [filteredRecords],
  );

  const selectedRecord = useMemo(() => {
    if (!selectedId) return null;

    const fromFiltered = filteredRecords.find((record) => record.id === selectedId);
    if (fromFiltered) return fromFiltered;

    const fromPage = records.find((record) => record.id === selectedId);
    if (fromPage) return fromPage;

    if (fetchedRecord && fetchedRecord.id === selectedId) {
      return detailToListItem(fetchedRecord);
    }

    return null;
  }, [selectedId, filteredRecords, records, fetchedRecord]);

  const stats = useMemo(() => {
    const summaryRecords = firstPageData?.data ?? records;

    return {
      totalVisits: meta?.total ?? records.length,
      prescriptionCount: summaryRecords.reduce(
        (sum, record) => sum + record.prescriptions.length,
        0,
      ),
      lastVisit: firstPageData?.data[0]?.scheduledAt ?? null,
    };
  }, [records, meta?.total, firstPageData?.data]);

  useEffect(() => {
    if (initialAppointmentId) {
      setSelectedId(initialAppointmentId);
    }
  }, [initialAppointmentId]);

  useEffect(() => {
    if (filteredRecords.length === 0) {
      if (!initialAppointmentId) {
        setSelectedId(null);
      }
      return;
    }

    const stillVisible = filteredRecords.some(
      (record) => record.id === selectedId,
    );

    if (!stillVisible && selectedId !== initialAppointmentId) {
      setSelectedId(filteredRecords[0].id);
    }
  }, [filteredRecords, selectedId, initialAppointmentId]);

  function handleSelectRecord(id: string) {
    setSelectedId(id);
  }

  const searchPlaceholder =
    role === "PATIENT"
      ? "Search by doctor, diagnosis, or medication..."
      : "Search by patient, diagnosis, or medication...";

  return (
    <div className="space-y-6">
      {!isLoading && !isError && records.length > 0 && (
        <MedicalRecordsSummary
          totalVisits={stats.totalVisits}
          prescriptionCount={stats.prescriptionCount}
          lastVisit={stats.lastVisit}
        />
      )}

      {isLoading ? (
        <MedicalRecordsSkeleton />
      ) : isError ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-6 text-center text-sm text-destructive">
          Unable to load medical records. Please try again later.
        </div>
      ) : records.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Tabs
              value={filter}
              onValueChange={(value) => setFilter(value as MedicalRecordFilter)}
            >
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="prescriptions">With Prescriptions</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={searchPlaceholder}
                className="pl-8"
              />
            </div>
          </div>

          {filteredRecords.length === 0 ? (
            <div className="rounded-lg border border-dashed py-12 text-center">
              <p className="text-sm font-medium">No matching records</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Try adjusting your search or filter.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[minmax(280px,340px)_1fr] lg:items-start">
              <div className="rounded-xl border bg-card">
                {groupedRecords.map(([monthLabel, monthRecords], groupIndex) => (
                  <div
                    key={monthLabel}
                    className={groupIndex > 0 ? "border-t" : undefined}
                  >
                    <p className="px-3 pt-3 pb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                      {monthLabel}
                    </p>
                    <div className="divide-y divide-border">
                      {monthRecords.map((record) => (
                        <MedicalRecordListRow
                          key={record.id}
                          record={record}
                          role={role}
                          isSelected={record.id === selectedId}
                          onSelect={() => handleSelectRecord(record.id)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="min-h-[420px]">
                {selectedRecord ? (
                  <MedicalRecordDetailPanel
                    record={selectedRecord}
                    role={role}
                  />
                ) : (
                  <div className="flex h-full min-h-[420px] items-center justify-center rounded-xl border border-dashed p-6 text-center">
                    <div>
                      <FileText className="mx-auto size-8 text-muted-foreground/40" />
                      <p className="mt-2 text-sm font-medium">
                        Select a record to view details
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1 || isLoading}
              >
                <ChevronLeft className="size-4" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {meta.page} of {meta.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page + 1)}
                disabled={page === meta.totalPages || isLoading}
              >
                Next
                <ChevronRight className="size-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
