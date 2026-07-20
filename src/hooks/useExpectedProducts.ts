import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { expectedProductService } from "@/services/api/expected-product.service";
import { queryKeys } from "@/services/queryKeys";
import type { ApiError } from "@/types/common";
import type { ExpectedProductPayload } from "@/types/expected-product";

export function useExpectedProductsQuery(proposalId: string | null) {
  return useQuery({
    queryKey: queryKeys.expectedProducts.list(proposalId ?? ""),
    queryFn: () => expectedProductService.list(proposalId as string),
    enabled: Boolean(proposalId),
  });
}

function useProductAction<TArgs>(
  proposalId: string,
  action: (args: TArgs) => Promise<unknown>,
  successMessage: string,
  errorMessage: string
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: action,
    onSuccess: () => {
      toast.success(successMessage);
      queryClient.invalidateQueries({ queryKey: queryKeys.expectedProducts.list(proposalId) });
    },
    onError: (error: ApiError) => toast.error(error.message || errorMessage),
  });
}

export function useCreateExpectedProductMutation(proposalId: string) {
  return useProductAction<ExpectedProductPayload>(
    proposalId,
    (payload) => expectedProductService.create(proposalId, payload),
    "Product added.",
    "Unable to add the product."
  );
}

export function useDeleteExpectedProductMutation(proposalId: string) {
  return useProductAction<number>(
    proposalId,
    (productId) => expectedProductService.remove(proposalId, productId),
    "Product removed.",
    "Unable to remove the product."
  );
}
