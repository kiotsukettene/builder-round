import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { useMutation, useQuery } from "@tanstack/react-query";
import { joinConsultation, endConsultation } from "@/services/consultation.service";
import { useAuthStore } from "@/store/auth.store";
import { NotesPanel } from "./components/NotesPanel";
import { PrescriptionsPanel } from "./components/PrescriptionsPanel";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, Pill, PhoneOff } from "lucide-react";

type PanelTab = "notes" | "prescriptions";

export function ConsultationRoom() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isDoctor = user?.role === "DOCTOR";

  const videoContainerRef = useRef<HTMLDivElement>(null);
  const zegoRef = useRef<ReturnType<typeof ZegoUIKitPrebuilt.create> | null>(null);

  const [activeTab, setActiveTab] = useState<PanelTab>("notes");
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [joinError, setJoinError] = useState<string | null>(null);

  const {
    data: credentials,
    isLoading: isJoining,
    isError,
  } = useQuery({
    queryKey: ["consultation-join", appointmentId],
    queryFn: () => joinConsultation(appointmentId!),
    enabled: !!appointmentId,
    retry: false,
  });

  const { mutate: end, isPending: isEnding } = useMutation({
    mutationFn: () => endConsultation(appointmentId!),
    onSuccess: () => navigate(-1),
    onError: () => navigate(-1),
  });

  useEffect(() => {
    if (!credentials || !videoContainerRef.current || !user) return;

    const { roomId, token, appId } = credentials;
    const profile = user.role === "PATIENT" ? user.patient : user.doctor;
    const userName = profile ? `${profile.firstName} ${profile.lastName}` : user.email;

    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForProduction(
      appId,
      token,
      roomId,
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
        if (isDoctor) {
          end();
        } else {
          navigate(-1);
        }
      },
    });

    return () => {
      try {
        zp.destroy();
      } catch {
        // ignore cleanup errors
      }
    };
  }, [credentials]);

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
      {/* Video area */}
      <div className={`flex flex-col flex-1 min-w-0 ${isDoctor && isPanelOpen ? "border-r border-border" : ""}`}>
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-background shrink-0">
          <span className="text-sm font-medium text-foreground">
            TellMD Consultation
          </span>
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
                <div className="w-px h-5 bg-border mx-1" />
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => end()}
                  disabled={isEnding}
                >
                  {isEnding ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  ) : (
                    <PhoneOff className="w-4 h-4 mr-1.5" />
                  )}
                  End
                </Button>
              </>
            )}
          </div>
        </div>

        {/* ZegoCloud video container */}
        <div ref={videoContainerRef} className="flex-1 w-full" />
      </div>

      {/* Doctor side panel */}
      {isDoctor && isPanelOpen && (
        <div className="w-80 shrink-0 flex flex-col bg-background border-l border-border">
          {/* Panel tabs */}
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

          {/* Panel content */}
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
