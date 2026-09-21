import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center border text-[15px] leading-none font-medium whitespace-nowrap transition-colors duration-150 outline-none select-none disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-kg-navy text-kg-kalk hover:bg-kg-navy-2",
        primary:
          "border-transparent bg-kg-navy text-kg-kalk hover:bg-kg-navy-2",
        secondary:
          "border-kg-navy bg-transparent text-kg-navy hover:bg-kg-kalk",
        tertiary:
          "border-kg-navy bg-transparent text-kg-navy hover:bg-kg-kalk",
        outline:
          "border-kg-navy bg-transparent text-kg-navy hover:bg-kg-kalk",
        ghost: "border-transparent bg-transparent text-kg-navy hover:bg-kg-kalk",
        link: "border-0 bg-transparent p-0 text-kg-navy underline underline-offset-4 hover:text-kg-navy",
        destructive:
          "border-kg-navy bg-transparent text-kg-navy hover:bg-kg-kalk",
        signal:
          "border-transparent bg-kg-signal text-kg-navy hover:bg-kg-signal",
        "on-dark":
          "border-[var(--kg-grind)] bg-transparent text-kg-kalk hover:bg-kg-navy-2",
      },
      size: {
        default: "h-12 min-h-11 px-[18px]",
        xs: "h-10 min-h-10 px-3 text-[13px]",
        sm: "h-11 min-h-11 px-3.5 text-[14px]",
        lg: "h-12 min-h-11 px-5",
        icon: "size-11",
        "icon-xs": "size-11",
        "icon-sm": "size-11",
        "icon-lg": "size-11",
      },
      block: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      block: false,
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  block = false,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, block, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
