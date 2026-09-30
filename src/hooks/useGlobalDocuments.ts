import { useQuery } from "@tanstack/react-query";
import { globalDocumentService } from "@/services/api/global-document.service";

export const globalDocumentKeys = {
  all: ["global-documents"] as const,
};

export function useGlobalDocumentsQuery() {
  return useQuery({
    queryKey: globalDocumentKeys.all,
    queryFn: globalDocumentService.list,
  });
}
