import * as React from "react"
import { cn } from "../../lib/utils"

const SelectContext = React.createContext<{ value: string, onValueChange: (v: string) => void, open: boolean, setOpen: (o: boolean) => void }>({ value: '', onValueChange: () => {}, open: false, setOpen: () => {} })

const Select = ({ value, onValueChange, children }: any) => {
    const [open, setOpen] = React.useState(false)
    return (
        <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
            <div className="relative w-full">{children}</div>
        </SelectContext.Provider>
    )
}

const SelectTrigger = ({ children, className }: any) => {
    const { setOpen, open } = React.useContext(SelectContext)
    return (
        <button
            onClick={() => setOpen(!open)}
            className={cn(
                "flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
        >
            {children}
            <i className="fas fa-chevron-down opacity-50 text-[10px]"></i>
        </button>
    )
}

const SelectValue = ({ placeholder }: any) => {
    const { value } = React.useContext(SelectContext)
    return <span>{value || placeholder}</span>
}

const SelectContent = ({ children, className }: any) => {
    const { open, setOpen } = React.useContext(SelectContext)
    if (!open) return null
    return (
        <>
            <div className="fixed inset-0 z-50" onClick={() => setOpen(false)} />
            <div className={cn("absolute top-full z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-slate-200 bg-white p-1 text-slate-950 shadow-md animate-in fade-in zoom-in-95", className)}>
                {children}
            </div>
        </>
    )
}

const SelectItem = ({ value, children, className }: any) => {
    const { onValueChange, setOpen, value: currentValue } = React.useContext(SelectContext)
    const isSelected = currentValue === value
    return (
        <div
            onClick={() => { onValueChange(value); setOpen(false); }}
            className={cn(
                "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-slate-100 focus:bg-slate-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 cursor-pointer",
                className
            )}
        >
            <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                {isSelected && <i className="fas fa-check text-[10px]"></i>}
            </span>
            <span>{children}</span>
        </div>
    )
}

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
