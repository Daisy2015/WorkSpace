import * as React from "react"
import { cn } from "../../lib/utils"

const RadioGroup = React.forwardRef<HTMLDivElement, { value?: string, onValueChange?: (value: string) => void, children: React.ReactNode, className?: string }>(({ value, onValueChange, children, className }, ref) => (
  <div className={cn("grid gap-2", className)} ref={ref}>
    {React.Children.map(children, child => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child as React.ReactElement<any>, { selectedValue: value, onValueChange })
      }
      return child
    })}
  </div>
))
RadioGroup.displayName = "RadioGroup"

const RadioGroupItem = React.forwardRef<HTMLButtonElement, { value: string, id?: string, className?: string, selectedValue?: string, onValueChange?: (value: string) => void }>(({ value, id, className, selectedValue, onValueChange }, ref) => {
  const isChecked = selectedValue === value
  return (
    <button
      type="button"
      role="radio"
      aria-checked={isChecked}
      onClick={() => onValueChange?.(value)}
      className={cn(
        "aspect-square h-4 w-4 rounded-full border border-slate-900 text-slate-900 ring-offset-white focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        isChecked ? "bg-slate-900" : "bg-white",
        className
      )}
      id={id}
      ref={ref}
    >
      {isChecked && (
        <span className="flex items-center justify-center">
            <div className="h-1.5 w-1.5 fill-current bg-white rounded-full" />
        </span>
      )}
    </button>
  )
})
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }
