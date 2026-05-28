import { useEffect, useRef, useState } from "react"
import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Pencil, Camera, Upload, X, Check, Stethoscope } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
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
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { AppLayout } from "@/components/common/AppLayout"
import { useAuthStore } from "@/store/auth.store"
import { useUpdateDoctorProfile, useUploadDoctorPicture } from "@/hooks/use-doctor"

const DURATION_OPTIONS = [
  { value: "15", label: "15 minutes" },
  { value: "20", label: "20 minutes" },
  { value: "30", label: "30 minutes" },
  { value: "45", label: "45 minutes" },
  { value: "60", label: "60 minutes" },
  { value: "90", label: "90 minutes" },
  { value: "120", label: "2 hours" },
]

const updateProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  specialization: z.string().min(1, "Specialization is required"),
  bio: z.string().min(1, "Bio is required").max(2000),
  fee: z.coerce.number().positive("Fee must be positive"),
  consultationDuration: z.coerce.number().int().min(10).max(240).optional(),
})

type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>

function ProfileField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm">
        {value ?? <span className="text-muted-foreground/60">—</span>}
      </p>
    </div>
  )
}

export function DoctorProfilePage() {
  const { user } = useAuthStore()
  const doctor = user?.doctor
  const [isEditing, setIsEditing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(doctor?.profilePicture ?? null)

  const { mutate: uploadPicture, isPending: isUploadingPicture } = useUploadDoctorPicture()
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateDoctorProfile()

  const form = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema) as Resolver<UpdateProfileFormValues>,
    defaultValues: {
      firstName: doctor?.firstName ?? "",
      lastName: doctor?.lastName ?? "",
      specialization: doctor?.specialization ?? "",
      bio: doctor?.bio ?? "",
      fee: doctor?.fee ?? 0,
      consultationDuration: doctor?.consultationDuration ?? 30,
    },
  })

  useEffect(() => {
    if (!doctor) return
    form.reset({
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      specialization: doctor.specialization,
      bio: doctor.bio ?? "",
      fee: doctor.fee ?? 0,
      consultationDuration: doctor.consultationDuration ?? 30,
    })
    setPreviewUrl(doctor.profilePicture ?? null)
  }, [doctor, form])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPreviewUrl(URL.createObjectURL(file))
    uploadPicture(file, {
      onError: () => setPreviewUrl(doctor?.profilePicture ?? null),
    })
  }

  function onSubmit(values: UpdateProfileFormValues) {
    updateProfile(values, {
      onSuccess: () => setIsEditing(false),
    })
  }

  if (!doctor) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-2xl space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
            <p className="text-sm text-muted-foreground">Manage your professional information</p>
          </div>
          {!isEditing && (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Pencil className="size-4" />
              Edit Profile
            </Button>
          )}
        </div>

        <Card>
          {/* Profile Header */}
          <CardHeader className="pb-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="size-20">
                  <AvatarImage src={previewUrl ?? undefined} alt="Profile picture" />
                  <AvatarFallback className="text-xl">
                    <Stethoscope className="size-8" />
                  </AvatarFallback>
                </Avatar>
                {isUploadingPicture && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
                    <Upload className="size-4 animate-pulse text-white" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPicture}
                  className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full border-2 border-background bg-foreground text-background hover:bg-foreground/80 disabled:opacity-50"
                >
                  <Camera className="size-3" />
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl">
                    Dr. {doctor.firstName} {doctor.lastName}
                  </CardTitle>
                  <Badge variant="secondary">{doctor.specialization}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <Separator className="mb-6" />

            {!isEditing ? (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <ProfileField
                    label="Consultation Fee"
                    value={doctor.fee != null ? `$${doctor.fee.toFixed(2)}` : null}
                  />
                  <ProfileField
                    label="Session Duration"
                    value={`${doctor.consultationDuration} minutes`}
                  />
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground">Biography</p>
                  <p className="mt-1 text-sm leading-relaxed">
                    {doctor.bio ?? <span className="text-muted-foreground/60">—</span>}
                  </p>
                </div>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="specialization"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Specialization</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Cardiology" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Biography</FormLabel>
                        <FormControl>
                          <Textarea className="min-h-28 resize-none" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="fee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Consultation Fee (USD)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" min="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="consultationDuration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Session Duration</FormLabel>
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
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={isUpdating}>
                      <Check className="size-4" />
                      {isUpdating ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        form.reset()
                        setIsEditing(false)
                      }}
                      disabled={isUpdating}
                    >
                      <X className="size-4" />
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
