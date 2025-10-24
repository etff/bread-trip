import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-gray-800 mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full px-4 py-2 rounded-lg border border-gray-300",
            "focus:outline-none focus:ring-2 focus:ring-brown focus:border-transparent",
            "disabled:bg-gray-100 disabled:cursor-not-allowed",
            "placeholder:text-gray-600 placeholder:font-medium",
            "text-gray-900 font-medium",
            error && "border-red-500",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
