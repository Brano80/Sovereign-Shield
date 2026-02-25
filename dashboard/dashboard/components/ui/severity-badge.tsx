import { cn } from "@/lib/utils";

interface SeverityBadgeProps {
  level: 1 | 2 | 3 | 4;
  label?: string;
}

export function SeverityBadge({ level, label }: SeverityBadgeProps) {
  const getColorClasses = (level: number) => {
    switch (level) {
      case 1:
        return "bg-blue-500/10 border-blue-500/30 text-blue-400";
      case 2:
        return "bg-amber-500/10 border-amber-500/30 text-amber-400";
      case 3:
        return "bg-orange-500/10 border-orange-500/30 text-orange-400";
      case 4:
        return "bg-red-500/10 border-red-500/30 text-red-400 animate-pulse";
      default:
        return "bg-gray-500/10 border-gray-500/30 text-gray-400";
    }
  };

  const getSeverityText = (level: number) => {
    switch (level) {
      case 1: return "Low";
      case 2: return "Medium";
      case 3: return "High";
      case 4: return "Critical";
      default: return "Unknown";
    }
  };

  return (
    <div
      className={cn(
        "backdrop-blur-sm px-2.5 py-0.5 rounded-full text-[11px] font-semibold border",
        getColorClasses(level)
      )}
    >
      {label || getSeverityText(level)}
    </div>
  );
}