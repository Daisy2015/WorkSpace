import * as React from "react"
import { cn } from "../../lib/utils"

const TabsContext = React.createContext<{ value: string, onValueChange: (v: string) => void }>({ value: '', onValueChange: () => {} })

const Tabs = ({ defaultValue, value: controlledValue, onValueChange: controlledOnChange, children, className }: any) => {
    const [value, setValue] = React.useState(defaultValue)
    const activeValue = controlledValue !== undefined ? controlledValue : value
    const onChange = controlledOnChange !== undefined ? controlledOnChange : setValue

    return (
        <TabsContext.Provider value={{ value: activeValue, onValueChange: onChange }}>
            <div className={cn("w-full", className)}>{children}</div>
        </TabsContext.Provider>
    )
}

const TabsList = ({ children, className }: any) => (
    <div className={cn("inline-flex h-10 items-center justify-center rounded-md bg-slate-100 p-1 text-slate-500", className)}>
        {children}
    </div>
)

const TabsTrigger = ({ value, children, className }: any) => {
    const { value: activeValue, onValueChange } = React.useContext(TabsContext)
    const isActive = activeValue === value
    return (
        <button
            onClick={() => onValueChange(value)}
            className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                isActive ? "bg-white text-slate-950 shadow-sm" : "hover:text-slate-900",
                className
            )}
        >
            {children}
        </button>
    )
}

const TabsContent = ({ value, children, className }: any) => {
    const { value: activeValue } = React.useContext(TabsContext)
    if (activeValue !== value) return null
    return <div className={cn("mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2", className)}>{children}</div>
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
