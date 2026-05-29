import { useEffect, useRef, useState } from "react";
import {
  formatSessionTimeRemaining,
  getSecondsRemainingInSession,
} from "@/utils/appointment-datetime";

interface ConsultationSessionTimerProps {
  scheduledAt: string;
  durationMin: number;
  onSessionExpired: () => void;
}

export function ConsultationSessionTimer({
  scheduledAt,
  durationMin,
  onSessionExpired,
}: ConsultationSessionTimerProps) {
  const [secondsRemaining, setSecondsRemaining] = useState(() =>
    getSecondsRemainingInSession(scheduledAt, durationMin),
  );
  const onSessionExpiredRef = useRef(onSessionExpired);
  onSessionExpiredRef.current = onSessionExpired;
  const hasExpiredRef = useRef(false);

  useEffect(() => {
    hasExpiredRef.current = false;

    const id = setInterval(() => {
      const remaining = getSecondsRemainingInSession(scheduledAt, durationMin);
      setSecondsRemaining(remaining);
      if (remaining <= 0 && !hasExpiredRef.current) {
        hasExpiredRef.current = true;
        clearInterval(id);
        onSessionExpiredRef.current();
      }
    }, 1_000);

    return () => clearInterval(id);
  }, [scheduledAt, durationMin]);

  return (
    <span className="text-xs font-medium tabular-nums px-2.5 py-1 rounded-md bg-muted text-muted-foreground">
      {formatSessionTimeRemaining(secondsRemaining)} remaining
    </span>
  );
}
