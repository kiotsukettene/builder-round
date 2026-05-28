import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addPrescription,
  deletePrescription,
  listPrescriptions,
  updatePrescription,
} from "@/services/consultation.service";
import type { Prescription } from "@/types/consultation";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Trash2, Pencil, X, Check } from "lucide-react";

const prescriptionSchema = z.object({
  medication: z.string().min(1, "Medication is required"),
  dosage: z.string().optional(),
  frequency: z.string().optional(),
  duration: z.string().optional(),
  instructions: z.string().optional(),
});

type PrescriptionFormValues = z.infer<typeof prescriptionSchema>;

const emptyForm: PrescriptionFormValues = {
  medication: "",
  dosage: "",
  frequency: "",
  duration: "",
  instructions: "",
};

interface PrescriptionsPanelProps {
  appointmentId: string;
}

function PrescriptionRow({
  prescription,
  appointmentId,
}: {
  prescription: Prescription;
  appointmentId: string;
}) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const { register, handleSubmit, reset } = useForm<PrescriptionFormValues>({
    defaultValues: {
      medication: prescription.medication,
      dosage: prescription.dosage ?? "",
      frequency: prescription.frequency ?? "",
      duration: prescription.duration ?? "",
      instructions: prescription.instructions ?? "",
    },
  });

  const { mutate: update, isPending: isUpdating } = useMutation({
    mutationFn: (data: PrescriptionFormValues) =>
      updatePrescription(appointmentId, prescription.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["prescriptions", appointmentId],
      });
      setIsEditing(false);
    },
  });

  const { mutate: remove, isPending: isRemoving } = useMutation({
    mutationFn: () => deletePrescription(appointmentId, prescription.id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["prescriptions", appointmentId],
      });
    },
  });

  if (isEditing) {
    return (
      <form
        onSubmit={handleSubmit((data) => update(data))}
        className="border border-border rounded-md p-3 flex flex-col gap-2 bg-muted/30"
      >
        <input
          {...register("medication")}
          placeholder="Medication *"
          className="w-full rounded border border-input bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            {...register("dosage")}
            placeholder="Dosage (e.g. 500mg)"
            className="rounded border border-input bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <input
            {...register("frequency")}
            placeholder="Frequency (e.g. Twice daily)"
            className="rounded border border-input bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <input
          {...register("duration")}
          placeholder="Duration (e.g. 7 days)"
          className="w-full rounded border border-input bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <input
          {...register("instructions")}
          placeholder="Instructions (e.g. Take with food)"
          className="w-full rounded border border-input bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <div className="flex gap-2 justify-end">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => {
              reset();
              setIsEditing(false);
            }}
          >
            <X className="w-3 h-3 mr-1" />
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={isUpdating}>
            {isUpdating ? (
              <Loader2 className="w-3 h-3 animate-spin mr-1" />
            ) : (
              <Check className="w-3 h-3 mr-1" />
            )}
            Save
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="border border-border rounded-md p-3 flex flex-col gap-1 group">
      <div className="flex items-start justify-between gap-2">
        <span className="font-medium text-sm text-foreground">
          {prescription.medication}
        </span>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="p-1 text-muted-foreground hover:text-foreground rounded"
          >
            <Pencil className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => remove()}
            disabled={isRemoving}
            className="p-1 text-muted-foreground hover:text-destructive rounded"
          >
            {isRemoving ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Trash2 className="w-3 h-3" />
            )}
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
        {prescription.dosage && <span>{prescription.dosage}</span>}
        {prescription.frequency && <span>· {prescription.frequency}</span>}
        {prescription.duration && <span>· {prescription.duration}</span>}
      </div>
      {prescription.instructions && (
        <p className="text-xs text-muted-foreground mt-0.5 italic">
          {prescription.instructions}
        </p>
      )}
    </div>
  );
}

function AddPrescriptionForm({
  appointmentId,
  onClose,
}: {
  appointmentId: string;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState, reset } =
    useForm<PrescriptionFormValues>({
      resolver: zodResolver(prescriptionSchema),
      defaultValues: emptyForm,
    });

  const { mutate: add, isPending } = useMutation({
    mutationFn: (data: PrescriptionFormValues) =>
      addPrescription(appointmentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["prescriptions", appointmentId],
      });
      reset(emptyForm);
      onClose();
    },
  });

  return (
    <form
      onSubmit={handleSubmit((data) => add(data))}
      className="border border-border rounded-md p-3 flex flex-col gap-2 bg-muted/30"
    >
      <p className="text-xs font-medium text-muted-foreground mb-1">
        New Prescription
      </p>
      <input
        {...register("medication")}
        placeholder="Medication name *"
        className="w-full rounded border border-input bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
      />
      {formState.errors.medication && (
        <p className="text-xs text-destructive">
          {formState.errors.medication.message}
        </p>
      )}
      <div className="grid grid-cols-2 gap-2">
        <input
          {...register("dosage")}
          placeholder="Dosage (e.g. 500mg)"
          className="rounded border border-input bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <input
          {...register("frequency")}
          placeholder="Frequency (e.g. Twice daily)"
          className="rounded border border-input bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>
      <input
        {...register("duration")}
        placeholder="Duration (e.g. 7 days)"
        className="w-full rounded border border-input bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
      />
      <input
        {...register("instructions")}
        placeholder="Instructions (e.g. Take with food)"
        className="w-full rounded border border-input bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
      />
      <div className="flex gap-2 justify-end">
        <Button type="button" size="sm" variant="ghost" onClick={onClose}>
          <X className="w-3 h-3 mr-1" />
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? (
            <Loader2 className="w-3 h-3 animate-spin mr-1" />
          ) : (
            <Plus className="w-3 h-3 mr-1" />
          )}
          Add
        </Button>
      </div>
    </form>
  );
}

export function PrescriptionsPanel({ appointmentId }: PrescriptionsPanelProps) {
  const [isAdding, setIsAdding] = useState(false);

  const { data: prescriptions = [], isLoading } = useQuery({
    queryKey: ["prescriptions", appointmentId],
    queryFn: () => listPrescriptions(appointmentId),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin mr-2" />
        Loading prescriptions...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4 h-full overflow-y-auto">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm text-foreground">Prescriptions</h3>
        {!isAdding && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="w-3 h-3 mr-1" />
            Add
          </Button>
        )}
      </div>

      {isAdding && (
        <AddPrescriptionForm
          appointmentId={appointmentId}
          onClose={() => setIsAdding(false)}
        />
      )}

      {prescriptions.length === 0 && !isAdding ? (
        <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
          <p className="text-sm">No prescriptions yet</p>
          <p className="text-xs mt-1">
            Click &quot;Add&quot; to prescribe medication
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {prescriptions.map((p) => (
            <PrescriptionRow
              key={p.id}
              prescription={p}
              appointmentId={appointmentId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
