import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "min-h-11 w-full min-w-0 border border-[var(--color-border-strong)] bg-surface px-3 py-2.5 text-[15px] transition-colors duration-150 outline-none placeholder:text-[var(--color-text-muted)] focus:border-brand focus:shadow-[inset_0_0_0_1px_var(--color-focus)] disabled:cursor-not-allowed disabled:opacity-45 aria-invalid:border-kg-ink",
        className
      )}
      {...props}
    />
  )
}

export { Input }
