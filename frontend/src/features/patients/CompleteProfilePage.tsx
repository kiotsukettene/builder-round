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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useAuthStore } from "@/store/auth.store"
import { useCompletePatientProfile, useUploadPatientPicture } from "@/hooks/use-patient"
import { requiredPositiveNumber } from "@/lib/number-schema"
import { locationFieldsSchema } from "@/lib/location-schema"
import { LocationFormFields } from "@/components/common/LocationFormFields"

const completeProfileSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    birthday: z
      .string()
      .min(1, "Birthday is required")
      .refine((v) => !isNaN(Date.parse(v)) && new Date(v) < new Date(), {
        message: "Please enter a valid date in the past",
      }),
    weight: requiredPositiveNumber("Weight"),
    height: requiredPositiveNumber("Height"),
    phone: z.string().min(1, "Phone number is required").max(20),
    history: z.string().min(1, "Medical history is required").max(2000),
  })
  .merge(locationFieldsSchema)

type CompleteProfileFormValues = z.infer<typeof completeProfileSchema>

export function CompleteProfilePage() {
  const { user } = useAuthStore()
  const patient = user?.patient
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(patient?.profilePicture ?? null)
  const [picUploaded, setPicUploaded] = useState(!!patient?.profilePicture)

  const { mutate: uploadPicture, isPending: isUploadingPicture } = useUploadPatientPicture()
  const { mutate: completeProfile, isPending: isSubmitting } = useCompletePatientProfile()

  const form = useForm<CompleteProfileFormValues>({
    resolver: zodResolver(completeProfileSchema) as Resolver<CompleteProfileFormValues>,
    defaultValues: {
      firstName: patient?.firstName ?? "",
      lastName: patient?.lastName ?? "",
      birthday: "",
      weight: undefined,
      height: undefined,
      phone: patient?.phone ?? "",
      history: patient?.history ?? "",
      address: "",
      latitude: undefined,
      longitude: undefined,
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
        setPreviewUrl(patient?.profilePicture ?? null)
      },
    })
  }

  function onSubmit(values: CompleteProfileFormValues) {
    if (!picUploaded) return
    completeProfile(values)
  }

  const initials = patient
    ? `${patient.firstName[0]}${patient.lastName[0]}`.toUpperCase()
    : "?"

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight">TellMD</h1>
          <p className="mt-1 text-sm text-muted-foreground">Complete your profile to continue</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Complete Your Profile</CardTitle>
            <CardDescription>
              Fill in your details to finish setting up your account. This information helps doctors
              understand your health better.
            </CardDescription>
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

            <Separator />

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
                          <Input placeholder="Jane" {...field} />
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
                          <Input placeholder="Doe" {...field} />
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
                          <Input type="number" step="0.1" placeholder="65.5" {...field} />
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
                          <Input type="number" placeholder="170" {...field} />
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
                        <Input type="tel" placeholder="+1234567890" {...field} />
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
                        <Textarea
                          placeholder="Describe any existing conditions, allergies, medications, or past surgeries..."
                          className="min-h-24 resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Max 2000 characters</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <LocationFormFields control={form.control} addressLabel="Home Address" />

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
