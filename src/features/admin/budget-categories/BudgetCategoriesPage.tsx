import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";
import { Plus, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/tables/DataTable";
import { ErrorState } from "@/components/shared/ErrorState";
import { ToggleActiveDialog } from "@/components/shared/ToggleActiveDialog";
import { useBudgetCategoriesQuery, useUpdateBudgetCategoryMutation } from "@/hooks/useBudgetCategories";
import { getBudgetCategoryColumns } from "@/features/admin/budget-categories/columns";
import { BudgetCategoryFormSheet } from "@/features/admin/budget-categories/BudgetCategoryFormSheet";
import type { BudgetCategory } from "@/types/budget-category";

export function BudgetCategoriesPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch, isRefetching } = useBudgetCategoriesQuery();
  const updateMutation = useUpdateBudgetCategoryMutation();

  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BudgetCategory | null>(null);
  const [togglingCategory, setTogglingCategory] = useState<BudgetCategory | null>(null);

  const columns = useMemo(
    () =>
      getBudgetCategoryColumns({
        t,
        onEdit: (category) => {
          setEditingCategory(category);
          setFormOpen(true);
        },
        onToggleActive: (category) => setTogglingCategory(category),
      }),
    [t]
  );

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-primary/15 to-brand-secondary/10 text-primary">
            <Wallet className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("budgetCategories.title")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t("budgetCategories.subtitle")}</p>
          </div>
        </div>
        <Button
          onClick={() => {
            setEditingCategory(null);
            setFormOpen(true);
          }}
        >
          <Plus />
          {t("budgetCategories.newBtn")}
        </Button>
      </motion.div>

      {isError ? (
        <ErrorState onRetry={() => refetch()} isRetrying={isRefetching} />
      ) : (
        <DataTable
          columns={columns}
          data={data ?? []}
          isLoading={isLoading}
          searchPlaceholder={t("budgetCategories.searchPlaceholder")}
          exportFileName="budget-categories"
          emptyTitle={t("budgetCategories.emptyTitle")}
          emptyDescription={t("budgetCategories.emptyDesc")}
        />
      )}

      <BudgetCategoryFormSheet open={formOpen} onOpenChange={setFormOpen} category={editingCategory} />

      <ToggleActiveDialog
        open={Boolean(togglingCategory)}
        onOpenChange={(open) => !open && setTogglingCategory(null)}
        isActive={Boolean(togglingCategory?.isActive)}
        entityName={t("budgetCategories.entity")}
        itemLabel={togglingCategory?.name ?? ""}
        isLoading={updateMutation.isPending}
        onConfirm={() =>
          togglingCategory &&
          updateMutation.mutate(
            { id: togglingCategory.id, payload: { ...togglingCategory, isActive: !togglingCategory.isActive } },
            { onSuccess: () => setTogglingCategory(null) }
          )
        }
      />
    </div>
  );
}
