import { useEffect, useRef, useState } from "react"
import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Pencil, Camera, Upload, X, Check, User } from "lucide-react"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { AppLayout } from "@/components/common/AppLayout"
import { useAuthStore } from "@/store/auth.store"
import { useUpdatePatientProfile, useUploadPatientPicture } from "@/hooks/use-patient"

const updateProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  birthday: z.string().optional(),
  weight: z.coerce.number().positive().optional().or(z.literal("")),
  height: z.coerce.number().positive().optional().or(z.literal("")),
  phone: z.string().max(20).optional(),
  history: z.string().max(2000).optional(),
})

type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>

function ProfileField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm">{value ?? <span className="text-muted-foreground/60">—</span>}</p>
    </div>
  )
}

export function PatientProfilePage() {
  const { user } = useAuthStore()
  const patient = user?.patient
  const [isEditing, setIsEditing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(patient?.profilePicture ?? null)

  const { mutate: uploadPicture, isPending: isUploadingPicture } = useUploadPatientPicture()
  const { mutate: updateProfile, isPending: isUpdating } = useUpdatePatientProfile()

  const form = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema) as Resolver<UpdateProfileFormValues>,
    defaultValues: {
      firstName: patient?.firstName ?? "",
      lastName: patient?.lastName ?? "",
      birthday: patient?.birthday ? patient.birthday.split("T")[0] : "",
      weight: patient?.weight ?? undefined,
      height: patient?.height ?? undefined,
      phone: patient?.phone ?? "",
      history: patient?.history ?? "",
    },
  })

  useEffect(() => {
    if (!patient) return
    form.reset({
      firstName: patient.firstName,
      lastName: patient.lastName,
      birthday: patient.birthday ? patient.birthday.split("T")[0] : "",
      weight: patient.weight ?? undefined,
      height: patient.height ?? undefined,
      phone: patient.phone ?? "",
      history: patient.history ?? "",
    })
    setPreviewUrl(patient.profilePicture ?? null)
  }, [patient, form])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPreviewUrl(URL.createObjectURL(file))
    uploadPicture(file, {
      onError: () => setPreviewUrl(patient?.profilePicture ?? null),
    })
  }

  function onSubmit(values: UpdateProfileFormValues) {
    const payload = {
      firstName: values.firstName,
      lastName: values.lastName,
      birthday: values.birthday || undefined,
      weight: values.weight !== "" && values.weight ? Number(values.weight) : undefined,
      height: values.height !== "" && values.height ? Number(values.height) : undefined,
      phone: values.phone || undefined,
      history: values.history || undefined,
    }
    updateProfile(payload, {
      onSuccess: () => setIsEditing(false),
    })
  }

  if (!patient) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-2xl space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AppLayout>
    )
  }

  const birthday = patient.birthday
    ? new Date(patient.birthday).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
            <p className="text-sm text-muted-foreground">Manage your personal health information</p>
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
                    <User className="size-8" />
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
                <CardTitle className="text-xl">
                  {patient.firstName} {patient.lastName}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <Separator className="mb-6" />

            {!isEditing ? (
              <div className="grid gap-6 sm:grid-cols-2">
                <ProfileField label="Date of Birth" value={birthday} />
                <ProfileField label="Phone" value={patient.phone} />
                <ProfileField
                  label="Weight"
                  value={patient.weight ? `${patient.weight} kg` : null}
                />
                <ProfileField
                  label="Height"
                  value={patient.height ? `${patient.height} cm` : null}
                />
                <div className="sm:col-span-2">
                  <p className="text-xs font-medium text-muted-foreground">Medical History</p>
                  <p className="mt-0.5 text-sm leading-relaxed">
                    {patient.history ?? <span className="text-muted-foreground/60">—</span>}
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
                    name="birthday"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <Input type="date" max={new Date().toISOString().split("T")[0]} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weight (kg)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.1" {...field} value={field.value ?? ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="height"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Height (cm)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} value={field.value ?? ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input type="tel" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="history"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medical History</FormLabel>
                        <FormControl>
                          <Textarea className="min-h-24 resize-none" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
