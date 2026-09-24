import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

// Shared by button.tsx (React islands) and plain .astro markup, so links
// that look like buttons don't need React.
const variants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap select-none transition-[background-color,border-color,color,transform] duration-150 ease-out outline-none focus-visible:ring-3 focus-visible:ring-ring/35 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-[18px]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline: "border border-input bg-card text-foreground hover:bg-muted",
        ghost: "text-foreground hover:bg-muted",
        link: "text-primary underline-offset-4 hover:underline active:scale-100",
        inverse: "border border-inverse-foreground/25 text-inverse-foreground hover:bg-inverse-foreground/10",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-9 px-3",
        lg: "h-11 px-5 text-[15px]",
        icon: "size-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export type ButtonVariantProps = VariantProps<typeof variants>;

/** Class string for a button; extra `class`/`className` wins over the base
 *  (e.g. "hidden sm:inline-flex") via tailwind-merge. */
export function buttonVariants({
  class: extra,
  className,
  ...props
}: ButtonVariantProps & { class?: string; className?: string } = {}) {
  return twMerge(variants(props), extra, className);
}
