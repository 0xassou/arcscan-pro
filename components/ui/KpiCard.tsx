import { type CSSProperties } from "react";
import { Card } from "./Card";

interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  loading?: boolean;
}

const labelStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 500,
  color: "#9CA3AF",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  marginBottom: 6,
};

const valueStyle: CSSProperties = {
  fontSize: 24,
  fontWeight: 700,
  color: "#0D1117",
  fontFamily: "var(--font-dm-mono), monospace",
  lineHeight: 1.2,
};

const subStyle: CSSProperties = {
  fontSize: 12,
  color: "#4B5563",
  marginTop: 4,
};

export function KpiCard({ label, value, sub, loading }: KpiCardProps) {
  return (
    <Card>
      <div style={labelStyle}>{label}</div>
      <div style={valueStyle}>
        {loading ? (
          <span style={{ color: "#9CA3AF" }}>--</span>
        ) : (
          value
        )}
      </div>
      {sub && <div style={subStyle}>{sub}</div>}
    </Card>
  );
}
