import { useEffect, useRef, useState } from "react"
import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Camera, Upload, User } from "lucide-react"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { AppLayout } from "@/components/common/AppLayout"
import { ProfileSectionCard } from "@/components/common/ProfileSectionCard"
import { useAuthStore } from "@/store/auth.store"
import { useUpdatePatientProfile, useUploadPatientPicture } from "@/hooks/use-patient"
import { optionalPositiveNumber } from "@/lib/number-schema"
import { locationFieldsSchema } from "@/lib/location-schema"
import { LocationFormFields } from "@/components/common/LocationFormFields"

const personalSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  birthday: z.string().optional(),
  phone: z.string().max(20).optional(),
})

const healthSchema = z.object({
  weight: optionalPositiveNumber("Weight"),
  height: optionalPositiveNumber("Height"),
  history: z.string().max(2000).optional(),
})

type PersonalFormValues = z.infer<typeof personalSchema>
type HealthFormValues = z.infer<typeof healthSchema>
type LocationFormValues = z.infer<typeof locationFieldsSchema>

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
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(patient?.profilePicture ?? null)

  const { mutate: uploadPicture, isPending: isUploadingPicture } = useUploadPatientPicture()
  const { mutate: updateProfile, isPending: isUpdating } = useUpdatePatientProfile()

  const personalForm = useForm<PersonalFormValues>({
    resolver: zodResolver(personalSchema) as Resolver<PersonalFormValues>,
    defaultValues: {
      firstName: patient?.firstName ?? "",
      lastName: patient?.lastName ?? "",
      birthday: patient?.birthday ? patient.birthday.split("T")[0] : "",
      phone: patient?.phone ?? "",
    },
  })

  const healthForm = useForm<HealthFormValues>({
    resolver: zodResolver(healthSchema) as Resolver<HealthFormValues>,
    defaultValues: {
      weight: patient?.weight ?? undefined,
      height: patient?.height ?? undefined,
      history: patient?.history ?? "",
    },
  })

  const locationForm = useForm<LocationFormValues>({
    resolver: zodResolver(locationFieldsSchema) as Resolver<LocationFormValues>,
    defaultValues: {
      address: patient?.address ?? "",
      latitude: patient?.latitude ?? undefined,
      longitude: patient?.longitude ?? undefined,
    },
  })

  useEffect(() => {
    if (!patient) return
    personalForm.reset({
      firstName: patient.firstName,
      lastName: patient.lastName,
      birthday: patient.birthday ? patient.birthday.split("T")[0] : "",
      phone: patient.phone ?? "",
    })
    healthForm.reset({
      weight: patient.weight ?? undefined,
      height: patient.height ?? undefined,
      history: patient.history ?? "",
    })
    locationForm.reset({
      address: patient.address ?? "",
      latitude: patient.latitude ?? undefined,
      longitude: patient.longitude ?? undefined,
    })
    setPreviewUrl(patient.profilePicture ?? null)
  }, [patient, personalForm, healthForm, locationForm])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPreviewUrl(URL.createObjectURL(file))
    uploadPicture(file, {
      onError: () => setPreviewUrl(patient?.profilePicture ?? null),
    })
  }

  function handleEdit(sectionId: string) {
    setEditingSection(sectionId)
  }

  function handleCancel() {
    if (!patient) return
    personalForm.reset({
      firstName: patient.firstName,
      lastName: patient.lastName,
      birthday: patient.birthday ? patient.birthday.split("T")[0] : "",
      phone: patient.phone ?? "",
    })
    healthForm.reset({
      weight: patient.weight ?? undefined,
      height: patient.height ?? undefined,
      history: patient.history ?? "",
    })
    locationForm.reset({
      address: patient.address ?? "",
      latitude: patient.latitude ?? undefined,
      longitude: patient.longitude ?? undefined,
    })
    setEditingSection(null)
  }

  function savePersonal() {
    personalForm.handleSubmit((values) => {
      updateProfile(
        {
          firstName: values.firstName,
          lastName: values.lastName,
          birthday: values.birthday || undefined,
          phone: values.phone || undefined,
        },
        { onSuccess: () => setEditingSection(null) }
      )
    })()
  }

  function saveHealth() {
    healthForm.handleSubmit((values) => {
      updateProfile(
        {
          weight: values.weight,
          height: values.height,
          history: values.history || undefined,
        },
        { onSuccess: () => setEditingSection(null) }
      )
    })()
  }

  function saveLocation() {
    locationForm.handleSubmit((values) => {
      updateProfile(values, { onSuccess: () => setEditingSection(null) })
    })()
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

  const bmi =
    patient.weight && patient.height
      ? (patient.weight / (patient.height / 100) ** 2).toFixed(1)
      : null

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
          <p className="text-sm text-muted-foreground">Manage your personal health information</p>
        </div>

        <Card>
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
        </Card>

        <ProfileSectionCard
          title="Personal Information"
          description="Your basic contact details"
          sectionId="personal"
          editingSection={editingSection}
          onEdit={handleEdit}
          onCancel={handleCancel}
          onSave={savePersonal}
          isSaving={isUpdating}
          view={
            <div className="grid gap-4 sm:grid-cols-2">
              <ProfileField label="First Name" value={patient.firstName} />
              <ProfileField label="Last Name" value={patient.lastName} />
              <ProfileField label="Date of Birth" value={birthday} />
              <ProfileField label="Phone" value={patient.phone} />
            </div>
          }
          edit={
            <Form {...personalForm}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={personalForm.control}
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
                    control={personalForm.control}
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
                  control={personalForm.control}
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
                <FormField
                  control={personalForm.control}
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
              </div>
            </Form>
          }
        />

        <ProfileSectionCard
          title="Health Details"
          description="Physical metrics and medical history"
          sectionId="health"
          editingSection={editingSection}
          onEdit={handleEdit}
          onCancel={handleCancel}
          onSave={saveHealth}
          isSaving={isUpdating}
          view={
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <ProfileField
                  label="Weight"
                  value={patient.weight ? `${patient.weight} kg` : null}
                />
                <ProfileField
                  label="Height"
                  value={patient.height ? `${patient.height} cm` : null}
                />
                <ProfileField label="BMI" value={bmi} />
              </div>
              <div className="rounded-lg border bg-muted/40 p-4">
                <p className="text-xs font-medium text-muted-foreground">Medical History</p>
                <p className="mt-1 text-sm leading-relaxed">
                  {patient.history ?? <span className="text-muted-foreground/60">—</span>}
                </p>
              </div>
            </div>
          }
          edit={
            <Form {...healthForm}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={healthForm.control}
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
                    control={healthForm.control}
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
                  control={healthForm.control}
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
              </div>
            </Form>
          }
        />

        <ProfileSectionCard
          title="Location"
          description="Used to find doctors nearest to you"
          sectionId="location"
          editingSection={editingSection}
          onEdit={handleEdit}
          onCancel={handleCancel}
          onSave={saveLocation}
          isSaving={isUpdating}
          view={
            <div className="space-y-4">
              <ProfileField label="Address" value={patient.address} />
              <div className="grid gap-4 sm:grid-cols-2">
                <ProfileField
                  label="Latitude"
                  value={patient.latitude != null ? String(patient.latitude) : null}
                />
                <ProfileField
                  label="Longitude"
                  value={patient.longitude != null ? String(patient.longitude) : null}
                />
              </div>
            </div>
          }
          edit={
            <Form {...locationForm}>
              <LocationFormFields control={locationForm.control} addressLabel="Home Address" />
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
