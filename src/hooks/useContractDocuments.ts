import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { contractDocumentService } from "@/services/api/contract-document.service";
import type { ApiError } from "@/types/common";

const key = (contractId: string) => ["contract-documents", contractId] as const;

export function useContractDocumentsQuery(contractId: string) {
  return useQuery({
    queryKey: key(contractId),
    queryFn: () => contractDocumentService.list(contractId),
    enabled: Boolean(contractId),
  });
}

export function useUploadContractDocMutation(contractId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => contractDocumentService.upload(contractId, file),
    onSuccess: () => {
      toast.success("Đã lưu bản hợp đồng đã ký.");
      queryClient.invalidateQueries({ queryKey: key(contractId) });
    },
    onError: (error: ApiError) => toast.error(error.message || "Không tải được file."),
  });
}

/** Mở file hợp đồng ở tab mới (tải blob kèm token rồi mở). */
export async function openContractDoc(contractId: string, documentId: string) {
  const blob = await contractDocumentService.downloadBlob(contractId, documentId);
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener");
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
