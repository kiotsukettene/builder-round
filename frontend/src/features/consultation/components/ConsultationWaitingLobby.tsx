import { useEffect, useState } from "react";
import { Video, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getConsultationTickIntervalMs,
  getMinutesUntilStart,
  hasSessionStarted,
} from "@/utils/appointment-datetime";

interface ConsultationWaitingLobbyProps {
  scheduledAt: string;
  counterpartName: string;
  onSessionStart: () => void;
}

export function ConsultationWaitingLobby({
  scheduledAt,
  counterpartName,
  onSessionStart,
}: ConsultationWaitingLobbyProps) {
  const [, setTick] = useState(0);
  const [showEarlyJoinDialog, setShowEarlyJoinDialog] = useState(false);

  useEffect(() => {
    const intervalMs = getConsultationTickIntervalMs(scheduledAt);
    const id = setInterval(() => setTick((t) => t + 1), intervalMs);
    return () => clearInterval(id);
  }, [scheduledAt]);

  const minutesLeft = getMinutesUntilStart(scheduledAt);
  const minuteLabel = minutesLeft === 1 ? "minute" : "minutes";
  const sessionStarted = hasSessionStarted(scheduledAt);

  useEffect(() => {
    if (sessionStarted) {
      onSessionStart();
    }
  }, [sessionStarted, onSessionStart]);

  function handleJoinRoomClick() {
    if (sessionStarted) {
      onSessionStart();
      return;
    }
    setShowEarlyJoinDialog(true);
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-6 px-4 bg-background">
      <div className="flex flex-col items-center gap-3 text-center max-w-md">
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-muted">
          <Clock className="w-7 h-7 text-muted-foreground" />
        </div>
        <h1 className="text-xl font-semibold text-foreground">
          Session will start in {minutesLeft} {minuteLabel} with {counterpartName}
        </h1>
        <p className="text-sm text-muted-foreground">
          You can wait here. The video room will connect automatically when the session begins.
        </p>
      </div>

      <Button className="gap-2" onClick={handleJoinRoomClick}>
        <Video className="w-4 h-4" />
        Join Room
      </Button>

      <Dialog open={showEarlyJoinDialog} onOpenChange={setShowEarlyJoinDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Session has not started yet</DialogTitle>
            <DialogDescription>
              We&apos;ll let you in automatically in {minutesLeft} {minuteLabel}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowEarlyJoinDialog(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
