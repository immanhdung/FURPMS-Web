import { z } from "zod";

export const proposalMemberSchema = z.object({
  fullName: z.string().min(1, "Phải nhập tên."),
  email: z.string().min(1, "Phải nhập email.").email("Enter a valid email"),
  department: z.string().optional(),
  role: z.string().optional(),
  workMonths: z.number().min(0, "Phải từ 0 trở lên."),
  academicTitle: z.string().optional(),
  memberRoleCode: z.string().optional(),
  isSecretary: z.boolean(),
});

export const proposalWizardSchema = z.object({
  cycleId: z.number().min(1, "Phải chọn đợt nghiên cứu."),
  trackId: z.string().min(1, "Phải chọn lĩnh vực nghiên cứu."),
  researchType: z.number().min(1, "Phải chọn loại đề tài."),
  orderId: z.number().optional(),

  // Backend requires titleVI + objectives (CreateProposalRequest); titleEN/abstract are optional there.
  titleVI: z.string().min(1, "Phải nhập tên đề tài tiếng Việt."),
  titleEN: z.string().optional(),
  abstractEN: z.string().optional(),
  objectives: z.string().min(1, "Phải nêu mục tiêu nghiên cứu."),
  methodology: z.string().optional(),
  expectedOutput: z.string().optional(),
  urgency: z.string().optional(),
  novelty: z.string().optional(),
  applicationPotential: z.string().optional(),
  transferPotential: z.string().optional(),
  facilities: z.string().optional(),
  /**
   * Dự toán theo 06 hạng mục của QĐ543 Điều 15. Tổng = tổng các hạng mục (không nhập tay) và bị
   * soi trần Điều 14; từng hạng mục bị soi tỷ lệ Điều 15.
   */
  budgetItems: z
    .array(
      z.object({
        category: z.string(),
        amount: z.number().min(0, "Kinh phí không được âm"),
      })
    )
    .optional(),
  durationMonths: z.number().min(1, "Phải nhập thời gian thực hiện."),

  members: z.array(proposalMemberSchema),
});

export type ProposalWizardValues = z.infer<typeof proposalWizardSchema>;

export const WIZARD_STEP_FIELDS: Record<number, (keyof ProposalWizardValues)[]> = {
  0: ["cycleId", "trackId", "researchType"],
  1: [],
  2: ["titleVI", "objectives", "durationMonths"],
  3: [],
  4: [],
};

// Nhãn dịch lúc render (t(titleKey)) vì đây là const cấp module, không gọi được hook.
export const WIZARD_STEPS = [
  { titleKey: "wizard.steps.cycle.title", descKey: "wizard.steps.cycle.desc" },
  { titleKey: "wizard.steps.content.title", descKey: "wizard.steps.content.desc" },
  { titleKey: "wizard.steps.details.title", descKey: "wizard.steps.details.desc" },
  { titleKey: "wizard.steps.team.title", descKey: "wizard.steps.team.desc" },
  { titleKey: "wizard.steps.preview.title", descKey: "wizard.steps.preview.desc" },
];
