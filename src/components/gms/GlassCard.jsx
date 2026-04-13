import { cn } from "@/lib/utils";

export default function GlassCard({ children, className = "", onClick }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "glass rounded-2xl",
        onClick && "cursor-pointer glass-hover transition-all",
        className
      )}
    >
      {children}
    </div>
  );
}