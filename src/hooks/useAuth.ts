import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate, type Location } from "react-router-dom";
import { toast } from "sonner";
import { authService } from "@/services/api/auth.service";
import { queryKeys } from "@/services/queryKeys";
import { useAuthStore } from "@/store/auth.store";
import { tokenStorage } from "@/utils/storage";
import { ROUTES } from "@/constants/routes";
import type { ApiError } from "@/types/common";
import type { ChangePasswordRequest } from "@/types/auth";
import type { LoginFormValues } from "@/features/auth/schemas/login.schema";

export function useCurrentUserQuery() {
  const setUser = useAuthStore((state) => state.setUser);
  const hasToken = Boolean(tokenStorage.get());

  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: async () => {
      const user = await authService.getCurrentUser();
      setUser(user);
      return user;
    },
    enabled: hasToken,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

/** Resolves auth state once on app load: validates the stored token (if any) before rendering routes. */
export function useBootstrapAuth() {
  const setInitializing = useAuthStore((state) => state.setInitializing);
  const hasToken = Boolean(tokenStorage.get());
  const query = useCurrentUserQuery();

  useEffect(() => {
    if (!hasToken || query.isFetched) {
      setInitializing(false);
    }
  }, [hasToken, query.isFetched, setInitializing]);
}

export function useLoginMutation() {
  const navigate = useNavigate();
  const location = useLocation();
  const setUser = useAuthStore((state) => state.setUser);
  const queryClient = useQueryClient();

  const redirectTo = (location.state as { from?: Location } | null)?.from;
  const redirectPath = redirectTo ? `${redirectTo.pathname}${redirectTo.search}` : ROUTES.DASHBOARD;

  return useMutation({
    mutationFn: (payload: LoginFormValues) => authService.login({ email: payload.email, password: payload.password }),
    onSuccess: (data, variables) => {
      tokenStorage.set(data.accessToken, variables.rememberMe);
      setUser(data.user);
      queryClient.setQueryData(queryKeys.auth.me(), data.user);
      toast.success(`Welcome back, ${data.user.fullName}`);
      navigate(redirectPath, { replace: true });
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Unable to sign in. Please check your credentials.");
    },
  });
}

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: (payload: ChangePasswordRequest) => authService.changePassword(payload),
    onSuccess: () => {
      toast.success("Your password has been changed successfully.");
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Unable to change password. Please try again.");
    },
  });
}

export function useLogout() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();

  return () => {
    tokenStorage.clear();
    logout();
    queryClient.clear();
    navigate(ROUTES.LOGIN, { replace: true });
  };
}
