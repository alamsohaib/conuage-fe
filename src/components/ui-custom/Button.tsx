
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "link";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading = false, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          // Base styles
          "relative inline-flex items-center justify-center rounded-md font-medium transition-all focus-ring select-none",
          "transition-all duration-200 active:scale-[0.98]",
          
          // Variants
          variant === "primary" && "bg-primary text-primary-foreground shadow-sm hover:brightness-105 dark:bg-blue-600 dark:text-white dark:hover:bg-blue-500",
          variant === "secondary" && "bg-secondary text-secondary-foreground hover:bg-secondary/90 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600",
          variant === "outline" && "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800",
          variant === "ghost" && "hover:bg-accent hover:text-accent-foreground dark:text-gray-300 dark:hover:bg-gray-800",
          variant === "link" && "text-primary underline-offset-4 hover:underline dark:text-blue-400",
          
          // Sizes
          size === "sm" && "h-8 px-3 text-xs",
          size === "md" && "h-10 px-4 py-2",
          size === "lg" && "h-12 px-6 text-base",
          
          // Disabled state
          (disabled || loading) && "opacity-70 pointer-events-none",
          
          className
        )}
        {...props}
      >
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="animate-spin h-5 w-5 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        ) : null}
        <span className={loading ? "invisible" : ""}>{children}</span>
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
