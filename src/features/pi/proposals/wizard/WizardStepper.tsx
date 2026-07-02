import { Check } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { WIZARD_STEPS } from "@/features/pi/proposals/wizard/proposal-wizard.schema";

export function WizardStepper({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center">
      {WIZARD_STEPS.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <div key={step.title} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <motion.div
                initial={false}
                animate={{
                  scale: isCurrent ? 1.08 : 1,
                }}
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-medium transition-colors",
                  isCompleted && "bg-primary text-primary-foreground",
                  isCurrent && !isCompleted && "bg-primary/10 text-primary ring-2 ring-primary",
                  !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? <Check className="size-4" /> : index + 1}
              </motion.div>
              <div className="hidden text-center sm:block">
                <p className={cn("text-xs font-medium", isCurrent ? "text-foreground" : "text-muted-foreground")}>
                  {step.title}
                </p>
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
