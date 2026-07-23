import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Package, Plus, Trash2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCreateExpectedProductMutation,
  useDeleteExpectedProductMutation,
  useExpectedProductsQuery,
} from "@/hooks/useExpectedProducts";

/**
 * Sản phẩm PI cam kết giao nộp. Khai ở đây (trước khi nộp đề cương) thì sau này
 * tạo hợp đồng mới có cái để nghiệm thu — và đề tài cấp kinh phí theo mốc (PARTIAL)
 * mới sinh được lịch giải ngân.
 */
export function ExpectedProductsCard({
  proposalId,
  editable,
  fundingMethod,
}: {
  proposalId: string;
  editable: boolean;
  fundingMethod?: string | null;
}) {
  const { t } = useTranslation();
  const { data: products, isLoading } = useExpectedProductsQuery(proposalId);
  const createMutation = useCreateExpectedProductMutation(proposalId);
  const deleteMutation = useDeleteExpectedProductMutation(proposalId);

  const [productName, setProductName] = useState("");
  const [requirements, setRequirements] = useState("");

  const isEmpty = !isLoading && (!products || products.length === 0);
  const isPartial = fundingMethod?.toUpperCase() === "PARTIAL";

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("proposal.expectedProducts")}</CardTitle>
        <CardDescription>
{t("proposal.expectedProductsDesc")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {isEmpty && isPartial && (
          <div className="flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/5 p-3">
            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" />
            <p className="text-xs text-foreground">
              {t("proposal.partialWarning")}
            </p>
          </div>
        )}

        {isLoading ? (
          <Skeleton className="h-20 w-full rounded-lg" />
        ) : isEmpty ? (
          <div className="flex items-center gap-2 rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
            <Package className="size-4" />
            {t("proposal.noProducts")}
          </div>
        ) : (
          <ul className="space-y-2">
            {products?.map((p) => (
              <li key={p.id} className="flex items-start justify-between gap-2 rounded-lg border border-border p-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{p.productName}</p>
                  {p.scientificRequirements && (
                    <p className="mt-0.5 text-xs text-muted-foreground">{p.scientificRequirements}</p>
                  )}
                </div>
                {editable && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    aria-label={`Remove ${p.productName}`}
                    disabled={deleteMutation.isPending}
                    onClick={() => deleteMutation.mutate(p.id)}
                  >
                    <Trash2 />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}

        {editable && (
          <div className="space-y-2 rounded-lg border border-dashed border-border p-3">
            <Input
              placeholder={t("proposal.productName")}
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
            <Textarea
              rows={2}
              placeholder={t("proposal.productRequirements")}
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
            />
            <div className="flex justify-end">
              <Button
                type="button"
                size="sm"
                disabled={!productName.trim() || createMutation.isPending}
                onClick={() =>
                  createMutation.mutate(
                    {
                      productName: productName.trim(),
                      scientificRequirements: requirements.trim() || undefined,
                      sequence: (products?.length ?? 0) + 1,
                    },
                    {
                      onSuccess: () => {
                        setProductName("");
                        setRequirements("");
                      },
                    }
                  )
                }
              >
                <Plus />
                {t("proposal.addProduct")}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
