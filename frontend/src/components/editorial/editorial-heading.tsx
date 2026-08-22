import React from "react";
import { cn } from "@/lib/utils";

interface EditorialHeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  variant?: "serif" | "sans";
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

export function EditorialHeading({
  variant = "serif",
  as: Component = "h2",
  className,
  children,
  ...props
}: EditorialHeadingProps) {
  return (
    <Component
      className={cn(
        variant === "serif" ? "font-serif font-light text-[#020202]" : "font-sans font-normal text-[#020202]",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
