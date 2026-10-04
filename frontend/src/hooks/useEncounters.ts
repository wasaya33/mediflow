import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  ApiResponse,
  ApiPaginatedResponse,
  Encounter,
  EncounterQuery,
  CreateEncounterRequest,
  UpdateEncounterRequest,
  EncounterStats,
} from "@/types";

export const useEncounters = (query: EncounterQuery = {}) => {
  return useQuery({
    queryKey: ["encounters", query],
    queryFn: async (): Promise<{ data: Encounter[]; meta: ApiPaginatedResponse<Encounter>["meta"] }> => {
      const response = await api.get<ApiPaginatedResponse<Encounter>>("/encounters", {
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

export const useEncounter = (id: string | null | undefined) => {
  return useQuery({
    queryKey: ["encounter", id],
    queryFn: async (): Promise<Encounter> => {
      if (!id) throw new Error("Encounter ID is required");
      const response = await api.get<ApiResponse<Encounter>>(`/encounters/${id}`);
      return response.data.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });
};

export const usePatientEncounters = (patientId: string | null | undefined) => {
  return useQuery({
    queryKey: ["patientEncounters", patientId],
    queryFn: async (): Promise<Encounter[]> => {
      if (!patientId) return [];
      const response = await api.get<ApiResponse<Encounter[]>>(`/encounters/patient/${patientId}`);
      return response.data.data;
    },
    enabled: !!patientId,
    staleTime: 1000 * 60 * 2,
  });
};

export const useEncounterStats = () => {
  return useQuery({
    queryKey: ["encounterStats"],
    queryFn: async (): Promise<EncounterStats> => {
      const response = await api.get<ApiResponse<EncounterStats>>("/encounters/stats");
      return response.data.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateEncounter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateEncounterRequest): Promise<Encounter> => {
      const response = await api.post<ApiResponse<Encounter>>("/encounters", payload);
      return response.data.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["encounters"] });
      queryClient.invalidateQueries({ queryKey: ["encounterStats"] });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      if (variables.patientId) {
        queryClient.invalidateQueries({ queryKey: ["patientEncounters", variables.patientId] });
      }
    },
  });
};

export const useUpdateEncounter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateEncounterRequest;
    }): Promise<Encounter> => {
      const response = await api.put<ApiResponse<Encounter>>(`/encounters/${id}`, data);
      return response.data.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["encounters"] });
      queryClient.invalidateQueries({ queryKey: ["encounter", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["encounterStats"] });
    },
  });
};
