import React, { createContext, useContext, useMemo } from "react";
import { Check, ChevronRight, ChevronLeft, Save } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";

// ─── Context ─────────────────────────────────────────────────────────

const WizardContext = createContext(null);

function useWizard() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error("Wizard components must be rendered within a <StepWizard>");
  }
  return context;
}

// ─── Root Component ──────────────────────────────────────────────────

/**
 * StepWizard — Compound Component for Multi-step forms
 * Implements vercel-composition-patterns
 */
export function StepWizard({
  children,
  totalSteps,
  currentStep,
  onStepChange,
  onComplete,
  isNextDisabled = false,
  isSaving = false,
  className,
}) {
  const goNext = () => {
    if (currentStep < totalSteps) onStepChange(currentStep + 1);
    else if (onComplete) onComplete();
  };

  const goBack = () => {
    if (currentStep > 1) onStepChange(currentStep - 1);
  };

  const contextValue = useMemo(
    () => ({
      totalSteps,
      currentStep,
      onStepChange,
      goNext,
      goBack,
      isNextDisabled,
      isSaving,
    }),
    [totalSteps, currentStep, onStepChange, isNextDisabled, isSaving]
  );

  return (
    <WizardContext.Provider value={contextValue}>
      <div className={cn("flex flex-col w-full bg-background", className)}>
        {children}
      </div>
    </WizardContext.Provider>
  );
}

// ─── Progress Indicator ──────────────────────────────────────────────

StepWizard.Progress = function WizardProgress({ steps, className }) {
  const { currentStep, totalSteps } = useWizard();

  // If steps array is provided, use it, else generate default generic array
  const stepArray = steps || Array.from({ length: totalSteps }, (_, i) => `Bước ${i + 1}`);

  return (
    <div className={cn("w-full py-4 mb-6 relative", className)} aria-label="Tiến độ các bước">
      <div className="flex justify-between items-center relative z-10">
        {stepArray.map((label, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div key={index} className="flex flex-col items-center flex-1 group">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors mb-2 z-10 bg-background",
                  isCompleted
                    ? "border-primary bg-primary text-primary-foreground"
                    : isCurrent
                    ? "border-primary text-primary ring-4 ring-primary/20"
                    : "border-muted-foreground/30 text-muted-foreground"
                )}
                aria-current={isCurrent ? "step" : undefined}
              >
                {isCompleted ? <Check size={16} strokeWidth={3} /> : stepNumber}
              </div>
              <span
                className={cn(
                  "text-xs font-medium text-center hidden sm:block",
                  isCurrent ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
      
      {/* Background connecting line */}
      <div className="absolute top-8 left-0 w-full h-[2px] bg-muted-foreground/20 -z-0 transform -translate-y-1/2 px-10 sm:px-16" aria-hidden="true">
        <div 
          className="h-full bg-primary transition-all duration-300 ease-in-out"
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        />
      </div>
    </div>
  );
};

// ─── Content Area ────────────────────────────────────────────────────

StepWizard.Content = function WizardContent({ children, className }) {
  return (
    <div className={cn("flex-1 min-h-[400px] bg-card border rounded-xl shadow-sm p-6 mb-6", className)} role="region" aria-live="polite">
      {children}
    </div>
  );
};

// ─── Footer Controls ─────────────────────────────────────────────────

StepWizard.Footer = function WizardFooter({ children, className }) {
  return (
    <div className={cn("flex items-center justify-between pt-4 border-t", className)}>
      {children}
    </div>
  );
};

StepWizard.BackButton = function WizardBackButton({ className, label = "Quay lại" }) {
  const { currentStep, goBack } = useWizard();
  
  if (currentStep <= 1) return <div />; // Render empty div to maintain flex spacing

  return (
    <Button
      variant="outline"
      onClick={goBack}
      className={cn("gap-2", className)}
    >
      <ChevronLeft size={16} />
      {label}
    </Button>
  );
};

StepWizard.SaveDraftButton = function WizardSaveDraftButton({ className, label = "Lưu nháp", onClick }) {
  const { isSaving } = useWizard();
  return (
    <Button
      variant="secondary"
      onClick={onClick}
      disabled={isSaving}
      className={cn("gap-2", className)}
    >
      {isSaving ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <Save size={16} />
      )}
      {label}
    </Button>
  );
};

StepWizard.NextButton = function WizardNextButton({ 
  className, 
  nextLabel = "Tiếp tục", 
  finishLabel = "Hoàn tất" 
}) {
  const { currentStep, totalSteps, goNext, isNextDisabled, isSaving } = useWizard();
  
  const isLast = currentStep === totalSteps;

  return (
    <Button
      onClick={goNext}
      disabled={isNextDisabled || isSaving}
      className={cn("gap-2", className)}
    >
      {isLast ? finishLabel : nextLabel}
      {!isLast && <ChevronRight size={16} />}
    </Button>
  );
};
