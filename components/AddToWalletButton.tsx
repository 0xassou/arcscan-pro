"use client";

import { useState, type CSSProperties } from "react";

type Status = "idle" | "loading" | "success" | "error";

const ARC_CHAIN_PARAMS = {
  chainId: "0x4CEF52",
  chainName: "Arc Testnet",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
  rpcUrls: ["https://rpc.testnet.arc.network"],
  blockExplorerUrls: ["https://testnet.arcscan.app"],
};

const colors: Record<Status, { bg: string; text: string; border: string }> = {
  idle: { bg: "#1B4DDB", text: "#FFFFFF", border: "#1B4DDB" },
  loading: { bg: "#1B4DDB", text: "#FFFFFF", border: "#1B4DDB" },
  success: { bg: "#16A34A", text: "#FFFFFF", border: "#16A34A" },
  error: { bg: "#FFFFFF", text: "#DC2626", border: "#DC2626" },
};

const WalletIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <rect x="2" y="4" width="16" height="13" rx="2" stroke="currentColor" strokeWidth="1.6" />
    <path d="M2 8h16" stroke="currentColor" strokeWidth="1.6" />
    <rect x="13" y="11" width="3" height="2" rx="0.5" fill="currentColor" />
  </svg>
);

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M4 9.5L7.5 13L14 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SpinnerIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ animation: "spin 1s linear infinite" }}>
    <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="2" strokeDasharray="30 14" strokeLinecap="round" />
  </svg>
);

export function AddToWalletButton() {
  const [status, setStatus] = useState<Status>("idle");

  async function handleClick() {
    if (status === "loading" || status === "success") return;

    const w = typeof window !== "undefined" ? (window as unknown as Record<string, unknown>) : null;

    if (!w || !w.ethereum) {
      setStatus("error");
      alert("MetaMask n'est pas installe. Telecharge-le sur metamask.io");
      setTimeout(() => setStatus("idle"), 3000);
      return;
    }

    try {
      setStatus("loading");
      const eth = w.ethereum as { request: (args: Record<string, unknown>) => Promise<void> };
      await eth.request({
        method: "wallet_addEthereumChain",
        params: [ARC_CHAIN_PARAMS],
      });
      setStatus("success");
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  }

  const c = colors[status];

  const btnStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    padding: "16px 32px",
    backgroundColor: c.bg,
    color: c.text,
    border: `2px solid ${c.border}`,
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 700,
    cursor: status === "loading" ? "wait" : "pointer",
    transition: "all 0.2s",
    opacity: status === "loading" ? 0.85 : 1,
  };

  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <button style={btnStyle} onClick={handleClick}>
        {status === "idle" && <><WalletIcon /> Ajouter Arc Testnet a MetaMask</>}
        {status === "loading" && <><SpinnerIcon /> Confirmation dans MetaMask...</>}
        {status === "success" && <><CheckIcon /> Arc Testnet ajoute</>}
        {status === "error" && <>MetaMask non detecte</>}
      </button>
    </>
  );
}
