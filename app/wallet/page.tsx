"use client";

import { useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";

const mainStyle: CSSProperties = {
  marginLeft: 228,
  padding: "28px 32px",
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
};

const containerStyle: CSSProperties = {
  width: "100%",
  maxWidth: 560,
  textAlign: "center",
};

const titleStyle: CSSProperties = {
  fontSize: 24,
  fontWeight: 700,
  color: "#0D1117",
  letterSpacing: "-0.02em",
  marginBottom: 8,
};

const subtitleStyle: CSSProperties = {
  fontSize: 14,
  color: "#4B5563",
  marginBottom: 32,
};

const searchWrap: CSSProperties = {
  display: "flex",
  gap: 8,
  marginBottom: 32,
};

const inputStyle: CSSProperties = {
  flex: 1,
  padding: "14px 18px",
  border: "1px solid #E2E5EA",
  borderRadius: 8,
  fontSize: 14,
  fontFamily: "var(--font-dm-mono), monospace",
  outline: "none",
  color: "#0D1117",
  backgroundColor: "#FFFFFF",
};

const buttonStyle: CSSProperties = {
  padding: "14px 28px",
  backgroundColor: "#1A3FBF",
  color: "#FFFFFF",
  border: "none",
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const exampleTitle: CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: "#9CA3AF",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  marginBottom: 12,
};

const exampleAddr: CSSProperties = {
  display: "block",
  padding: "10px 14px",
  marginBottom: 6,
  backgroundColor: "#FFFFFF",
  border: "1px solid #E2E5EA",
  borderRadius: 6,
  fontFamily: "var(--font-dm-mono), monospace",
  fontSize: 12,
  color: "#1A3FBF",
  cursor: "pointer",
  textAlign: "left",
  textDecoration: "none",
  transition: "background 0.15s",
};

const exampleAddresses = [
  "0x0000000000000000000000000000000000000000",
  "0xdead000000000000000000000000000000000000",
  "0x742d35Cc6634C0532925a3b844Bc9e7595f5bA16",
];

export default function WalletSearchPage() {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  function handleSearch() {
    const trimmed = input.trim();
    if (!trimmed.startsWith("0x") || trimmed.length !== 42) {
      setError("Adresse invalide. Format attendu : 0x... (42 caracteres)");
      return;
    }
    setError("");
    router.push(`/wallet/${trimmed}`);
  }

  return (
    <>
      <Sidebar />
      <main style={mainStyle}>
        <div style={containerStyle}>
          <h1 style={titleStyle}>Wallet Explorer</h1>
          <p style={subtitleStyle}>
            Recherchez une adresse pour voir sa balance USDC et son historique de transactions
            sur Arc Testnet.
          </p>

          <div style={searchWrap}>
            <input
              style={inputStyle}
              placeholder="Entrer une adresse Arc 0x..."
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button style={buttonStyle} onClick={handleSearch}>
              Analyser
            </button>
          </div>

          {error && (
            <div style={{ color: "#DC2626", fontSize: 12, marginBottom: 24 }}>
              {error}
            </div>
          )}

          <div style={exampleTitle}>Adresses exemple</div>
          {exampleAddresses.map((addr) => (
            <a
              key={addr}
              href={`/wallet/${addr}`}
              style={exampleAddr}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F8F9FB")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#FFFFFF")}
            >
              {addr}
            </a>
          ))}
        </div>
      </main>
    </>
  );
}
