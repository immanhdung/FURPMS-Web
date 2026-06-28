import React, { useId } from "react";
import { cn } from "../../lib/utils";

/**
 * SelectField — Accessible select dropdown wrapper
 * 
 * Supports options array of objects { label, value, disabled }
 * Supports grouped options if structure is { groupLabel, options: [] }
 */
export const SelectField = React.forwardRef(
  ({ label, options = [], error, required, className, id: externalId, helpText, placeholder = "Chọn...", ...props }, ref) => {
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
        
        <select
          ref={ref}
          id={id}
          required={required}
          aria-invalid={!!error}
          aria-describedby={ariaDescribedBy || undefined}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus-visible:ring-destructive"
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}
          
          {options.map((option, index) => {
            // Grouped options support
            if (option.groupLabel && option.options) {
              return (
                <optgroup key={`group-${index}`} label={option.groupLabel}>
                  {option.options.map((opt) => (
                    <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                      {opt.label}
                    </option>
                  ))}
                </optgroup>
              );
            }
            
            // Standard options
            return (
              <option key={option.value || index} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            );
          })}
        </select>
        
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

SelectField.displayName = "SelectField";
