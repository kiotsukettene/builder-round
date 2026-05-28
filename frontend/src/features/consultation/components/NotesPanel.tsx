import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getConsultationNote,
  upsertConsultationNote,
} from "@/services/consultation.service";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";

const noteSchema = z.object({
  diagnosis: z.string().optional(),
  notes: z.string().optional(),
  recommendations: z.string().optional(),
});

type NoteFormValues = z.infer<typeof noteSchema>;

interface NotesPanelProps {
  appointmentId: string;
}

export function NotesPanel({ appointmentId }: NotesPanelProps) {
  const queryClient = useQueryClient();
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: existingNote, isLoading } = useQuery({
    queryKey: ["consultation-note", appointmentId],
    queryFn: () => getConsultationNote(appointmentId),
  });

  const { register, watch, reset } = useForm<NoteFormValues>({
    resolver: zodResolver(noteSchema),
    defaultValues: { diagnosis: "", notes: "", recommendations: "" },
  });

  useEffect(() => {
    if (existingNote) {
      reset({
        diagnosis: existingNote.diagnosis ?? "",
        notes: existingNote.notes ?? "",
        recommendations: existingNote.recommendations ?? "",
      });
    }
  }, [existingNote, reset]);

  const { mutate: saveNote, isPending: isSaving } = useMutation({
    mutationFn: (data: NoteFormValues) =>
      upsertConsultationNote(appointmentId, data),
    onSuccess: () => {
      setSavedAt(new Date());
      queryClient.invalidateQueries({
        queryKey: ["consultation-note", appointmentId],
      });
    },
  });

  const formValues = watch();

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      const hasContent =
        formValues.diagnosis || formValues.notes || formValues.recommendations;
      if (hasContent) {
        saveNote(formValues);
      }
    }, 1500);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [formValues.diagnosis, formValues.notes, formValues.recommendations]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin mr-2" />
        Loading notes...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 h-full overflow-y-auto">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm text-foreground">
          Consultation Notes
        </h3>
        {isSaving && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            Saving...
          </span>
        )}
        {!isSaving && savedAt && (
          <span className="text-xs text-emerald-600 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Saved
          </span>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1 block">
            Diagnosis
          </label>
          <textarea
            {...register("diagnosis")}
            placeholder="Enter diagnosis..."
            rows={2}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1 block">
            Notes
          </label>
          <textarea
            {...register("notes")}
            placeholder="Clinical observations, symptoms discussed..."
            rows={4}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1 block">
            Recommendations
          </label>
          <textarea
            {...register("recommendations")}
            placeholder="Follow-up advice, lifestyle recommendations..."
            rows={3}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </div>

        <Button
          type="button"
          size="sm"
          onClick={() => saveNote(formValues)}
          disabled={isSaving}
          className="self-end"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin mr-1" />
              Saving
            </>
          ) : (
            "Save Notes"
          )}
        </Button>
      </div>
    </div>
  );
}
