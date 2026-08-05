import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { FormSheet } from "@/components/shared/FormSheet";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useContractsQuery, useCreateContractMutation, useUpdateContractMutation } from "@/hooks/useContracts";
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
  const { data: allApproved } = useProposalsQuery({ status: PROPOSAL_STATUS.APPROVED });
  const { data: existingContracts } = useContractsQuery();

  /**
   * Chỉ chào những đề tài **chưa có hợp đồng**.
   *
   * Trước đây đổ thẳng mọi đề tài APPROVED, kể cả đề tài đã ký hợp đồng từ đợt trước — Staff mở ra
   * thấy cả danh sách cũ, không biết cái nào còn phải làm. Giai đoạn ký từng phần đã có
   * `ContractPhase` lo (phase nằm TRONG một hợp đồng), nên một đề tài chỉ cần một hợp đồng.
   */
  const contractedProposalIds = new Set((existingContracts ?? []).map((c) => c.proposalId));
  const approvedProposals = (allApproved ?? []).filter((p) => !contractedProposalIds.has(p.id));
  const hiddenCount = (allApproved?.length ?? 0) - approvedProposals.length;

  const createMutation = useCreateContractMutation();
  const updateMutation = useUpdateContractMutation();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
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

  /**
   * Trần gia hạn KHÔNG phải con số cố định.
   * QĐ543 Điều 10.4: *"Gia hạn tối đa 1/2 tổng thời gian thực hiện của đề tài được phê duyệt"*.
   * "6 tháng" mà tài liệu nội bộ hay nhắc chỉ đúng khi đề tài dài 12 tháng — Mẫu 1 giới hạn
   * "không quá 12 tháng" nên đó là ca hay gặp, không phải luật.
   */
  const selectedProposalId = watch("proposalId");
  const selectedDuration =
    approvedProposals.find((p) => p.id === selectedProposalId)?.durationMonths ?? 0;
  const extensionCap = selectedDuration > 0 ? Math.floor(selectedDuration / 2) : null;

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

  // Chọn đề tài xong tự điền trần gia hạn — Staff không phải tự chia đôi rồi gõ tay.
  useEffect(() => {
    if (!open || isEdit || extensionCap == null) return;
    setValue("maxExtensionMonths", extensionCap);
  }, [open, isEdit, extensionCap, setValue]);

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
                {approvedProposals.map((proposal) => (
                  <SelectItem key={proposal.id} value={proposal.id}>
                    {proposal.titleEN || proposal.titleVI || proposal.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.proposalId && <p className="mt-1 text-xs text-destructive">{errors.proposalId.message}</p>}
        {approvedProposals.length === 0 && (
          <p className="mt-1 text-xs text-warning">{t("contract.noApproved")}</p>
        )}
        {/* Nói rõ vì sao danh sách ngắn hơn số đề tài đã duyệt — khỏi tưởng mất dữ liệu. */}
        {hiddenCount > 0 && (
          <p className="mt-1 text-xs text-muted-foreground">{t("contract.alreadyContracted", { n: hiddenCount })}</p>
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
        {extensionCap != null && (
          <p className="mt-1 text-xs text-muted-foreground">
            {t("contract.extensionCapHint", { duration: selectedDuration, cap: extensionCap })}
          </p>
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
