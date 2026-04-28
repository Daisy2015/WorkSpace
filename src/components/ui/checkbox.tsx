import * as React from "react"
import { cn } from "../../lib/utils"

const Checkbox = React.forwardRef<HTMLButtonElement, { checked?: boolean, onCheckedChange?: (checked: boolean) => void, id?: string, className?: string }>(({ checked, onCheckedChange, id, className }, ref) => (
  <button
    type="button"
    role="checkbox"
    aria-checked={checked}
    onClick={() => onCheckedChange?.(!checked)}
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-slate-900 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-slate-900 data-[state=checked]:text-slate-50",
      checked ? "bg-slate-900 text-slate-50" : "bg-white",
      className
    )}
    id={id}
    ref={ref}
  >
    <span className="flex items-center justify-center text-current">
      {checked && <i className="fas fa-check text-[10px]"></i>}
    </span>
  </button>
))
Checkbox.displayName = "Checkbox"

export { Checkbox }
