import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { StepWizard } from "../../components/forms/StepWizard";
import { useProposal } from "../../hooks/useProposals";
import { Step1BasicInfo } from "./components/Step1BasicInfo";
import { Step2Team } from "./components/Step2Team";

import { Step3Budget } from "./components/Step3Budget";
import { Step4Documents } from "./components/Step4Documents";
import { Step5Submit } from "./components/Step5Submit";

export default function ProposalWizard() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [proposalId, setProposalId] = useState(id || null);

  // Fetch existing proposal data if ID is present
  const { data: proposal, isLoading } = useProposal(proposalId);

  // Handle step 1 save (creation)
  const handleProposalSaved = (newId, data) => {
    if (!proposalId) {
      setProposalId(newId);
      // Optional: replace URL so refresh doesn't start over
      window.history.replaceState(null, "", `/proposals/${newId}/edit`);
    }
  };

  const stepsList = [
    "Thông tin chung",
    "Nhân sự",
    "Ngân sách",
    "Tài liệu",
    "Xem lại & Nộp"
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-6 animate-in fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          {proposalId ? "Chỉnh sửa đề xuất" : "Tạo đề xuất nghiên cứu mới"}
        </h1>
        <p className="text-muted-foreground mt-1">Biểu mẫu 01 — Đề cương nghiên cứu khoa học.</p>
      </div>

      <StepWizard 
        totalSteps={5} 
        currentStep={currentStep} 
        onStepChange={setCurrentStep}
      >
        <StepWizard.Progress steps={stepsList} />
        
        <StepWizard.Content>
          {currentStep === 1 && (
            <Step1BasicInfo 
              proposalId={proposalId}
              initialData={proposal}
              onSaved={handleProposalSaved}
            />
          )}
          
          {currentStep === 2 && (
            <Step2Team 
              proposalId={proposalId}
              initialTeam={proposal?.teamMembers || []}
            />
          )}

          {currentStep === 3 && (
            <Step3Budget 
              proposalId={proposalId}
              initialBudget={proposal?.budgetSummary}
            />
          )}

          {currentStep === 4 && (
            <Step4Documents 
              proposalId={proposalId}
              initialDocuments={proposal?.documents || []}
            />
          )}

          {currentStep === 5 && (
            <Step5Submit 
              proposalId={proposalId}
            />
          )}
        </StepWizard.Content>
      </StepWizard>
    </div>
  );
}
