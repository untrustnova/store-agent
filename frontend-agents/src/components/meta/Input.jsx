import { cn } from "../../lib/utils"

export default function Input({ icon, classNameOut, className, error, ...other }) {
  return <div className={cn("w-full bg-ba-input-bg text-ba-input-text border rounded-sm overflow-hidden flex items-center justify-between transition-colors", 
    error ? "border-red-500 shadow-[0_0_0_1px_rgba(239,68,68,0.5)]" : "border-ba-input-border",
    classNameOut
  )}>
    {icon&&<div className="w-[37px] flex items-center justify-center">
      {icon}
    </div>}
    <input className={cn("text-sm bg-transparent outline-none p-1.5 px-3 text-center",(icon?"w-[calc(100%-37px)] pl-0.5":"w-full"), className)} {...other}/>
  </div>
}