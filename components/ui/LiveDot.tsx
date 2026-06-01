"use client";

import { type CSSProperties } from "react";

const wrapperStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
};

const dotOuter: CSSProperties = {
  position: "relative",
  width: 10,
  height: 10,
};

const dotInner: CSSProperties = {
  width: 10,
  height: 10,
  borderRadius: "50%",
  backgroundColor: "#10B981",
};

const pulseRing: CSSProperties = {
  position: "absolute",
  top: -3,
  left: -3,
  width: 16,
  height: 16,
  borderRadius: "50%",
  border: "2px solid #10B981",
  opacity: 0.4,
  animation: "livePulse 2s ease-in-out infinite",
};

const labelStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 500,
  color: "#10B981",
};

export function LiveDot({ label = "Live" }: { label?: string }) {
  return (
    <>
      <style>{`@keyframes livePulse { 0%, 100% { transform: scale(1); opacity: 0.4; } 50% { transform: scale(1.5); opacity: 0; } }`}</style>
      <span style={wrapperStyle}>
        <span style={dotOuter}>
          <span style={pulseRing} />
          <span style={dotInner} />
        </span>
        <span style={labelStyle}>{label}</span>
      </span>
    </>
  );
}
