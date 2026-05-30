import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { joinConsultation, endConsultation } from "@/services/consultation.service";
import { useAuthStore } from "@/store/auth.store";
import { useAppointmentById } from "@/hooks/use-appointments";
import { useConsultationEnded } from "@/hooks/use-consultation-ended";
import { PatientPastMedicalRecords } from "@/components/common/PatientPastMedicalRecords";
import { NotesPanel } from "./components/NotesPanel";
import { PrescriptionsPanel } from "./components/PrescriptionsPanel";
import { ConsultationWaitingLobby } from "./components/ConsultationWaitingLobby";
import { ConsultationSessionTimer } from "./components/ConsultationSessionTimer";
import { ReviewConsultationDialog } from "@/features/patients/components/ReviewConsultationDialog";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, Pill } from "lucide-react";
import {
  hasSessionStarted,
  isWithinJoinWindow,
} from "@/utils/appointment-datetime";

type PanelTab = "notes" | "prescriptions";

export function ConsultationRoom() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const isDoctor = user?.role === "DOCTOR";

  const videoContainerRef = useRef<HTMLDivElement>(null);
  const zegoRef = useRef<ReturnType<typeof ZegoUIKitPrebuilt.create> | null>(null);
  const zegoJoinedRef = useRef(false);
  const hasEndedRef = useRef(false);
  const isDoctorRef = useRef(isDoctor);
  isDoctorRef.current = isDoctor;

  const [activeTab, setActiveTab] = useState<PanelTab>("notes");
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [patientSessionEnded, setPatientSessionEnded] = useState(false);
  const [patientLeftRoom, setPatientLeftRoom] = useState(false);
  const [sessionLive, setSessionLive] = useState(false);
  const [joinAttempt, setJoinAttempt] = useState(0);

  const { data: appointment, refetch: refetchAppointment } = useAppointmentById(appointmentId);

  const durationMin = appointment?.doctor.consultationDuration ?? 30;
  const scheduledAt = appointment?.scheduledAt ?? "";

  const counterpartName = appointment
    ? isDoctor
      ? `${appointment.patient.firstName} ${appointment.patient.lastName}`
      : `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`
    : "";

  const doctorName = appointment
    ? `${appointment.doctor.firstName} ${appointment.doctor.lastName}`
    : undefined;

  useEffect(() => {
    if (appointment && hasSessionStarted(appointment.scheduledAt)) {
      setSessionLive(true);
    }
  }, [appointment]);

  const teardownZego = useCallback(() => {
    try {
      zegoRef.current?.destroy();
    } catch {
      // ignore cleanup errors
    }
    zegoRef.current = null;
  }, []);

  const startSession = useCallback(() => setSessionLive(true), []);
  const appointmentsPath = "/appointments";

  const { mutate: end } = useMutation({
    mutationFn: () => endConsultation(appointmentId!),
    onSuccess: () => {
      // Ensure appointments pages update immediately when returning.
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["appointment", appointmentId] });
    },
    onError: () => {
      // Still leave the room even if the API fails
    },
  });

  const openPatientReview = useCallback(() => {
    setPatientSessionEnded(true);
    setShowReviewDialog(true);
    setPatientLeftRoom(false);
  }, []);

  const handleDoctorLeave = useCallback(() => {
    if (hasEndedRef.current) return;
    hasEndedRef.current = true;
    end();
    navigate(-1);
  }, [end, navigate]);

  const handlePatientLeave = useCallback(() => {
    // If doctor hasn't ended yet (appointment still CONFIRMED), let patient rejoin later.
    if (!hasEndedRef.current && appointment?.status === "CONFIRMED") {
      const isStillInJoinWindow = isWithinJoinWindow(
        appointment.scheduledAt,
        durationMin,
      );

      if (isStillInJoinWindow) {
        hasEndedRef.current = false;
        setPatientLeftRoom(true);
        setShowReviewDialog(false);
        // Allow re-join without remounting.
        zegoJoinedRef.current = false;
        teardownZego();
        return;
      }
    }

    // Otherwise, this is terminal: show review.
    if (hasEndedRef.current) return;
    hasEndedRef.current = true;
    teardownZego();
    openPatientReview();
  }, [appointment?.scheduledAt, appointment?.status, durationMin, isWithinJoinWindow, openPatientReview, teardownZego]);

  const handleRejoin = useCallback(() => {
    if (hasEndedRef.current) return;
    setPatientLeftRoom(false);
    setShowReviewDialog(false);
    // Allow join effect to run again.
    zegoJoinedRef.current = false;
    setJoinAttempt((x) => x + 1);
  }, []);

  const handleRemoteEnd = useCallback(() => {
    if (hasEndedRef.current) return;
    hasEndedRef.current = true;
    teardownZego();

    if (isDoctor) {
      navigate(-1);
    } else {
      openPatientReview();
    }
  }, [isDoctor, navigate, teardownZego, openPatientReview]);

  const handleSessionExpired = useCallback(() => {
    if (hasEndedRef.current) return;
    hasEndedRef.current = true;
    teardownZego();

    if (isDoctor) {
      end();
      navigate(-1);
    } else {
      openPatientReview();
    }
  }, [end, isDoctor, navigate, teardownZego, openPatientReview]);

  const handleDoctorLeaveRef = useRef(handleDoctorLeave);
  handleDoctorLeaveRef.current = handleDoctorLeave;
  const handlePatientLeaveRef = useRef(handlePatientLeave);
  handlePatientLeaveRef.current = handlePatientLeave;

  useConsultationEnded(appointmentId, handleRemoteEnd);

  useEffect(() => {
    if (!sessionLive || !appointmentId || patientSessionEnded) return;

    const id = setInterval(() => {
      void refetchAppointment();
    }, 30_000);

    return () => clearInterval(id);
  }, [sessionLive, appointmentId, patientSessionEnded, refetchAppointment]);

  useEffect(() => {
    if (appointment?.status === "COMPLETED" && sessionLive && !patientSessionEnded) {
      handleRemoteEnd();
    }
  }, [appointment?.status, sessionLive, patientSessionEnded, handleRemoteEnd]);

  const {
    data: credentials,
    isLoading: isJoining,
    isError,
  } = useQuery({
    queryKey: ["consultation-join", appointmentId],
    queryFn: () => joinConsultation(appointmentId!),
    enabled: !!appointmentId && sessionLive,
    retry: false,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const joinToken = credentials?.token;
  const joinRoomId = credentials?.roomId;
  const joinAppId = credentials?.appId;

  useEffect(() => {
    if (
      !joinToken ||
      !joinRoomId ||
      joinAppId == null ||
      !videoContainerRef.current ||
      !user ||
      !sessionLive ||
      zegoJoinedRef.current ||
      patientLeftRoom
    ) {
      return;
    }

    zegoJoinedRef.current = true;

    const profile = user.role === "PATIENT" ? user.patient : user.doctor;
    const userName = profile ? `${profile.firstName} ${profile.lastName}` : user.email;

    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForProduction(
      joinAppId,
      joinToken,
      joinRoomId,
      user.id,
      userName,
    );

    const zp = ZegoUIKitPrebuilt.create(kitToken);
    zegoRef.current = zp;

    zp.joinRoom({
      container: videoContainerRef.current,
      turnOnMicrophoneWhenJoining: true,
      turnOnCameraWhenJoining: true,
      showMyCameraToggleButton: true,
      showMyMicrophoneToggleButton: true,
      showAudioVideoSettingsButton: true,
      showScreenSharingButton: true,
      showTextChat: true,
      showUserList: true,
      maxUsers: 2,
      layout: "Auto",
      showLayoutButton: false,
      scenario: {
        mode: ZegoUIKitPrebuilt.OneONoneCall,
        config: {
          role: ZegoUIKitPrebuilt.Host,
        },
      },
      showLeaveRoomConfirmDialog: false,
      onLeaveRoom: () => {
        if (isDoctorRef.current) {
          handleDoctorLeaveRef.current();
        } else {
          handlePatientLeaveRef.current();
        }
      },
    });

    return () => {
      zegoJoinedRef.current = false;
      teardownZego();
    };
  }, [
    joinToken,
    joinRoomId,
    joinAppId,
    user?.id,
    sessionLive,
    teardownZego,
    patientLeftRoom,
    joinAttempt,
  ]);

  useEffect(() => {
    if (isError) {
      setJoinError("Unable to join consultation. Please check your appointment status.");
    }
  }, [isError]);

  if (!appointmentId) {
    return (
      <div className="flex items-center justify-center h-screen text-muted-foreground">
        Invalid consultation link.
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="flex items-center justify-center h-screen gap-2 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>Loading consultation...</span>
      </div>
    );
  }

  if (!isDoctor && patientSessionEnded) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 bg-background">
        <p className="text-sm text-muted-foreground">Consultation ended</p>
        <ReviewConsultationDialog
          appointmentId={appointmentId}
          doctorName={doctorName}
          open={showReviewDialog}
          onOpenChange={(open) => {
            setShowReviewDialog(open);
            if (!open) navigate(appointmentsPath);
          }}
          onComplete={() => navigate(appointmentsPath)}
        />
      </div>
    );
  }

  if (
    appointment.status !== "CONFIRMED" ||
    !isWithinJoinWindow(appointment.scheduledAt, durationMin)
  ) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-destructive text-sm">
          This consultation is not available to join right now.
        </p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    );
  }

  if (joinError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-destructive text-sm">{joinError}</p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    );
  }

  if (!isDoctor && patientLeftRoom && appointment) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 bg-background px-4">
        <p className="text-sm text-muted-foreground">
          You left the room. You can rejoin while the doctor hasn’t ended the consultation.
        </p>
        <Button
          onClick={handleRejoin}
          disabled={appointment.status !== "CONFIRMED"}
        >
          Join Room
        </Button>
      </div>
    );
  }

  if (!sessionLive) {
    return (
      <ConsultationWaitingLobby
        scheduledAt={appointment.scheduledAt}
        counterpartName={counterpartName}
        onSessionStart={startSession}
      />
    );
  }

  if (isJoining) {
    return (
      <div className="flex items-center justify-center h-screen gap-2 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>Joining consultation...</span>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <div className={`flex flex-col flex-1 min-w-0 ${isDoctor && isPanelOpen ? "border-r border-border" : ""}`}>
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-background shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-foreground">
              TellMD Consultation
            </span>
            <ConsultationSessionTimer
              scheduledAt={scheduledAt}
              durationMin={durationMin}
              onSessionExpired={handleSessionExpired}
            />
          </div>
          <div className="flex items-center gap-2">
            {isDoctor && (
              <>
                <Button
                  size="sm"
                  variant={activeTab === "notes" && isPanelOpen ? "default" : "ghost"}
                  onClick={() => {
                    setActiveTab("notes");
                    setIsPanelOpen(activeTab !== "notes" || !isPanelOpen);
                  }}
                >
                  <FileText className="w-4 h-4 mr-1.5" />
                  Notes
                </Button>
                <Button
                  size="sm"
                  variant={activeTab === "prescriptions" && isPanelOpen ? "default" : "ghost"}
                  onClick={() => {
                    setActiveTab("prescriptions");
                    setIsPanelOpen(activeTab !== "prescriptions" || !isPanelOpen);
                  }}
                >
                  <Pill className="w-4 h-4 mr-1.5" />
                  Rx
                </Button>
              </>
            )}
          </div>
        </div>

        <div ref={videoContainerRef} className="flex-1 w-full" />
      </div>

      {!isDoctor && appointmentId && (
        <ReviewConsultationDialog
          appointmentId={appointmentId}
          doctorName={doctorName}
          open={showReviewDialog}
          onOpenChange={setShowReviewDialog}
          onComplete={() => navigate(appointmentsPath)}
        />
      )}

      {isDoctor && isPanelOpen && (
        <div className="w-80 shrink-0 flex flex-col bg-background border-l border-border">
          <div className="max-h-56 shrink-0 overflow-y-auto border-b border-border p-3">
            <PatientPastMedicalRecords appointmentId={appointmentId} />
          </div>
          <div className="flex border-b border-border">
            <button
              type="button"
              onClick={() => setActiveTab("notes")}
              className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
                activeTab === "notes"
                  ? "text-foreground border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Notes
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("prescriptions")}
              className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
                activeTab === "prescriptions"
                  ? "text-foreground border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Prescriptions
            </button>
          </div>

          <div className="flex-1 overflow-hidden">
            {activeTab === "notes" && (
              <NotesPanel appointmentId={appointmentId} />
            )}
            {activeTab === "prescriptions" && (
              <PrescriptionsPanel appointmentId={appointmentId} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
