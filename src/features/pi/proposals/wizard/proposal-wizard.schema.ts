import { z } from "zod";

export const proposalMemberSchema = z.object({
  fullName: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  department: z.string().optional(),
  role: z.string().optional(),
  workMonths: z.number().min(0, "Must be 0 or greater"),
  academicTitle: z.string().optional(),
  memberRoleCode: z.string().optional(),
  isSecretary: z.boolean(),
});

export const proposalWizardSchema = z.object({
  cycleId: z.number().min(1, "Select a research cycle"),
  trackId: z.string().min(1, "Select a research field"),
  researchType: z.number().min(1, "Select a research type"),
  orderId: z.number().optional(),

  titleVI: z.string().optional(),
  titleEN: z.string().min(1, "English title is required"),
  abstractEN: z.string().min(1, "Abstract is required"),
  objectives: z.string().optional(),
  methodology: z.string().optional(),
  expectedOutput: z.string().optional(),
  urgency: z.string().optional(),
  novelty: z.string().optional(),
  applicationPotential: z.string().optional(),
  transferPotential: z.string().optional(),
  facilities: z.string().optional(),
  fundingMethod: z.string().optional(),
  durationMonths: z.number().min(1, "Duration is required"),

  members: z.array(proposalMemberSchema),
});

export type ProposalWizardValues = z.infer<typeof proposalWizardSchema>;

export const WIZARD_STEP_FIELDS: Record<number, (keyof ProposalWizardValues)[]> = {
  0: ["cycleId", "trackId", "researchType"],
  1: [],
  2: ["titleEN", "abstractEN", "durationMonths"],
  3: [],
  4: [],
};

export const WIZARD_STEPS = [
  { title: "Cycle & Field", description: "Choose where to submit" },
  { title: "Research Content", description: "Upload & analyze" },
  { title: "Proposal Details", description: "Describe your research" },
  { title: "Team Members", description: "Add collaborators" },
  { title: "Preview & Submit", description: "Review everything" },
];
