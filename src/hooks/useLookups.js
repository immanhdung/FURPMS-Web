import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/axios";
import { toast } from "sonner";

export const lookupKeys = {
  all: ["lookups"],
  lists: () => [...lookupKeys.all, "list"],
  list: (endpoint) => [...lookupKeys.lists(), endpoint],
};

/**
 * Factory Hook for Lookup Tables
 * @param {string} endpoint - API endpoint (e.g., "/budget-expense-categories")
 */
export function useLookup(endpoint) {
  const queryClient = useQueryClient();

  const useGetItems = () =>
    useQuery({
      queryKey: lookupKeys.list(endpoint),
      queryFn: async () => {
        const { data } = await api.get(endpoint);
        return data.data;
      },
    });

  const useCreateItem = () =>
    useMutation({
      mutationFn: async (payload) => {
        const { data } = await api.post(endpoint, payload);
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: lookupKeys.list(endpoint) });
        toast.success("Thêm mới thành công.");
      },
      onError: () => toast.error("Có lỗi xảy ra khi thêm mới."),
    });

  const useUpdateItem = () =>
    useMutation({
      mutationFn: async ({ id, payload }) => {
        const { data } = await api.put(`${endpoint}/${id}`, payload);
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: lookupKeys.list(endpoint) });
        toast.success("Cập nhật thành công.");
      },
      onError: () => toast.error("Có lỗi xảy ra khi cập nhật."),
    });

  const useToggleActive = () =>
    useMutation({
      mutationFn: async (id) => {
        const { data } = await api.patch(`${endpoint}/${id}/deactivate`);
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: lookupKeys.list(endpoint) });
        toast.success("Cập nhật trạng thái thành công.");
      },
      onError: (error) => {
        // Data Integrity Handling: 409 Conflict
        if (error.response?.status === 409) {
          toast.error("Không thể vô hiệu hóa vì danh mục này đang được sử dụng trong hệ thống.");
        } else {
          toast.error("Có lỗi xảy ra khi cập nhật trạng thái.");
        }
      },
    });

  return {
    useGetItems,
    useCreateItem,
    useUpdateItem,
    useToggleActive,
  };
}
