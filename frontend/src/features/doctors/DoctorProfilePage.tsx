import { useEffect, useRef, useState } from "react"
import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Camera, Stethoscope, Upload } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Skeleton } from "@/components/ui/skeleton"
import { AppLayout } from "@/components/common/AppLayout"
import { ProfileSectionCard } from "@/components/common/ProfileSectionCard"
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

const professionalSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  specialization: z.string().min(1, "Specialization is required"),
  bio: z.string().min(1, "Bio is required").max(2000),
})

const practiceSchema = z.object({
  fee: z.coerce.number().positive("Fee must be positive"),
  consultationDuration: z.coerce.number().int().min(10).max(240).optional(),
})

type ProfessionalFormValues = z.infer<typeof professionalSchema>
type PracticeFormValues = z.infer<typeof practiceSchema>

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
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(doctor?.profilePicture ?? null)

  const { mutate: uploadPicture, isPending: isUploadingPicture } = useUploadDoctorPicture()
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateDoctorProfile()

  const professionalForm = useForm<ProfessionalFormValues>({
    resolver: zodResolver(professionalSchema) as Resolver<ProfessionalFormValues>,
    defaultValues: {
      firstName: doctor?.firstName ?? "",
      lastName: doctor?.lastName ?? "",
      specialization: doctor?.specialization ?? "",
      bio: doctor?.bio ?? "",
    },
  })

  const practiceForm = useForm<PracticeFormValues>({
    resolver: zodResolver(practiceSchema) as Resolver<PracticeFormValues>,
    defaultValues: {
      fee: doctor?.fee ?? 0,
      consultationDuration: doctor?.consultationDuration ?? 30,
    },
  })

  useEffect(() => {
    if (!doctor) return
    professionalForm.reset({
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      specialization: doctor.specialization,
      bio: doctor.bio ?? "",
    })
    practiceForm.reset({
      fee: doctor.fee ?? 0,
      consultationDuration: doctor.consultationDuration ?? 30,
    })
    setPreviewUrl(doctor.profilePicture ?? null)
  }, [doctor, professionalForm, practiceForm])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPreviewUrl(URL.createObjectURL(file))
    uploadPicture(file, {
      onError: () => setPreviewUrl(doctor?.profilePicture ?? null),
    })
  }

  function handleEdit(sectionId: string) {
    setEditingSection(sectionId)
  }

  function handleCancel() {
    if (!doctor) return
    professionalForm.reset({
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      specialization: doctor.specialization,
      bio: doctor.bio ?? "",
    })
    practiceForm.reset({
      fee: doctor.fee ?? 0,
      consultationDuration: doctor.consultationDuration ?? 30,
    })
    setEditingSection(null)
  }

  function saveProfessional() {
    professionalForm.handleSubmit((values) => {
      updateProfile(values, { onSuccess: () => setEditingSection(null) })
    })()
  }

  function savePractice() {
    practiceForm.handleSubmit((values) => {
      updateProfile(values, { onSuccess: () => setEditingSection(null) })
    })()
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
      <div className="mx-auto max-w-2xl space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
          <p className="text-sm text-muted-foreground">Manage your professional information</p>
        </div>

        <Card>
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
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-xl">
                    Dr. {doctor.firstName} {doctor.lastName}
                  </CardTitle>
                  <Badge variant="secondary">{doctor.specialization}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {doctor.fee != null && (
                    <span className="rounded-md bg-muted px-2 py-1">${doctor.fee.toFixed(2)}/session</span>
                  )}
                  <span className="rounded-md bg-muted px-2 py-1">
                    {doctor.consultationDuration} min sessions
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <ProfileSectionCard
          title="Professional Identity"
          description="How patients see you on TellMD"
          sectionId="professional"
          editingSection={editingSection}
          onEdit={handleEdit}
          onCancel={handleCancel}
          onSave={saveProfessional}
          isSaving={isUpdating}
          view={
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <ProfileField label="First Name" value={doctor.firstName} />
                <ProfileField label="Last Name" value={doctor.lastName} />
                <ProfileField label="Specialization" value={doctor.specialization} />
              </div>
              <div className="rounded-lg border bg-muted/40 p-4">
                <p className="text-xs font-medium text-muted-foreground">Biography</p>
                <p className="mt-1 text-sm leading-relaxed">
                  {doctor.bio ?? <span className="text-muted-foreground/60">—</span>}
                </p>
              </div>
            </div>
          }
          edit={
            <Form {...professionalForm}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={professionalForm.control}
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
                    control={professionalForm.control}
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
                  control={professionalForm.control}
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
                  control={professionalForm.control}
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
              </div>
            </Form>
          }
        />

        <ProfileSectionCard
          title="Practice Settings"
          description="Consultation fee and session length"
          sectionId="practice"
          editingSection={editingSection}
          onEdit={handleEdit}
          onCancel={handleCancel}
          onSave={savePractice}
          isSaving={isUpdating}
          view={
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
          }
          edit={
            <Form {...practiceForm}>
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={practiceForm.control}
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
                  control={practiceForm.control}
                  name="consultationDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Session Duration</FormLabel>
                      <Select
                        onValueChange={(v) => field.onChange(Number(v))}
                        value={String(field.value ?? 30)}
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
            </Form>
          }
        />

        <ProfileSectionCard
          title="Account"
          description="Login and account settings"
          sectionId="account"
          editingSection={editingSection}
          onEdit={handleEdit}
          onCancel={handleCancel}
          onSave={() => {}}
          editable={false}
          view={
            <div className="space-y-3">
              <ProfileField label="Email" value={user?.email} />
              <p className="text-xs text-muted-foreground">
                Contact support to change your email address.
              </p>
            </div>
          }
          edit={<></>}
        />
      </div>
    </AppLayout>
  )
}
