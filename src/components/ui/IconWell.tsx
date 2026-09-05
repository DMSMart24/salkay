import type { LucideIcon } from "lucide-react";

type IconWellProps = {
  icon: LucideIcon;
  tone?: "paper" | "navy";
};

export function IconWell({ icon: Icon, tone = "paper" }: IconWellProps) {
  return (
    <span
      className={`atelier-icon-well${tone === "navy" ? " atelier-icon-well-navy" : ""}`}
      aria-hidden
    >
      <Icon size={24} strokeWidth={1.5} />
    </span>
  );
}
