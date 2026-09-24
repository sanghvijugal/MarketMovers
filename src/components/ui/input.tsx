import * as React from "react";
import { cn } from "@/lib/utils";

// text-base (16px) on mobile stops iOS zooming into the field on focus.
export const fieldClasses =
  "w-full min-w-0 rounded-md border border-input bg-card px-3 text-base text-foreground shadow-xs outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-muted-foreground/80 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 aria-invalid:border-destructive aria-invalid:ring-destructive/15 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return <input type={type} data-slot="input" className={cn(fieldClasses, "h-10", className)} {...props} />;
}

export { Input };
