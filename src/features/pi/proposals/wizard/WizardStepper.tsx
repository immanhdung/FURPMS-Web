import { Check } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { WIZARD_STEPS } from "@/features/pi/proposals/wizard/proposal-wizard.schema";

interface WizardStepperProps {
  currentStep: number;
  /** Bước xa nhất đã tới — cho bấm nhảy tới mọi bước ≤ mốc này (xem qua lại). */
  maxStep?: number;
  onStepClick?: (index: number) => void;
}

export function WizardStepper({ currentStep, maxStep = currentStep, onStepClick }: WizardStepperProps) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center">
      {WIZARD_STEPS.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const clickable = Boolean(onStepClick) && index <= maxStep && !isCurrent;

        return (
          <div key={t(step.titleKey)} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <motion.button
                type="button"
                disabled={!clickable}
                onClick={() => clickable && onStepClick?.(index)}
                initial={false}
                animate={{
                  scale: isCurrent ? 1.08 : 1,
                }}
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-medium transition-colors",
                  clickable && "cursor-pointer hover:ring-2 hover:ring-primary/40",
                  !clickable && "cursor-default",
                  isCompleted && "bg-primary text-primary-foreground",
                  isCurrent && !isCompleted && "bg-primary/10 text-primary ring-2 ring-primary",
                  !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? <Check className="size-4" /> : index + 1}
              </motion.button>
              <div className="hidden text-center sm:block">
                <button
                  type="button"
                  disabled={!clickable}
                  onClick={() => clickable && onStepClick?.(index)}
                  className={cn(
                    "text-xs font-medium",
                    isCurrent ? "text-foreground" : "text-muted-foreground",
                    clickable && "cursor-pointer hover:text-foreground"
                  )}
                >
                  {t(step.titleKey)}
                </button>
              </div>
            </div>

            {index < WIZARD_STEPS.length - 1 && (
              <div className="mx-2 h-px flex-1 bg-border">
                <motion.div
                  className="h-px bg-primary"
                  initial={false}
                  animate={{ width: isCompleted ? "100%" : "0%" }}
                  transition={{ duration: 0.25 }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
