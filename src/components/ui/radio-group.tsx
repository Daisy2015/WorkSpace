import * as React from "react"
import { cn } from "../../lib/utils"

const RadioGroupContext = React.createContext<{ value?: string, onValueChange?: (value: string) => void }>({})

const RadioGroup = React.forwardRef<HTMLDivElement, { value?: string, onValueChange?: (value: string) => void, children: React.ReactNode, className?: string }>(({ value, onValueChange, children, className }, ref) => (
  <RadioGroupContext.Provider value={{ value, onValueChange }}>
    <div className={cn("grid gap-2", className)} ref={ref}>
      {children}
    </div>
  </RadioGroupContext.Provider>
))
RadioGroup.displayName = "RadioGroup"

const RadioGroupItem = React.forwardRef<HTMLButtonElement, { value: string, id?: string, className?: string }>(({ value, id, className }, ref) => {
  const { value: selectedValue, onValueChange } = React.useContext(RadioGroupContext)
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
