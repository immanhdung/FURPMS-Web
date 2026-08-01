import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import i18n from "@/i18n";
import { disbursementEvidenceService } from "@/services/api/disbursement-evidence.service";
import type { ApiError } from "@/types/common";

const key = (disbursementId: number) => ["disbursement-evidence", disbursementId] as const;

export function useDisbursementEvidenceQuery(disbursementId: number) {
  return useQuery({
    queryKey: key(disbursementId),
    queryFn: () => disbursementEvidenceService.list(disbursementId),
  });
}

export function useUploadDisbursementEvidenceMutation(disbursementId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => disbursementEvidenceService.upload(disbursementId, file),
    onSuccess: () => {
      toast.success(i18n.t("toast.evidenceSaved"));
      queryClient.invalidateQueries({ queryKey: key(disbursementId) });
    },
    onError: (error: ApiError) => toast.error(error.message || i18n.t("toast.uploadFailed")),
  });
}

/** Mở file minh chứng ở tab mới (tải blob kèm token rồi mở object URL). */
export async function openDisbursementEvidence(disbursementId: number, documentId: string) {
  const blob = await disbursementEvidenceService.downloadBlob(disbursementId, documentId);
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener");
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
