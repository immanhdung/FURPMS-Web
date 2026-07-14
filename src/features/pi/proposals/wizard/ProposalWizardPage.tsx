import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageLoader } from "@/components/shared/PageLoader";
import { useProposalQuery, useCreateProposalMutation, useUpdateProposalMutation } from "@/hooks/useProposals";
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

export function ProposalWizardPage() {
  const { proposalId: routeProposalId } = useParams<{ proposalId: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(routeProposalId);

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
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
          {isEdit ? "Edit Proposal" : "Submit New Proposal"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{WIZARD_STEPS[currentStep].description}</p>
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
