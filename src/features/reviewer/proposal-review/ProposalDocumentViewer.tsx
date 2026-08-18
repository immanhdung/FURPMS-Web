import { useCallback } from "react";
import { DocumentViewer } from "@/components/shared/DocumentViewer";
import { useProposalDocumentsQuery } from "@/hooks/useProposalDocuments";
import { proposalDocumentService } from "@/services/api/proposal-document.service";

/**
 * Tài liệu đề cương cho vòng XÉT DUYỆT — phần xem file nay nằm ở `DocumentViewer` dùng chung,
 * ở đây chỉ nối nguồn dữ liệu.
 */
export function ProposalDocumentViewer({ proposalId }: { proposalId: string }) {
  const { data: documents, isLoading } = useProposalDocumentsQuery(proposalId);

  // `useCallback` là BẮT BUỘC: `DocumentViewer` để `fetchBlob` trong deps của effect tải file,
  // truyền hàm mới mỗi lần render là tải lại file vô tận.
  const fetchBlob = useCallback(
    (documentId: string) => proposalDocumentService.downloadBlob(proposalId, documentId),
    [proposalId]
  );

  return <DocumentViewer documents={documents} fetchBlob={fetchBlob} isLoading={isLoading} />;
}
