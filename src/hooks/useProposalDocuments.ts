import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { proposalDocumentService } from "@/services/api/proposal-document.service";
import { queryKeys } from "@/services/queryKeys";
import type { ApiError } from "@/types/common";

export function useProposalDocumentsQuery(proposalId: string | null) {
  return useQuery({
    queryKey: queryKeys.proposalDocuments.list(proposalId ?? ""),
    queryFn: () => proposalDocumentService.list(proposalId as string),
    enabled: Boolean(proposalId),
  });
}

export function useUploadProposalDocumentMutation(proposalId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, documentType }: { file: File; documentType?: string }) =>
      proposalDocumentService.upload(proposalId, file, documentType),
    onSuccess: () => {
      toast.success("File uploaded.");
      queryClient.invalidateQueries({ queryKey: queryKeys.proposalDocuments.list(proposalId) });
    },
    // BE trả 400 kèm lý do rõ ràng (quá lớn / sai định dạng) — hiện nguyên văn cho PI biết đường sửa.
    onError: (error: ApiError) => toast.error(error.message || "Unable to upload the file."),
  });
}

export function useDeleteProposalDocumentMutation(proposalId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (documentId: string) => proposalDocumentService.remove(proposalId, documentId),
    onSuccess: () => {
      toast.success("File removed.");
      queryClient.invalidateQueries({ queryKey: queryKeys.proposalDocuments.list(proposalId) });
    },
    onError: (error: ApiError) => toast.error(error.message || "Unable to remove the file."),
  });
}
