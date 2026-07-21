import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/tables/DataTable";
import { ErrorState } from "@/components/shared/ErrorState";
import { ToggleActiveDialog } from "@/components/shared/ToggleActiveDialog";
import { useFinancialConfigsQuery, useUpdateFinancialConfigMutation } from "@/hooks/useFinancialConfigs";
import { getFinancialConfigColumns } from "@/features/admin/financial-configs/columns";
import { FinancialConfigFormSheet } from "@/features/admin/financial-configs/FinancialConfigFormSheet";
import type { FinancialConfig } from "@/types/financial-config";

export function FinancialConfigsPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch, isRefetching } = useFinancialConfigsQuery();
  const updateMutation = useUpdateFinancialConfigMutation();

  const [formOpen, setFormOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<FinancialConfig | null>(null);
  const [togglingConfig, setTogglingConfig] = useState<FinancialConfig | null>(null);

  const columns = useMemo(
    () =>
      getFinancialConfigColumns({
        t,
        onEdit: (config) => {
          setEditingConfig(config);
          setFormOpen(true);
        },
        onToggleActive: (config) => setTogglingConfig(config),
      }),
    [t]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("financialConfigs.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("financialConfigs.subtitle")}</p>
        </div>
        <Button
          onClick={() => {
            setEditingConfig(null);
            setFormOpen(true);
          }}
        >
          <Plus />
          {t("financialConfigs.newBtn")}
        </Button>
      </div>

      {isError ? (
        <ErrorState onRetry={() => refetch()} isRetrying={isRefetching} />
      ) : (
        <DataTable
          columns={columns}
          data={data ?? []}
          isLoading={isLoading}
          searchPlaceholder={t("financialConfigs.searchPlaceholder")}
          exportFileName="financial-configs"
          emptyTitle={t("financialConfigs.emptyTitle")}
          emptyDescription={t("financialConfigs.emptyDesc")}
        />
      )}

      <FinancialConfigFormSheet open={formOpen} onOpenChange={setFormOpen} config={editingConfig} />

      <ToggleActiveDialog
        open={Boolean(togglingConfig)}
        onOpenChange={(open) => !open && setTogglingConfig(null)}
        isActive={Boolean(togglingConfig?.isActive)}
        entityName={t("financialConfigs.entity")}
        itemLabel={togglingConfig?.code ?? ""}
        isLoading={updateMutation.isPending}
        onConfirm={() =>
          togglingConfig &&
          updateMutation.mutate(
            {
              id: togglingConfig.id,
              payload: { ...togglingConfig, description: togglingConfig.description ?? undefined, isActive: !togglingConfig.isActive },
            },
            { onSuccess: () => setTogglingConfig(null) }
          )
        }
      />
    </div>
  );
}
