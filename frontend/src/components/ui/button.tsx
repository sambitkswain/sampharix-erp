import React, { ButtonHTMLAttributes } from "react";

// Extend standard button attributes to automatically support 'disabled', 'title', etc.
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className = "",
  type = "button",
  disabled,
  ...props // Spreads any other props like onClick, disabled, etc.
}) => {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`px-4 py-2 rounded-lg font-medium transition hover:opacity-90 
        ${disabled ? "opacity-50 cursor-not-allowed" : ""} 
        ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};