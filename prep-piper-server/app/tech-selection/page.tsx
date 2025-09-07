import TechStackForm from "@/components/tech-selection/tech-stack-form"
import { cn } from "@/lib/utils"

export default function TechSelectionPage() {
  return (
    <main className="relative flex min-h-screen w-full items-center justify-center bg-white dark:bg-black">
         {/* Grid lines */}
         <div
           className={cn(
             "absolute inset-0",
             "[background-size:40px_40px]",
             "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e7_1px,transparent_1px)]",
             "dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]"
           )}
         />
   
     {/* Radial fade overlay */}
         <div className="pointer-events-none absolute inset-0 bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black" />
   
         {/* Your landing content */}
         <div className="relative z-10 max-w-8xl px-6 py-20 text-center">
      <TechStackForm />
      </div>
    </main>
  )
}
