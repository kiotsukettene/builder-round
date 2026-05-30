import { useQuery } from "@tanstack/react-query";
import { FileText, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PatientDetails } from "@/components/common/PatientDetails";
import { AppointmentMessageThread } from "@/components/common/AppointmentMessageThread";
import { MedicalRecordVisitContent } from "@/components/common/medical-records/MedicalRecordVisitContent";
import { PrescriptionBadge } from "@/components/common/medical-records/PrescriptionBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { getAppointmentById } from "@/services/appointment.service";
import type { MedicalRecordListItem } from "@/types/consultation";
import { formatConsultationDate } from "@/utils/medical-record-utils";

interface MedicalRecordDetailPanelProps {
  record: MedicalRecordListItem;
  role: "PATIENT" | "DOCTOR";
}

function PatientDetailsSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-3 w-32" />
      <Skeleton className="h-3 w-48" />
      <Skeleton className="h-16 w-full" />
    </div>
  );
}

export function MedicalRecordDetailPanel({
  record,
  role,
}: MedicalRecordDetailPanelProps) {
  const navigate = useNavigate();
  const isPatient = role === "PATIENT";
  const prescriptions = record.prescriptions;
  const hasNotes =
    record.consultationNote?.diagnosis ||
    record.consultationNote?.notes ||
    record.consultationNote?.recommendations;
  const hasPrescriptions = prescriptions.length > 0;
  const hasRecordContent = hasNotes || hasPrescriptions;

  const { data: appointment, isLoading: isLoadingAppointment } = useQuery({
    queryKey: ["appointment", record.id],
    queryFn: () => getAppointmentById(record.id),
    staleTime: 1000 * 60 * 5,
  });

  const counterpart = isPatient ? record.doctor : record.patient;
  if (!counterpart) return null;

  const counterpartName = isPatient
    ? `Dr. ${record.doctor!.firstName} ${record.doctor!.lastName}`
    : `${record.patient!.firstName} ${record.patient!.lastName}`;

  return (
    <div className="flex h-full flex-col rounded-xl border bg-card">
      <div className="space-y-4 border-b p-4 sm:p-5">
        <div className="flex items-start gap-3">
          {isPatient ? (
            <button
              type="button"
              onClick={() => navigate(`/doctors/${record.doctor!.id}`)}
              className="flex min-w-0 flex-1 cursor-pointer items-start gap-3 rounded-lg text-left transition-colors hover:bg-muted/40 -m-1 p-1"
            >
              <Avatar className="size-12 shrink-0">
                <AvatarImage
                  src={counterpart.profilePicture ?? undefined}
                  alt={counterpartName}
                />
                <AvatarFallback>
                  <User className="size-5" />
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-lg font-semibold hover:underline">
                  {counterpartName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {record.doctor!.specialization}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatConsultationDate(record.scheduledAt)}
                </p>
              </div>
            </button>
          ) : (
            <>
              <Avatar className="size-12 shrink-0">
                <AvatarImage
                  src={counterpart.profilePicture ?? undefined}
                  alt={counterpartName}
                />
                <AvatarFallback>
                  <User className="size-5" />
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 space-y-3">
                <div>
                  <p className="truncate text-lg font-semibold">
                    {counterpartName}
                  </p>
                  <p className="text-sm text-muted-foreground">Patient</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatConsultationDate(record.scheduledAt)}
                  </p>
                </div>
                {isLoadingAppointment ? (
                  <PatientDetailsSkeleton />
                ) : appointment?.patient ? (
                  <PatientDetails patient={appointment.patient} />
                ) : null}
              </div>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <PrescriptionBadge count={prescriptions.length} />
        </div>

        {isLoadingAppointment ? (
          <Skeleton className="h-24 w-full" />
        ) : appointment ? (
          <AppointmentMessageThread
            appointmentId={record.id}
            status={appointment.status}
            role={role}
            counterpartName={counterpartName}
            counterpartAvatar={counterpart.profilePicture}
            defaultExpanded={false}
          />
        ) : null}
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-5">
        {!hasRecordContent ? (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-12 text-center">
            <FileText className="size-8 text-muted-foreground/40" />
            <p className="text-sm font-medium">No records available</p>
            <p className="max-w-xs text-xs text-muted-foreground">
              {isPatient
                ? "The doctor has not added consultation notes or prescriptions yet."
                : "No consultation notes or prescriptions were added for this visit."}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            <MedicalRecordVisitContent
              note={record.consultationNote}
              prescriptions={prescriptions}
              emptyMessage={
                isPatient
                  ? "The doctor has not added consultation notes or prescriptions yet."
                  : "No consultation notes or prescriptions were added for this visit."
              }
            />
            {record.doctor && (
              <div className="border-t pt-4 text-right">
                <p className="text-sm font-medium text-foreground">
                  Dr. {record.doctor.firstName} {record.doctor.lastName}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatConsultationDate(record.scheduledAt)}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
