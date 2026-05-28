import { useRef, useState } from "react"
import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Camera, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useAuthStore } from "@/store/auth.store"
import { useCompleteDoctorProfile, useUploadDoctorPicture } from "@/hooks/use-doctor"

const DURATION_OPTIONS = [
  { value: "15", label: "15 minutes" },
  { value: "20", label: "20 minutes" },
  { value: "30", label: "30 minutes" },
  { value: "45", label: "45 minutes" },
  { value: "60", label: "60 minutes" },
  { value: "90", label: "90 minutes" },
  { value: "120", label: "2 hours" },
]

const completeProfileSchema = z.object({
  bio: z.string().min(1, "Bio is required").max(2000),
  fee: z.coerce.number().positive("Fee must be a positive amount"),
  consultationDuration: z.coerce.number().int().min(10).max(240).optional(),
})

type CompleteProfileFormValues = z.infer<typeof completeProfileSchema>

export function DoctorCompleteProfilePage() {
  const { user } = useAuthStore()
  const doctor = user?.doctor
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(doctor?.profilePicture ?? null)
  const [picUploaded, setPicUploaded] = useState(!!doctor?.profilePicture)

  const { mutate: uploadPicture, isPending: isUploadingPicture } = useUploadDoctorPicture()
  const { mutate: completeProfile, isPending: isSubmitting } = useCompleteDoctorProfile()

  const form = useForm<CompleteProfileFormValues>({
    resolver: zodResolver(completeProfileSchema) as Resolver<CompleteProfileFormValues>,
    defaultValues: {
      bio: doctor?.bio ?? "",
      fee: undefined,
      consultationDuration: 30,
    },
  })

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)

    uploadPicture(file, {
      onSuccess: () => setPicUploaded(true),
      onError: () => {
        setPreviewUrl(doctor?.profilePicture ?? null)
      },
    })
  }

  function onSubmit(values: CompleteProfileFormValues) {
    if (!picUploaded) return
    completeProfile(values)
  }

  const initials = doctor
    ? `${doctor.firstName[0]}${doctor.lastName[0]}`.toUpperCase()
    : "?"

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight">TellMD</h1>
          <p className="mt-1 text-sm text-muted-foreground">Complete your doctor profile</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Complete Your Profile</CardTitle>
                <CardDescription>
                  Help patients understand your expertise and set your consultation preferences.
                </CardDescription>
              </div>
              {doctor?.specialization && (
                <Badge variant="secondary">{doctor.specialization}</Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Profile Picture Upload */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <Avatar className="size-24">
                  <AvatarImage src={previewUrl ?? undefined} alt="Profile picture" />
                  <AvatarFallback className="text-xl">{initials}</AvatarFallback>
                </Avatar>
                {isUploadingPicture && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
                    <Upload className="size-5 animate-pulse text-white" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPicture}
                  className="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full border-2 border-background bg-foreground text-background hover:bg-foreground/80 disabled:opacity-50"
                >
                  <Camera className="size-3.5" />
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="text-center">
                <p className="text-sm font-medium">Profile Photo</p>
                <p className="text-xs text-muted-foreground">
                  {picUploaded ? "Photo uploaded" : "Required — JPEG, PNG, or WebP, max 5 MB"}
                </p>
                {!picUploaded && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingPicture}
                  >
                    <Upload className="size-3.5" />
                    {isUploadingPicture ? "Uploading..." : "Upload Photo"}
                  </Button>
                )}
              </div>
            </div>

            {/* Doctor info summary */}
            {doctor && (
              <div className="rounded-lg border bg-muted/40 px-4 py-3 text-sm">
                <p className="font-medium">
                  Dr. {doctor.firstName} {doctor.lastName}
                </p>
                <p className="text-muted-foreground">{doctor.specialization}</p>
              </div>
            )}

            <Separator />

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Biography</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your experience, qualifications, and approach to patient care..."
                          className="min-h-28 resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Max 2000 characters</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Consultation Fee (USD)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" min="0" placeholder="75.00" {...field} />
                      </FormControl>
                      <FormDescription>Fee charged per consultation session</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="consultationDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Consultation Duration</FormLabel>
                      <Select
                        onValueChange={(v) => field.onChange(Number(v))}
                        defaultValue={String(field.value ?? 30)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {DURATION_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>Default duration for each appointment</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {!picUploaded && (
                  <p className="text-sm text-destructive">
                    Please upload a profile photo before continuing.
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || isUploadingPicture || !picUploaded}
                >
                  {isSubmitting ? "Saving..." : "Complete Profile"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
