import { Zap } from "lucide-react";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 font-extrabold tracking-tight ${className}`}>
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-brand shadow-glow">
        <Zap className="h-4 w-4 text-white" strokeWidth={3} />
      </span>
      <span className="text-xl">ZENITH</span>
    </div>
  );
}
