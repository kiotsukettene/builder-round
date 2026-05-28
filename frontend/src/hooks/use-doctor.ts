import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import * as doctorService from "@/services/doctor.service"
import { useAuthStore } from "@/store/auth.store"
import type { CompleteDoctorProfilePayload, UpdateDoctorProfilePayload } from "@/types/auth"

export function useCompleteDoctorProfile() {
  const updateProfile = useAuthStore((s) => s.updateProfile)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CompleteDoctorProfilePayload) =>
      doctorService.completeDoctorProfile(payload),
    onSuccess: (res) => {
      updateProfile(res.data)
      queryClient.invalidateQueries({ queryKey: ["me"] })
      toast.success("Profile completed successfully!")
      navigate("/doctor/profile")
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const message = error?.response?.data?.message ?? "Failed to complete profile."
      toast.error(message)
    },
  })
}

export function useUpdateDoctorProfile() {
  const updateProfile = useAuthStore((s) => s.updateProfile)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateDoctorProfilePayload) =>
      doctorService.updateDoctorProfile(payload),
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

export function useUploadDoctorPicture() {
  const updateProfile = useAuthStore((s) => s.updateProfile)
  const user = useAuthStore((s) => s.user)

  return useMutation({
    mutationFn: (file: File) => doctorService.uploadDoctorProfilePicture(file),
    onSuccess: (res) => {
      if (user?.doctor) {
        updateProfile({ ...user.doctor, profilePicture: res.data.profilePicture })
      }
      toast.success("Profile picture uploaded!")
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const message = error?.response?.data?.message ?? "Failed to upload picture."
      toast.error(message)
    },
  })
}
