import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  ApiResponse,
  InsurancePolicy,
  CreateInsuranceRequest,
  UpdateInsuranceRequest,
} from "@/types";

export const useInsurances = (patientId: string | null | undefined) => {
  return useQuery({
    queryKey: ["insurances", patientId],
    queryFn: async (): Promise<InsurancePolicy[]> => {
      if (!patientId) return [];
      const response = await api.get<ApiResponse<InsurancePolicy[]>>(
        `/patients/${patientId}/insurances`
      );
      return response.data.data;
    },
    enabled: !!patientId,
    staleTime: 1000 * 60 * 2,
  });
};

export const useCreateInsurance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateInsuranceRequest): Promise<InsurancePolicy> => {
      const response = await api.post<ApiResponse<InsurancePolicy>>(
        `/patients/${payload.patientId}/insurances`,
        payload
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["insurances", data.patientId] });
      queryClient.invalidateQueries({ queryKey: ["patient", data.patientId] });
    },
  });
};

export const useUpdateInsurance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      patientId: string;
      payload: UpdateInsuranceRequest;
    }): Promise<InsurancePolicy> => {
      const response = await api.put<ApiResponse<InsurancePolicy>>(
        `/insurance/${id}`,
        payload
      );
      return response.data.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["insurances", variables.patientId] });
      queryClient.invalidateQueries({ queryKey: ["patient", variables.patientId] });
    },
  });
};

export const useDeactivateInsurance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
    }: {
      id: string;
      patientId: string;
    }): Promise<InsurancePolicy> => {
      const response = await api.put<ApiResponse<InsurancePolicy>>(
        `/insurance/${id}/deactivate`
      );
      return response.data.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["insurances", variables.patientId] });
      queryClient.invalidateQueries({ queryKey: ["patient", variables.patientId] });
    },
  });
};
