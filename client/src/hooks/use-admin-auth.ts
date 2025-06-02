import { useQuery } from "@tanstack/react-query";

interface AdminUser {
  id: number;
  name: string;
  username: string;
}

export function useAdminAuth() {
  const { data: admin, isLoading, error } = useQuery<AdminUser>({
    queryKey: ["/api/admin/me"],
    retry: false,
    refetchOnWindowFocus: false,
  });

  return {
    admin,
    isLoading,
    isAuthenticated: !!admin,
    error
  };
}
