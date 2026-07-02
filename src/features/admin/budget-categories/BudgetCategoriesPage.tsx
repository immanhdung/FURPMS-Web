import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/tables/DataTable";
import { ErrorState } from "@/components/shared/ErrorState";
import { ToggleActiveDialog } from "@/components/shared/ToggleActiveDialog";
import { useBudgetCategoriesQuery, useUpdateBudgetCategoryMutation } from "@/hooks/useBudgetCategories";
import { getBudgetCategoryColumns } from "@/features/admin/budget-categories/columns";
import { BudgetCategoryFormSheet } from "@/features/admin/budget-categories/BudgetCategoryFormSheet";
import type { BudgetCategory } from "@/types/budget-category";

export function BudgetCategoriesPage() {
  const { data, isLoading, isError, refetch, isRefetching } = useBudgetCategoriesQuery();
  const updateMutation = useUpdateBudgetCategoryMutation();

  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BudgetCategory | null>(null);
  const [togglingCategory, setTogglingCategory] = useState<BudgetCategory | null>(null);

  const columns = useMemo(
    () =>
      getBudgetCategoryColumns({
        onEdit: (category) => {
          setEditingCategory(category);
          setFormOpen(true);
        },
        onToggleActive: (category) => setTogglingCategory(category),
      }),
    []
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Budget Categories</h1>
          <p className="mt-1 text-sm text-muted-foreground">Expense categories used in proposal budgets.</p>
        </div>
        <Button
          onClick={() => {
            setEditingCategory(null);
            setFormOpen(true);
          }}
        >
          <Plus />
          New category
        </Button>
      </div>

      {isError ? (
        <ErrorState onRetry={() => refetch()} isRetrying={isRefetching} />
      ) : (
        <DataTable
          columns={columns}
          data={data ?? []}
          isLoading={isLoading}
          searchPlaceholder="Search budget categories..."
          exportFileName="budget-categories"
          emptyTitle="No budget categories found"
          emptyDescription="Create a category to organize proposal budgets."
        />
      )}

      <BudgetCategoryFormSheet open={formOpen} onOpenChange={setFormOpen} category={editingCategory} />

      <ToggleActiveDialog
        open={Boolean(togglingCategory)}
        onOpenChange={(open) => !open && setTogglingCategory(null)}
        isActive={Boolean(togglingCategory?.isActive)}
        entityName="category"
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
