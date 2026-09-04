import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center border text-[15px] leading-none font-semibold whitespace-nowrap transition-colors duration-150 outline-none select-none disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-action text-on-action hover:bg-action-hover",
        primary:
          "border-transparent bg-action text-on-action hover:bg-action-hover",
        secondary:
          "border-transparent bg-brand text-white hover:bg-brand-hover",
        tertiary:
          "border-[1.5px] border-kg-ink bg-transparent text-kg-ink hover:bg-tint",
        outline:
          "border-[1.5px] border-kg-ink bg-transparent text-kg-ink hover:bg-tint",
        ghost: "border-transparent bg-transparent text-kg-ink hover:bg-tint",
        link: "border-0 bg-transparent p-0 text-brand underline hover:text-brand-hover",
        destructive:
          "border-kg-ink bg-transparent text-kg-ink hover:bg-kg-offwhite",
      },
      size: {
        default: "min-h-11 px-[18px] py-3",
        xs: "min-h-11 px-3 py-2 text-[13px]",
        sm: "min-h-11 px-3.5 py-2.5 text-[14px]",
        lg: "min-h-11 px-5 py-3",
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
