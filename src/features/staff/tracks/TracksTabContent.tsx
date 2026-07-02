import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/tables/DataTable";
import { ErrorState } from "@/components/shared/ErrorState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useDeactivateTrackMutation, useTracksQuery } from "@/hooks/useTracks";
import { useUsersQuery } from "@/hooks/useUsers";
import { getTrackColumns } from "@/features/staff/tracks/columns";
import { TrackFormSheet } from "@/features/staff/tracks/TrackFormSheet";
import { AssignTrackOwnerDialog } from "@/features/staff/tracks/AssignTrackOwnerDialog";
import type { Track } from "@/types/track";

export function TracksTabContent() {
  const { data, isLoading, isError, refetch, isRefetching } = useTracksQuery();
  const { data: users } = useUsersQuery();
  const deactivateMutation = useDeactivateTrackMutation();

  const [formOpen, setFormOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
  const [assigningTrack, setAssigningTrack] = useState<Track | null>(null);
  const [deactivatingTrack, setDeactivatingTrack] = useState<Track | null>(null);

  const ownerNames = useMemo(() => Object.fromEntries((users ?? []).map((u) => [u.id, u.fullName])), [users]);

  const columns = getTrackColumns({
    ownerNames,
    onEdit: (track) => {
      setEditingTrack(track);
      setFormOpen(true);
    },
    onAssignOwner: (track) => setAssigningTrack(track),
    onDeactivate: (track) => setDeactivatingTrack(track),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Research fields (e.g. IT, AI, Business) used to categorize proposals within a cycle.
        </p>
        <Button
          onClick={() => {
            setEditingTrack(null);
            setFormOpen(true);
          }}
        >
          <Plus />
          New field
        </Button>
      </div>

      {isError ? (
        <ErrorState onRetry={() => refetch()} isRetrying={isRefetching} />
      ) : (
        <DataTable
          columns={columns}
          data={data ?? []}
          isLoading={isLoading}
          searchPlaceholder="Search research fields..."
          exportFileName="research-fields"
          emptyTitle="No research fields found"
          emptyDescription="Create a field such as IT, AI, or Business to categorize proposals."
        />
      )}

      <TrackFormSheet open={formOpen} onOpenChange={setFormOpen} track={editingTrack} />
      <AssignTrackOwnerDialog open={Boolean(assigningTrack)} onOpenChange={(open) => !open && setAssigningTrack(null)} track={assigningTrack} />

      <ConfirmDialog
        open={Boolean(deactivatingTrack)}
        onOpenChange={(open) => !open && setDeactivatingTrack(null)}
        title="Deactivate research field"
        description={`Are you sure you want to deactivate "${deactivatingTrack?.name}"?`}
        variant="destructive"
        confirmLabel="Deactivate"
        isLoading={deactivateMutation.isPending}
        onConfirm={() =>
          deactivatingTrack &&
          deactivateMutation.mutate(deactivatingTrack.id, { onSuccess: () => setDeactivatingTrack(null) })
        }
      />
    </div>
  );
}
