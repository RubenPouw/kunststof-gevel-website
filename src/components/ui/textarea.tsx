import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full border border-[var(--color-border-strong)] bg-surface px-3 py-2.5 text-[15px] transition-colors duration-150 outline-none placeholder:text-[var(--color-text-muted)] focus:border-brand focus:shadow-[inset_0_0_0_1px_var(--color-focus)] disabled:cursor-not-allowed disabled:opacity-45 aria-invalid:border-kg-ink",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
