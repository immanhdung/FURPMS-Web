import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ClipboardList, Plus, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { useChangeRequestsByProposalQuery } from "@/hooks/useChangeRequests";
import { CreateChangeRequestSheet } from "@/features/pi/proposals/CreateChangeRequestSheet";
import { formatDateTime } from "@/utils/format";
import { CHANGE_REQUEST_TYPE_LABELS, type ChangeRequest } from "@/types/change-request";

interface ChangeRequestsPanelProps {
  proposalId: string;
  editable?: boolean;
}

function StatusIcon({ status }: { status: ChangeRequest["status"] }) {
  if (status === "Approved") return <CheckCircle className="size-4 text-green-500" />;
  if (status === "Rejected") return <XCircle className="size-4 text-destructive" />;
  return <Clock className="size-4 text-amber-500" />;
}

function StatusBadgeLocal({ status }: { status: ChangeRequest["status"] }) {
  const variant =
    status === "Approved" ? "default" : status === "Rejected" ? "destructive" : "secondary";
  return <Badge variant={variant}>{status}</Badge>;
}

export function ChangeRequestsPanel({ proposalId, editable = false }: ChangeRequestsPanelProps) {
  const { t } = useTranslation();
  const [createOpen, setCreateOpen] = useState(false);
  const { data, isLoading } = useChangeRequestsByProposalQuery(proposalId);

  return (
    <div className="rounded-xl border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-5">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ClipboardList className="size-4.5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">{t("changeRequest.panelTitle")}</h2>
            <p className="text-sm text-muted-foreground">{t("changeRequest.panelDesc")}</p>
          </div>
        </div>
        {editable && (
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus />
            {t("changeRequest.createBtn")}
          </Button>
        )}
      </div>

      {/* List */}
      <div className="p-5">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : !data || data.length === 0 ? (
          <EmptyState
            title={t("changeRequest.emptyTitle")}
            description={t("changeRequest.emptyDesc")}
          />
        ) : (
          <ul className="space-y-3">
            {data.map((cr) => (
              <li
                key={cr.id}
                className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 p-4"
              >
                <StatusIcon status={cr.status} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {CHANGE_REQUEST_TYPE_LABELS[cr.type]}
                    </span>
                    <StatusBadgeLocal status={cr.status} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{cr.description}</p>
                  {cr.adminNote && (
                    <p className="mt-1 text-xs italic text-muted-foreground">
                      <span className="font-medium">{t("changeRequest.adminNote")}:</span> {cr.adminNote}
                    </p>
                  )}
                  <p className="mt-1.5 text-xs text-muted-foreground">{formatDateTime(cr.createdAt)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {editable && (
        <CreateChangeRequestSheet
          proposalId={proposalId}
          open={createOpen}
          onOpenChange={setCreateOpen}
        />
      )}
    </div>
  );
}
