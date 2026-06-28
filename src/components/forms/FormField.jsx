import React, { useId } from "react";
import { cn } from "../../lib/utils";

/**
 * FormField — Accessible input wrapper
 * 
 * Follows web-design-guidelines:
 * - Proper <label> to <input> association via id
 * - role="alert" for error messages
 * - focus-visible rings for keyboard navigation
 */
export const FormField = React.forwardRef(
  ({ label, error, required, className, id: externalId, helpText, ...props }, ref) => {
    // Auto-generate ID if not provided, ensuring label matches input
    const generatedId = useId();
    const id = externalId || generatedId;
    
    const errorId = `${id}-error`;
    const helpId = `${id}-help`;
    
    const ariaDescribedBy = cn(
      error && errorId,
      helpText && !error && helpId
    );

    return (
      <div className={cn("flex flex-col gap-1.5", className)}>
        {label && (
          <label 
            htmlFor={id} 
            className="text-sm font-medium text-foreground"
          >
            {label}
            {required && <span className="text-destructive ml-1" aria-hidden="true">*</span>}
          </label>
        )}
        
        <input
          ref={ref}
          id={id}
          required={required}
          aria-invalid={!!error}
          aria-describedby={ariaDescribedBy || undefined}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors",
            "file:border-0 file:bg-transparent file:text-sm file:font-medium",
            "placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus-visible:ring-destructive"
          )}
          {...props}
        />
        
        {error && (
          <p id={errorId} className="text-[0.8rem] font-medium text-destructive" role="alert">
            {error}
          </p>
        )}
        
        {helpText && !error && (
          <p id={helpId} className="text-[0.8rem] text-muted-foreground">
            {helpText}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = "FormField";
