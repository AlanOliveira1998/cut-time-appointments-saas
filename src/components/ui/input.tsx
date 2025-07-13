import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, helperText, "aria-describedby": ariaDescribedby, ...props }, ref) => {
    const inputId = React.useId();
    const helperTextId = `${inputId}-helper-text`;
    const errorId = `${inputId}-error`;
    
    const describedBy = [
      ariaDescribedby,
      helperText && !error ? helperTextId : undefined,
      error && helperText ? errorId : undefined,
    ].filter(Boolean).join(' ');

    return (
      <div className="relative">
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          ref={ref}
          aria-invalid={error}
          aria-describedby={describedBy || undefined}
          {...props}
        />
        {helperText && (
          <p
            id={error ? errorId : helperTextId}
            className={cn(
              "mt-1 text-xs",
              error ? "text-destructive" : "text-muted-foreground"
            )}
            role={error ? "alert" : undefined}
          >
            {helperText}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
