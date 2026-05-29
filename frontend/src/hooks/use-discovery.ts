import { useQuery } from "@tanstack/react-query"
import { isQueryContentLoading } from "@/lib/query-utils"
import * as discoveryService from "@/services/discovery.service"
import type { DoctorListFilters } from "@/types/doctor"

export function useDoctorList(filters: DoctorListFilters = {}) {
  const result = useQuery({
    queryKey: ["doctors", filters],
    queryFn: () => discoveryService.listDoctors(filters),
    staleTime: 1000 * 60,
    placeholderData: (prev) => prev,
  })

  return {
    ...result,
    isContentLoading: isQueryContentLoading(result),
  }
}

export function useDoctorDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["doctor", id],
    queryFn: async () => {
      const res = await discoveryService.getDoctorById(id!)
      return res.data
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  })
}

export function useDoctorSlots(doctorId: string | undefined, date: string | undefined) {
  return useQuery({
    queryKey: ["doctor-slots", doctorId, date],
    queryFn: async () => {
      const res = await discoveryService.getDoctorSlots(doctorId!, date!)
      return res.data
    },
    enabled: !!doctorId && !!date,
    staleTime: 1000 * 60,
  })
}
