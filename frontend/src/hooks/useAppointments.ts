import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  ApiResponse,
  ApiPaginatedResponse,
  Appointment,
  AppointmentQuery,
  CreateAppointmentRequest,
  UpdateAppointmentRequest,
  AppointmentStats,
} from "@/types";

export const useAppointments = (query: AppointmentQuery = {}) => {
  return useQuery({
    queryKey: ["appointments", query],
    queryFn: async (): Promise<{ data: Appointment[]; meta: ApiPaginatedResponse<Appointment>["meta"] }> => {
      const response = await api.get<ApiPaginatedResponse<Appointment>>("/appointments", {
        params: query,
      });
      return {
        data: response.data.data,
        meta: response.data.meta,
      };
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useAppointment = (id: string | null | undefined) => {
  return useQuery({
    queryKey: ["appointment", id],
    queryFn: async (): Promise<Appointment> => {
      if (!id) throw new Error("Appointment ID is required");
      const response = await api.get<ApiResponse<Appointment>>(`/appointments/${id}`);
      return response.data.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });
};

export const useUpcomingAppointments = (limit: number = 5) => {
  return useQuery({
    queryKey: ["upcomingAppointments", limit],
    queryFn: async (): Promise<Appointment[]> => {
      const response = await api.get<ApiResponse<Appointment[]>>("/appointments/upcoming", {
        params: { limit },
      });
      return response.data.data;
    },
    staleTime: 1000 * 60 * 2,
  });
};

export const useAppointmentStats = () => {
  return useQuery({
    queryKey: ["appointmentStats"],
    queryFn: async (): Promise<AppointmentStats> => {
      const response = await api.get<ApiResponse<AppointmentStats>>("/appointments/stats");
      return response.data.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateAppointmentRequest): Promise<Appointment> => {
      const response = await api.post<ApiResponse<Appointment>>("/appointments", payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["upcomingAppointments"] });
      queryClient.invalidateQueries({ queryKey: ["appointmentStats"] });
    },
  });
};

export const useUpdateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateAppointmentRequest;
    }): Promise<Appointment> => {
      const response = await api.put<ApiResponse<Appointment>>(`/appointments/${id}`, data);
      return response.data.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["appointment", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["upcomingAppointments"] });
      queryClient.invalidateQueries({ queryKey: ["appointmentStats"] });
    },
  });
};

export const useCancelAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<Appointment> => {
      const response = await api.put<ApiResponse<Appointment>>(`/appointments/${id}/cancel`);
      return response.data.data;
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["appointment", id] });
      queryClient.invalidateQueries({ queryKey: ["upcomingAppointments"] });
      queryClient.invalidateQueries({ queryKey: ["appointmentStats"] });
    },
  });
};

export const useMarkNoShow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<Appointment> => {
      const response = await api.put<ApiResponse<Appointment>>(`/appointments/${id}/no-show`);
      return response.data.data;
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["appointment", id] });
      queryClient.invalidateQueries({ queryKey: ["upcomingAppointments"] });
      queryClient.invalidateQueries({ queryKey: ["appointmentStats"] });
    },
  });
};
