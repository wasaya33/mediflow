import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  ApiResponse,
  ApiPaginatedResponse,
  Provider,
  ProviderQuery,
  CreateProviderRequest,
  UpdateProviderRequest,
  ProviderStats,
} from "@/types";

export const useProviders = (query: ProviderQuery = {}) => {
  return useQuery({
    queryKey: ["providers", query],
    queryFn: async (): Promise<{ data: Provider[]; meta: ApiPaginatedResponse<Provider>["meta"] }> => {
      const response = await api.get<ApiPaginatedResponse<Provider>>("/providers", {
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

export const useProvider = (id: string | null | undefined) => {
  return useQuery({
    queryKey: ["provider", id],
    queryFn: async (): Promise<Provider> => {
      if (!id) throw new Error("Provider ID is required");
      const response = await api.get<ApiResponse<Provider>>(`/providers/${id}`);
      return response.data.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });
};

export const useProviderStats = () => {
  return useQuery({
    queryKey: ["providerStats"],
    queryFn: async (): Promise<ProviderStats> => {
      const response = await api.get<ApiResponse<ProviderStats>>("/providers/stats");
      return response.data.data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateProvider = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateProviderRequest): Promise<Provider> => {
      const response = await api.post<ApiResponse<Provider>>("/providers", payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["providers"] });
      queryClient.invalidateQueries({ queryKey: ["providerStats"] });
    },
  });
};

export const useUpdateProvider = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateProviderRequest;
    }): Promise<Provider> => {
      const response = await api.put<ApiResponse<Provider>>(`/providers/${id}`, data);
      return response.data.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["providers"] });
      queryClient.invalidateQueries({ queryKey: ["provider", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["providerStats"] });
    },
  });
};

export const useDeactivateProvider = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<Provider> => {
      const response = await api.put<ApiResponse<Provider>>(`/providers/${id}/deactivate`);
      return response.data.data;
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["providers"] });
      queryClient.invalidateQueries({ queryKey: ["provider", id] });
      queryClient.invalidateQueries({ queryKey: ["providerStats"] });
    },
  });
};
