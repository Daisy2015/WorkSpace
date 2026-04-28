import * as React from "react"
import { cn } from "../../lib/utils"

const Slider = React.forwardRef<HTMLInputElement, any>(({ className, value, onValueChange, min = 0, max = 100, step = 1, ...props }, ref) => {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value[0]}
      onChange={(e) => onValueChange([parseFloat(e.target.value)])}
      className={cn(
        "relative flex w-full touch-none select-none items-center h-5 cursor-pointer accent-slate-900",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Slider.displayName = "Slider"

export { Slider }
