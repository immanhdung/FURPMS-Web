import React, { useId, useState, useEffect } from "react";
import { cn } from "../../lib/utils";

/**
 * RichTextArea — Accessible textarea with character count
 * Note: Named "RichTextArea" for future extension with a real WYSIWYG editor if needed.
 * Currently functions as an enhanced textarea.
 */
export const RichTextArea = React.forwardRef(
  ({ label, error, required, className, id: externalId, helpText, maxLength, value, defaultValue, onChange, ...props }, ref) => {
    const generatedId = useId();
    const id = externalId || generatedId;
    
    const [charCount, setCharCount] = useState(0);

    // Initialize char count
    useEffect(() => {
      const initialValue = value || defaultValue || "";
      setCharCount(String(initialValue).length);
    }, [value, defaultValue]);

    const handleChange = (e) => {
      setCharCount(e.target.value.length);
      if (onChange) {
        onChange(e);
      }
    };
    
    const errorId = `${id}-error`;
    const helpId = `${id}-help`;
    const counterId = `${id}-counter`;
    
    const ariaDescribedBy = cn(
      error && errorId,
      helpText && !error && helpId,
      maxLength && counterId
    );

    return (
      <div className={cn("flex flex-col gap-1.5", className)}>
        {label && (
          <div className="flex justify-between items-end">
            <label 
              htmlFor={id} 
              className="text-sm font-medium text-foreground"
            >
              {label}
              {required && <span className="text-destructive ml-1" aria-hidden="true">*</span>}
            </label>
            
            {maxLength && (
              <span 
                id={counterId}
                className={cn(
                  "text-xs",
                  charCount >= maxLength ? "text-destructive font-medium" : "text-muted-foreground"
                )}
                aria-live="polite"
              >
                {charCount}/{maxLength}
              </span>
            )}
          </div>
        )}
        
        <textarea
          ref={ref}
          id={id}
          required={required}
          maxLength={maxLength}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          aria-invalid={!!error}
          aria-describedby={ariaDescribedBy || undefined}
          className={cn(
            "flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors custom-scrollbar resize-y",
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

RichTextArea.displayName = "RichTextArea";
