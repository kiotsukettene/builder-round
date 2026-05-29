import { useEffect, useRef, useState } from "react"
import { ChevronDown, ChevronUp, MessageSquare, Send, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import {
  useAppointmentMessages,
  useSendAppointmentMessage,
} from "@/hooks/use-appointment-messages"
import { useAuthStore } from "@/store/auth.store"
import type { AppointmentStatus } from "@/types/appointment"
import { cn } from "@/lib/utils"

interface AppointmentMessageThreadProps {
  appointmentId: string
  status: AppointmentStatus
  role: "PATIENT" | "DOCTOR"
  counterpartName: string
  counterpartAvatar?: string | null
  defaultExpanded?: boolean
  className?: string
}

function formatMessageTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / 60000)

  if (diffMinutes < 1) return "Just now"
  if (diffMinutes < 60) return `${diffMinutes}m ago`

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()

  if (isToday) {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

function isUpcomingStatus(status: AppointmentStatus): boolean {
  return status === "PENDING" || status === "CONFIRMED"
}

export function AppointmentMessageThread({
  appointmentId,
  status,
  role,
  counterpartName,
  counterpartAvatar,
  defaultExpanded,
  className,
}: AppointmentMessageThreadProps) {
  const userId = useAuthStore((s) => s.user?.id)
  const { data: messages = [], isLoading } = useAppointmentMessages(appointmentId)
  const { mutate: sendMessage, isPending: isSending } = useSendAppointmentMessage()

  const [draft, setDraft] = useState("")
  const [expanded, setExpanded] = useState(
    defaultExpanded ?? isUpcomingStatus(status),
  )
  const scrollRef = useRef<HTMLDivElement>(null)
  const hasAutoExpanded = useRef(false)

  const isCancelled = status === "CANCELLED"
  const canSend = !isCancelled

  useEffect(() => {
    if (
      hasAutoExpanded.current ||
      defaultExpanded !== undefined ||
      messages.length === 0
    ) {
      return
    }

    setExpanded(true)
    hasAutoExpanded.current = true
  }, [messages.length, defaultExpanded])

  useEffect(() => {
    if (expanded && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, expanded])

  function handleSend() {
    const body = draft.trim()
    if (!body || isSending || !canSend) return

    sendMessage(
      { appointmentId, payload: { body } },
      { onSuccess: () => setDraft("") },
    )
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
    }
  }

  const emptyMessage =
    role === "PATIENT"
      ? "No messages yet. Share symptoms or questions for your doctor."
      : "No messages from the patient yet."

  return (
    <div className={cn("rounded-lg border bg-muted/20", className)}>
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left transition-colors hover:bg-muted/40"
      >
        <div className="flex items-center gap-2">
          <MessageSquare className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium">Messages</span>
          {messages.length > 0 && (
            <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
              {messages.length}
            </Badge>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="size-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="border-t px-3 pb-3 pt-2">
          {isLoading ? (
            <div className="space-y-2 py-2">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="ml-auto h-12 w-2/3" />
            </div>
          ) : messages.length === 0 ? (
            <p className="py-3 text-center text-xs text-muted-foreground">
              {emptyMessage}
            </p>
          ) : (
            <div
              ref={scrollRef}
              className="max-h-60 space-y-3 overflow-y-auto py-2 pr-1"
            >
              {messages.map((message) => {
                const isOwn = message.authorUserId === userId

                return (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-2",
                      isOwn ? "flex-row-reverse" : "flex-row",
                    )}
                  >
                    {!isOwn && (
                      <Avatar className="size-7 shrink-0">
                        <AvatarImage
                          src={counterpartAvatar ?? undefined}
                          alt={counterpartName}
                        />
                        <AvatarFallback>
                          <User className="size-3.5" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        "flex max-w-[85%] flex-col gap-0.5",
                        isOwn ? "items-end" : "items-start",
                      )}
                    >
                      {!isOwn && (
                        <span className="px-1 text-[10px] font-medium text-muted-foreground">
                          {counterpartName}
                        </span>
                      )}
                      <div
                        className={cn(
                          "rounded-2xl px-3 py-2 text-sm leading-relaxed",
                          isOwn
                            ? "rounded-br-md bg-primary text-primary-foreground"
                            : "rounded-bl-md bg-background border",
                        )}
                      >
                        {message.body}
                      </div>
                      <span className="px-1 text-[10px] text-muted-foreground">
                        {formatMessageTime(message.createdAt)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {canSend ? (
            <div className="mt-2 flex gap-2">
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Write a message..."
                rows={2}
                maxLength={1000}
                disabled={isSending}
                className="min-h-0 resize-none text-sm"
              />
              <Button
                type="button"
                size="icon"
                className="size-9 shrink-0 self-end"
                disabled={!draft.trim() || isSending}
                onClick={handleSend}
                aria-label="Send message"
              >
                <Send className="size-4" />
              </Button>
            </div>
          ) : (
            <p className="mt-2 text-xs text-muted-foreground">
              This appointment was cancelled. Messages are read-only.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
