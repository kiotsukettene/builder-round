import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import * as patientService from "@/services/patient.service"
import { useAuthStore } from "@/store/auth.store"
import type { CompletePatientProfilePayload, UpdatePatientProfilePayload } from "@/types/auth"

export function useCompletePatientProfile() {
  const updateProfile = useAuthStore((s) => s.updateProfile)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CompletePatientProfilePayload) =>
      patientService.completePatientProfile(payload),
    onSuccess: (res) => {
      updateProfile(res.data)
      queryClient.invalidateQueries({ queryKey: ["me"] })
      toast.success("Profile completed successfully!")
      navigate("/profile")
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const message = error?.response?.data?.message ?? "Failed to complete profile."
      toast.error(message)
    },
  })
}

export function useUpdatePatientProfile() {
  const updateProfile = useAuthStore((s) => s.updateProfile)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdatePatientProfilePayload) =>
      patientService.updatePatientProfile(payload),
    onSuccess: (res) => {
      updateProfile(res.data)
      queryClient.invalidateQueries({ queryKey: ["me"] })
      toast.success("Profile updated successfully!")
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const message = error?.response?.data?.message ?? "Failed to update profile."
      toast.error(message)
    },
  })
}

export function useUploadPatientPicture() {
  const updateProfile = useAuthStore((s) => s.updateProfile)
  const user = useAuthStore((s) => s.user)

  return useMutation({
    mutationFn: (file: File) => patientService.uploadPatientProfilePicture(file),
    onSuccess: (res) => {
      if (user?.patient) {
        updateProfile({ ...user.patient, profilePicture: res.data.profilePicture })
      }
      toast.success("Profile picture uploaded!")
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const message = error?.response?.data?.message ?? "Failed to upload picture."
      toast.error(message)
    },
  })
}
