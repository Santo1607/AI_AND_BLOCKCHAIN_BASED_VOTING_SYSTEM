import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Citizen } from "@shared/schema";

interface CitizenFilters {
  search?: string;
  district?: string;
  gender?: string;
}

export function useCitizens(filters: CitizenFilters = {}) {
  const queryParams = new URLSearchParams();
  if (filters.search) queryParams.append("search", filters.search);
  if (filters.district && filters.district !== "all") queryParams.append("district", filters.district);
  if (filters.gender && filters.gender !== "all") queryParams.append("gender", filters.gender);

  const { data: citizens, isLoading, error } = useQuery<Citizen[]>({
    queryKey: ["/api/citizens", filters],
    queryFn: async () => {
      const response = await fetch(`/api/citizens?${queryParams.toString()}`, {
        credentials: "include"
      });
      if (!response.ok) {
        throw new Error("Failed to fetch citizens");
      }
      return response.json();
    }
  });

  const createCitizen = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/citizens", {
        method: "POST",
        body: formData,
        credentials: "include"
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create citizen");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/citizens"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    }
  });

  const updateCitizen = useMutation({
    mutationFn: async ({ id, formData }: { id: number; formData: FormData }) => {
      const response = await fetch(`/api/citizens/${id}`, {
        method: "PUT",
        body: formData,
        credentials: "include"
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update citizen");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/citizens"] });
    }
  });

  const deleteCitizen = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/citizens/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/citizens"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    }
  });

  return {
    citizens,
    isLoading,
    error,
    createCitizen,
    updateCitizen,
    deleteCitizen
  };
}
