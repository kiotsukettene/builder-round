import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AppLayout } from "@/components/common/AppLayout";
import { MedicalRecordsBrowser } from "@/components/common/medical-records/MedicalRecordsBrowser";
import { useMedicalRecords } from "@/hooks/use-medical-records";

export function DoctorMedicalRecordsPage() {
  const [page, setPage] = useState(1);
  const [searchParams] = useSearchParams();
  const initialAppointmentId = searchParams.get("appointment");
  const { data, isLoading, isError } = useMedicalRecords({ page, limit: 10 });

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Medical Records</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review consultation notes and prescriptions from your completed
            patient visits.
          </p>
        </div>

        <MedicalRecordsBrowser
          role="DOCTOR"
          records={data?.data ?? []}
          meta={data?.meta}
          isLoading={isLoading}
          isError={isError}
          page={page}
          onPageChange={setPage}
          initialAppointmentId={initialAppointmentId}
          emptyTitle="No medical records yet"
          emptyDescription="Completed consultations with notes or prescriptions will appear here."
        />
      </div>
    </AppLayout>
  );
}
