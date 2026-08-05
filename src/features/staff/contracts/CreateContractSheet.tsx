import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { FormSheet } from "@/components/shared/FormSheet";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateContractMutation, useUpdateContractMutation } from "@/hooks/useContracts";
import { useProposalsQuery } from "@/hooks/useProposals";
import { PROPOSAL_STATUS } from "@/constants/statuses";
import { contractSchema, type ContractFormValues } from "@/features/staff/contracts/contract.schema";
import type { Contract } from "@/types/contract";

interface CreateContractSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Có giá trị ⇒ chế độ SỬA hợp đồng đang có; null ⇒ tạo mới. */
  contract?: Contract | null;
}

/**
 * Tạo **và sửa** hợp đồng.
 *
 * Trước đây chỉ có tạo: Staff gõ sai số hợp đồng hay ngày là kẹt vĩnh viễn, chỉ còn cách tạo
 * cái mới chồng lên. Sửa dùng lại y form này để hai đường không lệch nhau về ràng buộc.
 * Chế độ sửa **ẩn ô chọn đề tài** — đổi đề tài nghĩa là hợp đồng khác hẳn, BE cũng không nhận.
 */
export function CreateContractSheet({ open, onOpenChange, contract = null }: CreateContractSheetProps) {
  const { t } = useTranslation();
  const isEdit = Boolean(contract);
  const { data: approvedProposals } = useProposalsQuery({ status: PROPOSAL_STATUS.APPROVED });
  const createMutation = useCreateContractMutation();
  const updateMutation = useUpdateContractMutation();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ContractFormValues>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      proposalId: "",
      contractNumber: "",
      scopeTitle: "",
      startDate: "",
      endDate: "",
      maxExtensionMonths: 0,
      sideARepresentative: "",
      econtractUrl: "",
    },
  });

  // Mở form sửa phải thấy giá trị đang có, không thì lưu lại là ghi đè trắng.
  useEffect(() => {
    if (!open) return;
    reset(
      contract
        ? {
            proposalId: contract.proposalId ?? "",
            contractNumber: contract.contractNumber ?? "",
            scopeTitle: contract.scopeTitle ?? "",
            startDate: contract.startDate?.slice(0, 10) ?? "",
            endDate: contract.endDate?.slice(0, 10) ?? "",
            maxExtensionMonths: contract.maxExtensionMonths ?? 0,
            sideARepresentative: contract.sideARepresentative ?? "",
            econtractUrl: contract.econtractUrl ?? "",
          }
        : {
            proposalId: "",
            contractNumber: "",
            scopeTitle: "",
            startDate: "",
            endDate: "",
            maxExtensionMonths: 0,
            sideARepresentative: "",
            econtractUrl: "",
          }
    );
  }, [open, contract, reset]);

  const onSubmit = (values: ContractFormValues) => {
    const done = () => {
      reset();
      onOpenChange(false);
    };
    if (contract) {
      const { proposalId: _ignored, ...payload } = values;
      updateMutation.mutate({ id: contract.id, payload }, { onSuccess: done });
      return;
    }
    createMutation.mutate(values, { onSuccess: done });
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? t("contract.editTitle") : t("contract.createTitle")}
      description={isEdit ? t("contract.editHint") : t("contract.createHint")}
      formId="contract-form"
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isSubmitting}
      submitLabel={isEdit ? t("common.save") : t("contract.createBtn")}
    >
      {!isEdit && (
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">{t("contract.approvedProposal")}</label>
        <Controller
          control={control}
          name="proposalId"
          render={({ field }) => (
            <Select value={field.value || undefined} onValueChange={field.onChange}>
              <SelectTrigger aria-invalid={Boolean(errors.proposalId)}>
                <SelectValue placeholder={t("contract.selectApproved")} />
              </SelectTrigger>
              <SelectContent>
                {approvedProposals?.map((proposal) => (
                  <SelectItem key={proposal.id} value={proposal.id}>
                    {proposal.titleEN || proposal.titleVI || proposal.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.proposalId && <p className="mt-1 text-xs text-destructive">{errors.proposalId.message}</p>}
        {approvedProposals && approvedProposals.length === 0 && (
          <p className="mt-1 text-xs text-warning">{t("contract.noApproved")}</p>
        )}
      </div>
      )}

      <div>
        <label htmlFor="contract-number" className="mb-1.5 block text-sm font-medium text-foreground">
          {t("contract.numberLabel")}
        </label>
        <Input id="contract-number" {...register("contractNumber")} />
      </div>

      <div>
        <label htmlFor="contract-scope" className="mb-1.5 block text-sm font-medium text-foreground">
          {t("contract.scopeLabel")}
        </label>
        <Input id="contract-scope" {...register("scopeTitle")} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="contract-start" className="mb-1.5 block text-sm font-medium text-foreground">
            {t("contract.startDate")}
          </label>
          <Input id="contract-start" type="date" aria-invalid={Boolean(errors.startDate)} {...register("startDate")} />
          {errors.startDate && <p className="mt-1 text-xs text-destructive">{errors.startDate.message}</p>}
        </div>
        <div>
          <label htmlFor="contract-end" className="mb-1.5 block text-sm font-medium text-foreground">
            {t("contract.endDate")}
          </label>
          <Input id="contract-end" type="date" aria-invalid={Boolean(errors.endDate)} {...register("endDate")} />
          {errors.endDate && <p className="mt-1 text-xs text-destructive">{errors.endDate.message}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="contract-extension" className="mb-1.5 block text-sm font-medium text-foreground">
          {t("contract.maxExtensionLabel")}
        </label>
        <Input
          id="contract-extension"
          type="number"
          min={0}
          aria-invalid={Boolean(errors.maxExtensionMonths)}
          {...register("maxExtensionMonths", { valueAsNumber: true })}
        />
        {errors.maxExtensionMonths && (
          <p className="mt-1 text-xs text-destructive">{errors.maxExtensionMonths.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="contract-representative" className="mb-1.5 block text-sm font-medium text-foreground">
          {t("contract.sideARep")}
        </label>
        <Input id="contract-representative" {...register("sideARepresentative")} />
      </div>

      {/* Thầy 29/07: bỏ ô dán URL hợp đồng — file thật upload sau khi tạo, ở tab "Hồ sơ hợp đồng
          đã ký" trong chi tiết hợp đồng (đã có sẵn luồng upload + xem file). */}
      <p className="rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
        {t("contract.uploadAfterCreateHint")}
      </p>
    </FormSheet>
  );
}
