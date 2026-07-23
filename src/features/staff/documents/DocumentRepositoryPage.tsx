import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { ColumnDef } from "@tanstack/react-table";
import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/tables/DataTable";
import { ErrorState } from "@/components/shared/ErrorState";
import { useGlobalDocumentsQuery } from "@/hooks/useGlobalDocuments";
import { formatDateTime } from "@/utils/format";
import type { GlobalDocument } from "@/services/api/global-document.service";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentRepositoryPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch, isRefetching } = useGlobalDocumentsQuery();

  const documents = data?.items ?? [];

  const columns = useMemo<ColumnDef<GlobalDocument>[]>(
    () => [
      {
        id: "icon",
        header: "",
        size: 36,
        cell: () => (
          <div className="flex size-8 items-center justify-center rounded bg-primary/10 text-primary">
            <FileText className="size-4" />
          </div>
        ),
      },
      {
        accessorKey: "fileName",
        header: t("documents.fileName"),
        cell: ({ row }) => (
          <span className="max-w-xs truncate font-medium text-foreground">{row.original.fileName}</span>
        ),
      },
      {
        accessorKey: "documentType",
        header: t("documents.docType"),
        cell: ({ row }) =>
          row.original.documentType ? (
            <Badge variant="secondary">{row.original.documentType}</Badge>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        accessorKey: "proposalTitle",
        header: t("documents.proposalId"),
        cell: ({ row }) => (
          <span className="max-w-[180px] truncate text-sm text-muted-foreground">
            {row.original.proposalTitle || row.original.proposalId}
          </span>
        ),
      },
      {
        accessorKey: "fileSizeBytes",
        header: "Size",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">{formatBytes(row.original.fileSizeBytes)}</span>
        ),
      },
      {
        accessorKey: "uploadedAt",
        header: t("documents.uploadedAt"),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">{formatDateTime(row.original.uploadedAt)}</span>
        ),
      },
      {
        id: "actions",
        header: t("common.actions"),
        cell: ({ row }) => {
          const doc = row.original;
          const url = doc.downloadUrl;
          if (!url) return null;
          return (
            <Button
              size="sm"
              variant="ghost"
              asChild
            >
              <a href={url} target="_blank" rel="noopener noreferrer" download={doc.fileName}>
                <Download className="size-4" />
                {t("documents.downloadBtn")}
              </a>
            </Button>
          );
        },
      },
    ],
    [t]
  );

  if (isError) return <ErrorState onRetry={() => refetch()} isRetrying={isRefetching} />;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("documents.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("documents.subtitle")}</p>
      </div>

      <DataTable
        columns={columns}
        data={documents}
        isLoading={isLoading}
        searchPlaceholder={t("documents.searchPlaceholder")}
        exportFileName="documents"
        emptyTitle={t("documents.emptyTitle")}
        emptyDescription={t("documents.emptyDesc")}
      />
    </div>
  );
}
