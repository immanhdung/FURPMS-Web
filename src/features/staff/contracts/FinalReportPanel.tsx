import { useState } from "react";
import { Archive, CheckCircle2, ExternalLink, FileCheck2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  useAcceptFinalReportMutation,
  useArchiveFinalReportMutation,
  useFinalReportQuery,
  useRequestFinalReportRevisionMutation,
} from "@/hooks/useFinalReport";
import { formatDateTime } from "@/utils/format";

export function FinalReportPanel({ contractId }: { contractId: string }) {
  const { data: finalReport, isLoading } = useFinalReportQuery(contractId);
  const acceptMutation = useAcceptFinalReportMutation(contractId);
  const archiveMutation = useArchiveFinalReportMutation(contractId);
  const requestRevisionMutation = useRequestFinalReportRevisionMutation(contractId);

  const [revisionNotes, setRevisionNotes] = useState("");
  const [showRevisionForm, setShowRevisionForm] = useState(false);

  if (isLoading) return <Skeleton className="h-32 w-full rounded-lg" />;

  if (!finalReport) {
    return (
      <EmptyState
        icon={FileCheck2}
        title="No final report submitted yet"
        description="The PI hasn't submitted the summary report for this contract."
        className="min-h-32 border-none p-4"
      />
    );
  }

  return (
    <div className="space-y-3 rounded-lg border border-border p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-foreground">Final report</p>
        {finalReport.status && <StatusBadge status={finalReport.status} />}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium text-muted-foreground">Report file</p>
          {finalReport.reportFileUrl ? (
            <a
              href={finalReport.reportFileUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-0.5 flex items-center gap-1 text-sm text-primary hover:underline"
            >
              <ExternalLink className="size-3.5" />
              Open report
            </a>
          ) : (
            <p className="mt-0.5 text-sm text-foreground">-</p>
          )}
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">Summary file</p>
          {finalReport.summaryFileUrl ? (
            <a
              href={finalReport.summaryFileUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-0.5 flex items-center gap-1 text-sm text-primary hover:underline"
            >
              <ExternalLink className="size-3.5" />
              Open summary
            </a>
          ) : (
            <p className="mt-0.5 text-sm text-foreground">-</p>
          )}
        </div>
      </div>

      {finalReport.submittedAt && (
        <p className="text-xs text-muted-foreground">Submitted {formatDateTime(finalReport.submittedAt)}</p>
      )}
      {finalReport.revisionNotes && (
        <p className="text-xs text-warning">Revision requested: {finalReport.revisionNotes}</p>
      )}

      <div className="flex flex-wrap gap-2 pt-1">
        <Button size="sm" disabled={acceptMutation.isPending} onClick={() => acceptMutation.mutate(finalReport.id)}>
          <CheckCircle2 />
          Accept
        </Button>
        <Button variant="outline" size="sm" onClick={() => setShowRevisionForm((v) => !v)}>
          <RotateCcw />
          Request revision
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={archiveMutation.isPending}
          onClick={() => archiveMutation.mutate(finalReport.id)}
        >
          <Archive />
          Archive
        </Button>
      </div>

      {showRevisionForm && (
        <div className="space-y-2 rounded-lg border border-dashed border-border p-3">
          <Textarea
            rows={2}
            placeholder="What needs to be revised?"
            value={revisionNotes}
            onChange={(e) => setRevisionNotes(e.target.value)}
          />
          <Button
            size="sm"
            disabled={requestRevisionMutation.isPending}
            onClick={() =>
              requestRevisionMutation.mutate(
                { id: finalReport.id, payload: { revisionNotes: revisionNotes || undefined } },
                { onSuccess: () => { setRevisionNotes(""); setShowRevisionForm(false); } }
              )
            }
          >
            Send revision request
          </Button>
        </div>
      )}
    </div>
  );
}
