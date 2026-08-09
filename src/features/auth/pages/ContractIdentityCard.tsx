import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { Landmark, Save, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useContractIdentityQuery, useUpdateContractIdentityMutation } from "@/hooks/useContractIdentity";

// Số tài khoản/CCCD người dùng hay gõ theo nhóm ("1900 1234 5678") — máy chủ tự bỏ khoảng trắng,
// nên ở đây chỉ chặn ký tự lạ thay vì bắt gõ liền.
const digitsOnly = (value: string) => value.replace(/[\s.-]/g, "");

const schema = z.object({
  bankAccountNumber: z
    .string()
    .optional()
    .refine((v) => !v || /^\d+$/.test(digitsOnly(v)), "Số tài khoản chỉ gồm chữ số"),
  bankName: z.string().optional(),
  nationalId: z
    .string()
    .optional()
    .refine(
      (v) => !v || [9, 12].includes(digitsOnly(v).length),
      "Số CCCD gồm 12 chữ số (hoặc 9 chữ số nếu là CMND cũ)"
    )
    .refine((v) => !v || /^\d+$/.test(digitsOnly(v)), "Số CCCD chỉ gồm chữ số"),
  nationalIdIssuedDate: z.string().optional(),
  nationalIdIssuedPlace: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

/**
 * C3 — chủ nhiệm đề tài TỰ KHAI số tài khoản và CCCD để hệ thống điền vào hợp đồng (BM05 phần
 * "BÊN B"). Căn cứ: BM05 Điều 7.2 — ủy quyền cho Trường khai báo thông tin định danh để cấp
 * chứng thư số.
 *
 * Ba điều cố ý:
 * 1. Không có màn nào cho Staff gõ hộ — endpoint chỉ có đường "/me".
 * 2. Đọc ra luôn là bản đã che; muốn đổi thì gõ lại cả số, không sửa từng ký tự trên số cũ.
 * 3. Tuỳ chọn — bỏ trống thì hợp đồng in ra để chấm lửng như bản giấy, KHÔNG chặn lập hợp đồng.
 */
export function ContractIdentityCard() {
  const { t } = useTranslation();
  const { data, isLoading } = useContractIdentityQuery();
  const mutation = useUpdateContractIdentityMutation();
  const [editing, setEditing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (data) {
      reset({
        // Cố ý KHÔNG đổ số đã che vào ô nhập: sửa trên "****7890" sẽ lưu nhầm dấu sao thành số thật.
        bankAccountNumber: "",
        bankName: data.bankName ?? "",
        nationalId: "",
        nationalIdIssuedDate: data.nationalIdIssuedDate ?? "",
        nationalIdIssuedPlace: data.nationalIdIssuedPlace ?? "",
      });
    }
  }, [data, reset]);

  const onSubmit = (values: FormValues) => {
    mutation.mutate(
      {
        // Bỏ trống = giữ nguyên giá trị cũ (máy chủ bỏ qua trường null).
        bankAccountNumber: values.bankAccountNumber?.trim() || undefined,
        bankName: values.bankName ?? "",
        nationalId: values.nationalId?.trim() || undefined,
        nationalIdIssuedDate: values.nationalIdIssuedDate?.trim() || null,
        nationalIdIssuedPlace: values.nationalIdIssuedPlace ?? "",
      },
      { onSuccess: () => setEditing(false) }
    );
  };

  if (isLoading) return <Skeleton className="h-48 w-full rounded-xl" />;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Landmark className="size-4" aria-hidden />
          {t("contractIdentity.title")}
        </CardTitle>
        <CardDescription>{t("contractIdentity.description")}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="flex items-start gap-2 rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
          <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>{t("contractIdentity.privacyNote")}</span>
        </p>

        {!editing ? (
          <>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <Row label={t("contractIdentity.bankAccount")} value={data?.bankAccountNumberMasked} />
              <Row label={t("contractIdentity.bankName")} value={data?.bankName} />
              <Row label={t("contractIdentity.nationalId")} value={data?.nationalIdMasked} />
              <Row label={t("contractIdentity.issuedDate")} value={data?.nationalIdIssuedDate} />
              <Row label={t("contractIdentity.issuedPlace")} value={data?.nationalIdIssuedPlace} />
            </dl>

            {data && data.missingForContract.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {t("contractIdentity.missingHint", { fields: data.missingForContract.join(", ") })}
              </p>
            )}

            <Button type="button" variant="outline" onClick={() => setEditing(true)}>
              {data?.hasBankAccount || data?.hasNationalId
                ? t("contractIdentity.update")
                : t("contractIdentity.add")}
            </Button>
          </>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                id="bankAccountNumber"
                label={t("contractIdentity.bankAccount")}
                hint={data?.hasBankAccount ? t("contractIdentity.keepHint") : undefined}
                error={errors.bankAccountNumber?.message}
              >
                <Input id="bankAccountNumber" inputMode="numeric" autoComplete="off"
                  placeholder={data?.bankAccountNumberMasked ?? "1900 1234 5678"}
                  {...register("bankAccountNumber")} />
              </Field>

              <Field id="bankName" label={t("contractIdentity.bankName")}>
                <Input id="bankName" placeholder="Vietcombank" {...register("bankName")} />
              </Field>

              <Field
                id="nationalId"
                label={t("contractIdentity.nationalId")}
                hint={data?.hasNationalId ? t("contractIdentity.keepHint") : undefined}
                error={errors.nationalId?.message}
              >
                <Input id="nationalId" inputMode="numeric" autoComplete="off"
                  placeholder={data?.nationalIdMasked ?? "001080012345"}
                  {...register("nationalId")} />
              </Field>

              <Field id="nationalIdIssuedDate" label={t("contractIdentity.issuedDate")}>
                <Input id="nationalIdIssuedDate" type="date" {...register("nationalIdIssuedDate")} />
              </Field>

              <div className="sm:col-span-2">
                <Field id="nationalIdIssuedPlace" label={t("contractIdentity.issuedPlace")}>
                  <Input id="nationalIdIssuedPlace"
                    placeholder="Cục Cảnh sát QLHC về TTXH"
                    {...register("nationalIdIssuedPlace")} />
                </Field>
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={mutation.isPending}>
                <Save className="size-4" aria-hidden />
                {t("common.save")}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setEditing(false)}>
                {t("common.cancel")}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{value || "—"}</dd>
    </div>
  );
}

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
