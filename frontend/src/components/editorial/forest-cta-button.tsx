import React, { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ForestCTAButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function ForestCTAButton({ children, className, ...props }: ForestCTAButtonProps) {
  return (
    <button
      className={cn(
        "bg-[#38a454] text-white px-8 py-3.5 rounded-[10px] text-sm font-normal hover:bg-[#2d9b4c] transition-opacity cursor-pointer inline-flex items-center gap-2",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
