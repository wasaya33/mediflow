import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  ApiResponse,
  ApiPaginatedResponse,
  Patient,
  PatientQuery,
  CreatePatientRequest,
  UpdatePatientRequest,
  PatientStats,
} from "@/types";

export const usePatients = (query: PatientQuery = {}) => {
  return useQuery({
    queryKey: ["patients", query],
    queryFn: async (): Promise<{ data: Patient[]; meta: ApiPaginatedResponse<Patient>["meta"] }> => {
      const response = await api.get<ApiPaginatedResponse<Patient>>("/patients", {
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

export const usePatient = (id: string | null | undefined) => {
  return useQuery({
    queryKey: ["patient", id],
    queryFn: async (): Promise<Patient> => {
      if (!id) throw new Error("Patient ID is required");
      const response = await api.get<ApiResponse<Patient>>(`/patients/${id}`);
      return response.data.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });
};

export const usePatientStats = () => {
  return useQuery({
    queryKey: ["patientStats"],
    queryFn: async (): Promise<PatientStats> => {
      const response = await api.get<ApiResponse<PatientStats>>("/patients/stats");
      return response.data.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useCreatePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreatePatientRequest): Promise<Patient> => {
      const response = await api.post<ApiResponse<Patient>>("/patients", payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["patientStats"] });
    },
  });
};

export const useUpdatePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdatePatientRequest;
    }): Promise<Patient> => {
      const response = await api.put<ApiResponse<Patient>>(`/patients/${id}`, payload);
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["patient", data.id] });
      queryClient.invalidateQueries({ queryKey: ["patientStats"] });
    },
  });
};

export const useDeactivatePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<Patient> => {
      const response = await api.put<ApiResponse<Patient>>(`/patients/${id}/deactivate`);
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["patient", data.id] });
      queryClient.invalidateQueries({ queryKey: ["patientStats"] });
    },
  });
};
