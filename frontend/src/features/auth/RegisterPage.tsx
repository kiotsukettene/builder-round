import { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Eye, EyeOff, Stethoscope, UserRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { AuthLayout } from "@/components/common/AuthLayout"
import { PasswordStrengthChecklist } from "@/components/auth/PasswordStrengthChecklist"
import { useRegister } from "@/hooks/use-auth"
import { passwordSchema } from "@/lib/password-schema"
import { cn } from "@/lib/utils"

const registerSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.email("Please enter a valid email").trim().toLowerCase(),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
    role: z.enum(["PATIENT", "DOCTOR"]),
    specialization: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords do not match",
        path: ["confirmPassword"],
      })
    }
    if (data.role === "DOCTOR" && !data.specialization?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Specialization is required",
        path: ["specialization"],
      })
    }
  })

type RegisterFormValues = z.infer<typeof registerSchema>

type RegisterRole = "patient" | "doctor"

function roleFromParam(param: string | null): RegisterRole {
  return param === "doctor" ? "doctor" : "patient"
}

function apiRoleFromUi(role: RegisterRole): RegisterFormValues["role"] {
  return role === "doctor" ? "DOCTOR" : "PATIENT"
}

export function RegisterPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [uiRole, setUiRole] = useState<RegisterRole>(() =>
    roleFromParam(searchParams.get("role"))
  )
  const [showPassword, setShowPassword] = useState(false)
  const { mutate: register, isPending } = useRegister()

  const isDoctor = uiRole === "doctor"

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: apiRoleFromUi(roleFromParam(searchParams.get("role"))),
      specialization: "",
    },
  })

  const password = form.watch("password")

  useEffect(() => {
    const nextRole = roleFromParam(searchParams.get("role"))
    setUiRole(nextRole)
    form.setValue("role", apiRoleFromUi(nextRole))
    if (nextRole === "patient") {
      form.setValue("specialization", "")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync URL ?role= to form; form methods are stable
  }, [searchParams])

  function selectRole(nextRole: RegisterRole) {
    setUiRole(nextRole)
    form.setValue("role", apiRoleFromUi(nextRole))
    if (nextRole === "patient") {
      form.setValue("specialization", "")
      form.clearErrors("specialization")
    }
    setSearchParams(nextRole === "doctor" ? { role: "doctor" } : {}, { replace: true })
  }

  function onSubmit({ confirmPassword: _, specialization, ...values }: RegisterFormValues) {
    if (values.role === "DOCTOR") {
      register({ ...values, specialization: specialization!.trim() })
    } else {
      register(values)
    }
  }

  return (
    <AuthLayout
      footer={
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Create Account</CardTitle>
          <CardDescription>
            {isDoctor
              ? "Register as a doctor to start accepting patients"
              : "Register as a patient to find the right doctor"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
            <button
              type="button"
              onClick={() => selectRole("patient")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all",
                !isDoctor
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <UserRound className="size-4" />
              Patient
            </button>
            <button
              type="button"
              onClick={() => selectRole("doctor")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all",
                isDoctor
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Stethoscope className="size-4" />
              Doctor
            </button>
          </div>

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
                        <Input
                          placeholder={isDoctor ? "John" : "Jane"}
                          autoComplete="given-name"
                          {...field}
                        />
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
                        <Input
                          placeholder={isDoctor ? "Smith" : "Doe"}
                          autoComplete="family-name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder={isDoctor ? "doctor@hospital.com" : "you@example.com"}
                        autoComplete="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isDoctor ? (
                <FormField
                  control={form.control}
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
              ) : null}

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a password"
                          autoComplete="new-password"
                          {...field}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowPassword((v) => !v)}
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <EyeOff className="size-4" />
                          ) : (
                            <Eye className="size-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <PasswordStrengthChecklist password={password ?? ""} className="mt-2" />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Re-enter your password"
                          autoComplete="new-password"
                          {...field}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowPassword((v) => !v)}
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <EyeOff className="size-4" />
                          ) : (
                            <Eye className="size-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending
                  ? "Creating account..."
                  : isDoctor
                    ? "Create Doctor Account"
                    : "Create Account"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
