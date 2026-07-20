import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Loader2, Save, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUiStore } from "@/store/ui.store";
import { Card, CardContent } from "@/components/ui/card";
import { PageLoader } from "@/components/shared/PageLoader";
import { useProposalQuery, useCreateProposalMutation, useUpdateProposalMutation } from "@/hooks/useProposals";
import { useCyclesQuery } from "@/hooks/useCycles";
import { useResearchTypesQuery } from "@/hooks/useResearchTypes";
import { trackService } from "@/services/api/track.service";
import { CYCLE_STATUS } from "@/constants/statuses";
import { WizardStepper } from "@/features/pi/proposals/wizard/WizardStepper";
import { Step1CycleFieldType } from "@/features/pi/proposals/wizard/Step1CycleFieldType";
import { Step2ResearchContent } from "@/features/pi/proposals/wizard/Step2ResearchContent";
import { Step3Details } from "@/features/pi/proposals/wizard/Step3Details";
import { Step4TeamMembers } from "@/features/pi/proposals/wizard/Step4TeamMembers";
import { Step5Preview } from "@/features/pi/proposals/wizard/Step5Preview";
import { SubmitProposalDialog } from "@/features/pi/proposals/SubmitProposalDialog";
import {
  proposalWizardSchema,
  WIZARD_STEP_FIELDS,
  WIZARD_STEPS,
  type ProposalWizardValues,
} from "@/features/pi/proposals/wizard/proposal-wizard.schema";
import { ROUTES } from "@/constants/routes";
import type { ProposalPayload } from "@/types/proposal-detail";

const DEFAULT_VALUES: ProposalWizardValues = {
  cycleId: 0,
  trackId: "",
  researchType: 0,
  orderId: undefined,
  titleVI: "",
  titleEN: "",
  abstractEN: "",
  objectives: "",
  methodology: "",
  expectedOutput: "",
  urgency: "",
  novelty: "",
  applicationPotential: "",
  transferPotential: "",
  facilities: "",
  fundingMethod: "",
  durationMonths: 12,
  members: [],
};

/** Demo content used by the "Fill with sample data" button. Cycle/field/type are left untouched
 * because they depend on what exists in the database. */
const SAMPLE_CONTENT: Partial<ProposalWizardValues> = {
  titleVI: "Ứng dụng học sâu phát hiện gian lận giao dịch thẻ tín dụng",
  titleEN: "Deep Learning for Credit Card Fraud Detection",
  abstractEN:
    "This project builds a real-time model that flags fraudulent card transactions using sequence models on transaction history, aiming to cut false positives while keeping recall high.",
  objectives:
    "1. Survey current fraud-detection practice and datasets.\n2. Build a sequence model over transaction history.\n3. Evaluate precision, recall, and F1 on real anonymized data.",
  methodology:
    "Collect and anonymize transaction logs; engineer temporal features; train and compare LSTM/Transformer baselines; validate with time-based splits.",
  expectedOutput: "01 conference paper, 01 demo web service, 01 final report with reproducible code.",
  urgency: "Card fraud losses are rising and rule-based systems miss novel patterns.",
  novelty: "Combines sequence modelling with cost-sensitive training tuned to the bank's risk appetite.",
  applicationPotential: "Directly deployable as a scoring service inside a bank's payment pipeline.",
  transferPotential: "The approach generalizes to insurance-claim and e-wallet fraud.",
  facilities: "University GPU server; anonymized transaction dataset from a partner bank.",
  fundingMethod: "PARTIAL",
  durationMonths: 12,
  members: [
    {
      fullName: "Trần Thị Bình",
      email: "binh.tran@fpt.edu.vn",
      department: "SE",
      role: "TVC",
      workMonths: 4,
      isSecretary: false,
    },
  ],
};

export function ProposalWizardPage() {
  const { proposalId: routeProposalId } = useParams<{ proposalId: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(routeProposalId);
  const sampleFillEnabled = useUiStore((state) => state.sampleFillEnabled);
  const { data: cycles } = useCyclesQuery();
  const { data: researchTypes } = useResearchTypesQuery();

  const { data: existingProposal, isLoading: isLoadingExisting } = useProposalQuery(routeProposalId ?? null);
  const createMutation = useCreateProposalMutation();
  const updateMutation = useUpdateProposalMutation();

  const [proposalId, setProposalId] = useState<string | null>(routeProposalId ?? null);
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);

  const form = useForm<ProposalWizardValues>({
    resolver: zodResolver(proposalWizardSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (existingProposal) {
      form.reset({
        cycleId: existingProposal.cycleId ?? 0,
        trackId: existingProposal.trackId ?? "",
        researchType: existingProposal.researchType,
        orderId: existingProposal.orderId ?? undefined,
        titleVI: existingProposal.titleVI ?? "",
        titleEN: existingProposal.titleEN ?? "",
        abstractEN: existingProposal.abstractEN ?? "",
        objectives: existingProposal.objectives ?? "",
        methodology: existingProposal.methodology ?? "",
        expectedOutput: existingProposal.expectedOutput ?? "",
        urgency: existingProposal.urgency ?? "",
        novelty: existingProposal.novelty ?? "",
        applicationPotential: existingProposal.applicationPotential ?? "",
        transferPotential: existingProposal.transferPotential ?? "",
        facilities: existingProposal.facilities ?? "",
        fundingMethod: existingProposal.fundingMethod ?? "",
        durationMonths: existingProposal.durationMonths || 12,
        members: existingProposal.members ?? [],
      });
    }
  }, [existingProposal, form]);

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const saveDraft = async (): Promise<string | null> => {
    const payload: ProposalPayload = form.getValues();

    if (proposalId) {
      const result = await updateMutation.mutateAsync({ id: proposalId, payload });
      toast.success("Draft saved.");
      return result.id;
    }

    const result = await createMutation.mutateAsync(payload);
    setProposalId(result.id);
    toast.success("Draft saved.");
    return result.id;
  };

  const handleNext = async () => {
    const fieldsToValidate = WIZARD_STEP_FIELDS[currentStep] ?? [];
    const isValid = fieldsToValidate.length === 0 || (await form.trigger(fieldsToValidate));
    if (!isValid) return;
    setCurrentStep((step) => Math.min(step + 1, WIZARD_STEPS.length - 1));
  };

  const handleBack = () => setCurrentStep((step) => Math.max(step - 1, 0));

  const handleFillSample = async () => {
    // Test helper: fill EVERYTHING (including cycle/field/type) and jump to the preview so the
    // whole proposal can be submitted in one go. Falls back to content-only if data is missing.
    const current = form.getValues();
    const openCycle = (cycles ?? []).find((c) => c.status?.toUpperCase() === CYCLE_STATUS.OPEN);
    // Prefer the self-propose type (no ordering unit) so no topic selection is required.
    const selfProposeType = (researchTypes ?? []).find((t) => !t.requireOrderingUnit) ?? researchTypes?.[0];

    let trackId = current.trackId;
    if (openCycle) {
      try {
        const tracks = await trackService.listByCycle(openCycle.id);
        if (tracks[0]) trackId = tracks[0].id.toString();
      } catch {
        /* keep whatever was already chosen */
      }
    }

    form.reset({
      ...current,
      ...SAMPLE_CONTENT,
      // Coerce to number — the API serializes these ids as strings, and the schema expects numbers
      // (the normal Select flow already does Number(value)).
      cycleId: openCycle ? Number(openCycle.id) : current.cycleId,
      trackId,
      researchType: selfProposeType ? Number(selfProposeType.id) : current.researchType,
      orderId: undefined,
    });

    if (openCycle && trackId && selfProposeType) {
      setCurrentStep(WIZARD_STEPS.length - 1); // jump to Preview & Submit
      toast.success("Sample proposal ready — review and submit.");
    } else {
      toast.success("Sample content filled — pick the cycle, field, and type to continue.");
    }
  };

  const handleSaveDraft = async () => {
    try {
      await saveDraft();
    } catch {
      // toast handled by mutation onError
    }
  };

  const handleOpenSubmit = async () => {
    const isValid = await form.trigger();
    if (!isValid) {
      toast.error("Please complete the required fields before submitting.");
      return;
    }
    try {
      const id = await saveDraft();
      if (id) setSubmitDialogOpen(true);
    } catch {
      // toast handled by mutation onError
    }
  };

  if (isEdit && isLoadingExisting) {
    return <PageLoader label="Loading proposal..." />;
  }

  const isLastStep = currentStep === WIZARD_STEPS.length - 1;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Button variant="ghost" size="sm" className="-ml-2" onClick={() => navigate(ROUTES.MY_PROPOSALS)}>
          <ArrowLeft />
          Back to my proposals
        </Button>
        <div className="mt-2 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {isEdit ? "Edit Proposal" : "Submit New Proposal"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{WIZARD_STEPS[currentStep].description}</p>
          </div>
          {sampleFillEnabled && (
            <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={handleFillSample}>
              <Wand2 />
              Fill with sample data
            </Button>
          )}
        </div>
      </div>

      <WizardStepper currentStep={currentStep} />

      <Card>
        <CardContent className="p-5">
          {currentStep === 0 && <Step1CycleFieldType form={form} />}
          {currentStep === 1 && <Step2ResearchContent form={form} file={uploadedFile} onFileChange={setUploadedFile} />}
          {currentStep === 2 && <Step3Details form={form} />}
          {currentStep === 3 && <Step4TeamMembers form={form} />}
          {currentStep === 4 && <Step5Preview form={form} />}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-2">
        <Button type="button" variant="outline" onClick={handleBack} disabled={currentStep === 0}>
          <ArrowLeft />
          Back
        </Button>

        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={handleSaveDraft} disabled={isSaving}>
            {isSaving ? <Loader2 className="animate-spin" /> : <Save />}
            Save draft
          </Button>

          {isLastStep ? (
            <Button type="button" onClick={handleOpenSubmit} disabled={isSaving}>
              {isSaving && <Loader2 className="animate-spin" />}
              Submit proposal
            </Button>
          ) : (
            <Button type="button" onClick={handleNext}>
              Next
              <ArrowRight />
            </Button>
          )}
        </div>
      </div>

      <SubmitProposalDialog
        open={submitDialogOpen}
        onOpenChange={setSubmitDialogOpen}
        proposalId={proposalId}
        onSubmitted={() => navigate(`${ROUTES.MY_PROPOSALS}/${proposalId}`)}
      />
    </div>
  );
}
