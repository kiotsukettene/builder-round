import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getSocket } from "@/lib/socket";
import { useAuthStore } from "@/store/auth.store";

export interface ConsultationEndedEvent {
  appointmentId: string;
  status: "COMPLETED";
}

export function useConsultationEnded(
  appointmentId: string | undefined,
  onEnded: () => void,
) {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((s) => s.accessToken);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated || !accessToken || !appointmentId) return;

    const sock = getSocket(accessToken);

    function handleConsultationEnded(payload: ConsultationEndedEvent) {
      if (payload.appointmentId !== appointmentId) return;

      queryClient.invalidateQueries({ queryKey: ["appointment", appointmentId] });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      onEnded();
    }

    sock.on("consultation:ended", handleConsultationEnded);

    return () => {
      sock.off("consultation:ended", handleConsultationEnded);
    };
  }, [isAuthenticated, accessToken, appointmentId, onEnded, queryClient]);
}
