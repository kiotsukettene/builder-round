import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Sparkles, Search } from "lucide-react"
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
import { useCustomRecommendation } from "@/hooks/use-recommendation"

const symptomSchema = z.object({
  symptoms: z
    .string()
    .min(10, "Please describe your symptoms in at least 10 characters")
    .max(1000, "Description is too long (max 1000 characters)"),
})

type SymptomFormValues = z.infer<typeof symptomSchema>

interface SymptomSearchDialogProps {
  trigger?: React.ReactNode
}

export function SymptomSearchDialog({ trigger }: SymptomSearchDialogProps) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { mutate: getCustomRecommendation, isPending } = useCustomRecommendation()

  const form = useForm<SymptomFormValues>({
    resolver: zodResolver(symptomSchema),
    defaultValues: { symptoms: "" },
  })

  function onSubmit(values: SymptomFormValues) {
    getCustomRecommendation(values.symptoms, {
      onSuccess: (res) => {
        setOpen(false)
        form.reset()
        navigate("/doctors", {
          state: {
            recommendation: res.data.recommendation,
            doctors: res.data.doctors,
          },
        })
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline">
            <Search className="size-4" />
            Describe Symptoms
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            Find a Doctor by Symptoms
          </DialogTitle>
          <DialogDescription>
            Describe what you're experiencing and our AI will suggest the right type of specialist.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="symptoms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Describe your symptoms</FormLabel>
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
                onClick={() => {
                  setOpen(false)
                  form.reset()
                }}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                <Sparkles className="size-4" />
                {isPending ? "Analyzing..." : "Get Recommendation"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
