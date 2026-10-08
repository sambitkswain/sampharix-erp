import type {
  ButtonHTMLAttributes,
  FC,
  ReactNode,
} from "react";

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "default" | "outline" | "destructive";
}

export const Button: FC<ButtonProps> = ({
  children,
  variant = "default",
  className = "",
  type = "button",
  disabled = false,
  ...props
}) => {
  const variantClass =
    variant === "outline"
      ? "border border-slate-300 bg-transparent text-slate-700"
      : variant === "destructive"
        ? "bg-red-600 text-white"
        : "bg-blue-600 text-white";

  return (
    <button
      {...props}
      type={type}
      disabled={disabled}
      className={`
        px-4 py-2 rounded-lg font-medium transition hover:opacity-90
        ${variantClass}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${className}
      `}
    >
      {children}
    </button>
  );
};