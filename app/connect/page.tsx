"use client";

import { type CSSProperties, useState, useCallback } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AddToWalletButton } from "@/components/AddToWalletButton";

const M: CSSProperties = { marginLeft: 228, padding: "28px 32px", minHeight: "100vh", maxWidth: 1200 };
const pageTitle: CSSProperties = { fontSize: 22, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em", marginBottom: 4 };
const pageSub: CSSProperties = { fontSize: 14, color: "var(--text-mid)", marginBottom: 32 };
const secTitle: CSSProperties = { fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 8 };
const secSub: CSSProperties = { fontSize: 13, color: "var(--text-mid)", marginBottom: 20 };
const section: CSSProperties = { marginBottom: 36 };

const primaryBtn: CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 8,
  padding: "14px 28px", backgroundColor: "var(--blue)", color: "#FFFFFF",
  border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer",
};

const outlineBtn: CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 6,
  padding: "12px 24px", backgroundColor: "var(--surf)", color: "var(--blue)",
  border: "1px solid var(--blue-bd)", borderRadius: 8, fontSize: 13, fontWeight: 600,
  cursor: "pointer", textDecoration: "none",
};

const tbl: CSSProperties = { width: "100%", borderCollapse: "collapse" };
const thCell: CSSProperties = { textAlign: "left", padding: "8px 12px", fontWeight: 600, fontSize: 10, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: "2px solid var(--border)" };
const tdCell: CSSProperties = { padding: "12px 12px", borderBottom: "1px solid var(--border)", fontSize: 13 };
const mono: CSSProperties = { fontFamily: "var(--font-dm-mono), monospace" };

const walletGrid: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 };
const walletCard: CSSProperties = { display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", backgroundColor: "var(--surf)", border: "1px solid var(--border)", borderRadius: 8 };

const resourceGrid: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 };
const resourceCard: CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", backgroundColor: "var(--surf)", border: "1px solid var(--border)", borderRadius: 8, textDecoration: "none", transition: "background 0.12s" };

const infoBox: CSSProperties = { padding: "14px 18px", backgroundColor: "var(--blue-lt)", borderRadius: 8, fontSize: 13, color: "var(--text-mid)", border: "1px solid var(--blue-bd)" };

const networkParams = [
  { param: "Network Name", value: "Arc Testnet" },
  { param: "RPC URL", value: "https://rpc.testnet.arc.network" },
  { param: "Chain ID", value: "5042002" },
  { param: "Currency Symbol", value: "USDC" },
  { param: "Block Explorer", value: "https://testnet.arcscan.app" },
];

const wallets = [
  { name: "MetaMask", color: "#E2761B" },
  { name: "Rabby", color: "#7C6CF0" },
  { name: "Rainbow", color: "#001E59" },
  { name: "Coinbase Wallet", color: "#0052FF" },
  { name: "Ledger", color: "#000000" },
  { name: "Fireblocks", color: "#FF6F21" },
];

const resources = [
  { label: "Documentation Arc", url: "https://docs.arc.io" },
  { label: "Explorer officiel", url: "https://testnet.arcscan.app" },
  { label: "GitHub Circle", url: "https://github.com/circlefin" },
  { label: "Community Arc", url: "https://arc.io/community" },
];

function CopyCell({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(() => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <button
      onClick={copy}
      style={{
        padding: "4px 10px", border: "1px solid var(--border)", borderRadius: 4,
        fontSize: 11, fontWeight: 600, cursor: "pointer",
        backgroundColor: copied ? "var(--green)" : "var(--surf)",
        color: copied ? "#FFF" : "var(--text-mid)",
        transition: "all 0.15s",
        minWidth: 60,
      }}
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export default function ConnectPage() {
  return (
    <>
      <Sidebar />
      <main style={M}>
        <h1 style={pageTitle}>Connect to Arc Testnet</h1>
        <p style={pageSub}>Tout ce qu'il faut pour connecter ton wallet et commencer a interagir avec Arc.</p>

        {/* Section 1: Auto-add */}
        <div style={section}>
          <Card>
            <h2 style={secTitle}>Ajouter Arc Testnet a ton Wallet</h2>
            <p style={secSub}>Un clic pour configurer automatiquement Arc Testnet dans MetaMask ou tout wallet compatible EIP-3085.</p>
            <AddToWalletButton />
          </Card>
        </div>

        {/* Section 2: Manual config */}
        <div style={section}>
          <Card style={{ padding: 0 }}>
            <div style={{ padding: "16px 20px 0" }}>
              <h2 style={{ ...secTitle, marginBottom: 4 }}>Configuration manuelle</h2>
              <p style={{ ...secSub, marginBottom: 16 }}>Copie ces parametres dans les reglages reseau de ton wallet.</p>
            </div>
            <table style={tbl}>
              <thead>
                <tr>
                  <th style={thCell}>Parametre</th>
                  <th style={thCell}>Valeur</th>
                  <th style={{ ...thCell, textAlign: "right", width: 80 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {networkParams.map((p) => (
                  <tr key={p.param}>
                    <td style={{ ...tdCell, fontWeight: 500, color: "var(--text)" }}>{p.param}</td>
                    <td style={{ ...tdCell, ...mono, color: "var(--text-mid)", fontSize: 12 }}>{p.value}</td>
                    <td style={{ ...tdCell, textAlign: "right" }}><CopyCell text={p.value} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>

        {/* Section 3: Faucet */}
        <div style={section}>
          <Card>
            <h2 style={secTitle}>Obtenir des USDC de test</h2>
            <p style={secSub}>Le faucet Circle distribue du USDC testnet gratuit pour experimenter sur Arc.</p>
            <a
              href="https://faucet.circle.com/"
              target="_blank"
              rel="noopener noreferrer"
              style={outlineBtn}
            >
              Ouvrir le Faucet Circle
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M4 1h7v7M11 1L4 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </a>
            <div style={{ ...infoBox, marginTop: 16 }}>
              Les USDC testnet n'ont aucune valeur reelle. Ils servent uniquement a tester les interactions sur Arc Testnet.
            </div>
          </Card>
        </div>

        {/* Section 4: Compatible wallets */}
        <div style={section}>
          <h2 style={secTitle}>Wallets compatibles</h2>
          <p style={secSub}>Arc Testnet fonctionne avec tout wallet EVM standard.</p>
          <div style={walletGrid}>
            {wallets.map((w) => (
              <div key={w.name} style={walletCard}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8, backgroundColor: w.color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#FFF", fontSize: 14, fontWeight: 700, flexShrink: 0,
                }}>
                  {w.name.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{w.name}</div>
                </div>
                <Badge variant="success">Compatible</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: Resources */}
        <div style={section}>
          <h2 style={secTitle}>Ressources utiles</h2>
          <p style={secSub}>Documentation, code source et communaute.</p>
          <div style={resourceGrid}>
            {resources.map((r) => (
              <a
                key={r.label}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                style={resourceCard}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "#F8F9FB"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "var(--surf)"}
              >
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{r.label}</span>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 2h7v7M12 2L5 9" stroke="var(--text-dim)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </a>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
