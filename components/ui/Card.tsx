import { type CSSProperties, type ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  style?: CSSProperties;
}

const baseStyle: CSSProperties = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E2E5EA",
  borderRadius: 8,
  padding: "20px 24px",
};

export function Card({ children, style }: CardProps) {
  return <div style={{ ...baseStyle, ...style }}>{children}</div>;
}
