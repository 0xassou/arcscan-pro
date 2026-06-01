import { type CSSProperties, type ReactNode } from "react";

type BadgeVariant = "default" | "success" | "warning" | "info";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
}

const variantColors: Record<BadgeVariant, { bg: string; color: string }> = {
  default: { bg: "#F3F4F6", color: "#4B5563" },
  success: { bg: "#ECFDF5", color: "#059669" },
  warning: { bg: "#FFFBEB", color: "#D97706" },
  info: { bg: "#EFF6FF", color: "#1A3FBF" },
};

export function Badge({ children, variant = "default" }: BadgeProps) {
  const colors = variantColors[variant];
  const style: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    padding: "2px 8px",
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 600,
    backgroundColor: colors.bg,
    color: colors.color,
    lineHeight: "18px",
  };
  return <span style={style}>{children}</span>;
}
