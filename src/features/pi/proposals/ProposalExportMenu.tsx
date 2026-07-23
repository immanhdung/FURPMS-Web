import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Download, FileText, Table2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useExportScientificMutation, useExportBudgetMutation } from "@/hooks/useProposals";

interface ProposalExportMenuProps {
  proposalId: string;
  titleSlug: string;
}

/** Produces a URL-safe filename slug from the proposal title. */
export function makeSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 40);
}

export function ProposalExportMenu({ proposalId, titleSlug }: ProposalExportMenuProps) {
  const { t } = useTranslation();
  const exportScientific = useExportScientificMutation();
  const exportBudget = useExportBudgetMutation();
  const isExporting = exportScientific.isPending || exportBudget.isPending;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isExporting}>
          {isExporting ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Download />
          )}
          {t("proposal.export")}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>{t("proposal.exportTitle")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={exportScientific.isPending}
          onClick={() => exportScientific.mutate({ id: proposalId, titleSlug })}
        >
          <FileText className="size-4 text-blue-500" />
          {t("proposal.exportScientific")}
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={exportBudget.isPending}
          onClick={() => exportBudget.mutate({ id: proposalId, titleSlug })}
        >
          <Table2 className="size-4 text-green-500" />
          {t("proposal.exportBudget")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
