import { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"
import { useRegister } from "@/hooks/use-auth"

const patientSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.literal("PATIENT"),
})

const doctorSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.literal("DOCTOR"),
  specialization: z.string().min(1, "Specialization is required"),
})

type PatientFormValues = z.infer<typeof patientSchema>
type DoctorFormValues = z.infer<typeof doctorSchema>

export function RegisterPage() {
  const [searchParams] = useSearchParams()
  const [isDoctor, setIsDoctor] = useState(searchParams.get("role") === "doctor")
  const [showPassword, setShowPassword] = useState(false)
  const { mutate: register, isPending } = useRegister()

  const patientForm = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: { firstName: "", lastName: "", email: "", password: "", role: "PATIENT" },
  })

  const doctorForm = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "DOCTOR",
      specialization: "",
    },
  })

  useEffect(() => {
    const roleParam = searchParams.get("role")
    setIsDoctor(roleParam === "doctor")
  }, [searchParams])

  function onPatientSubmit(values: PatientFormValues) {
    register(values)
  }

  function onDoctorSubmit(values: DoctorFormValues) {
    register(values)
  }

  const sharedPasswordField = (
    form: typeof patientForm | typeof doctorForm,
    name: "password"
  ) => (
    <FormField
      control={form.control as typeof patientForm.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Password</FormLabel>
          <FormControl>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 characters"
                autoComplete="new-password"
                {...field}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight">TellMD</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tell us your symptoms. We connect you to the right doctor.
          </p>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">
              {isDoctor ? "Doctor Registration" : "Patient Registration"}
            </CardTitle>
            <CardDescription>
              {isDoctor
                ? "Create your doctor account to start accepting patients"
                : "Create your account to get started"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {!isDoctor ? (
              <Form {...patientForm}>
                <form onSubmit={patientForm.handleSubmit(onPatientSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={patientForm.control}
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
                      control={patientForm.control}
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
                    control={patientForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="you@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {sharedPasswordField(patientForm, "password")}

                  <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </Form>
            ) : (
              <Form {...doctorForm}>
                <form onSubmit={doctorForm.handleSubmit(onDoctorSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={doctorForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={doctorForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Smith" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={doctorForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="doctor@hospital.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={doctorForm.control}
                    name="specialization"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Specialization</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Cardiology, Pediatrics" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {sharedPasswordField(doctorForm, "password")}

                  <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? "Creating account..." : "Create Doctor Account"}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-3 pt-0">
            <Separator />
            <button
              type="button"
              onClick={() => setIsDoctor((v) => !v)}
              className="text-sm text-muted-foreground underline-offset-4 hover:underline"
            >
              {isDoctor
                ? "← Register as Patient instead"
                : "Are you a doctor? Register as Doctor"}
            </button>
          </CardFooter>
        </Card>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
