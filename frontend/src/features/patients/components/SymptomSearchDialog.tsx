import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Sparkles, Search } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"

const symptomSchema = z.object({
  symptoms: z
    .string()
    .min(10, "Please describe your symptoms in at least 10 characters")
    .max(1000, "Description is too long (max 1000 characters)"),
})

type SymptomFormValues = z.infer<typeof symptomSchema>

interface SymptomSearchDialogProps {
  trigger?: React.ReactNode
  onSubmit: (symptoms: string) => void | Promise<void>
  isPending?: boolean
  disabled?: boolean
  remainingAttempts?: number
  maxAttempts?: number
  resetLabel?: string
}

export function SymptomSearchDialog({
  trigger,
  onSubmit,
  isPending = false,
  disabled = false,
  remainingAttempts,
  maxAttempts = 2,
  resetLabel,
}: SymptomSearchDialogProps) {
  const [open, setOpen] = useState(false)

  const form = useForm<SymptomFormValues>({
    resolver: zodResolver(symptomSchema),
    defaultValues: { symptoms: "" },
  })

  async function handleSubmit(values: SymptomFormValues) {
    if (disabled) {
      toast.error(
        resetLabel
          ? `You've used all symptom-based recommendations. Try again in ${resetLabel}.`
          : "You've reached the symptom-based recommendation limit for now."
      )
      return
    }

    try {
      await onSubmit(values.symptoms)
      setOpen(false)
      form.reset()
    } catch {
      // Parent handles error toasts
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    if (disabled && nextOpen) {
      toast.error(
        resetLabel
          ? `You've used all symptom-based recommendations. Try again in ${resetLabel}.`
          : "You've reached the symptom-based recommendation limit for now."
      )
      return
    }
    setOpen(nextOpen)
    if (!nextOpen) form.reset()
  }

  const attemptsLabel =
    remainingAttempts !== undefined
      ? `${remainingAttempts} of ${maxAttempts} symptom checks left today`
      : null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" disabled={disabled}>
            <Search className="size-4" />
            Describe Symptoms
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            Update Recommendation by Symptoms
          </DialogTitle>
          <DialogDescription>
            Your first recommendation uses your medical history. Describe what you're feeling now
            if your current symptoms are different.
          </DialogDescription>
        </DialogHeader>

        {attemptsLabel && (
          <p className="text-xs text-muted-foreground">{attemptsLabel}</p>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="symptoms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Describe your current symptoms</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g. I've been having persistent chest tightness, shortness of breath when climbing stairs, and occasional palpitations for the past two weeks..."
                      className="min-h-28 resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Be as descriptive as possible for the best recommendation.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending || disabled}>
                <Sparkles className="size-4" />
                {isPending ? "Analyzing..." : "Update Recommendation"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
