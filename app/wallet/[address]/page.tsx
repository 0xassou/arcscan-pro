"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, type CSSProperties, useCallback } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table } from "@/components/ui/Table";
import { useWallet, type WalletTransaction } from "@/hooks/useWallet";

const M: CSSProperties = { marginLeft: 228, padding: "28px 32px", minHeight: "100vh" };
const mono: CSSProperties = { fontFamily: "var(--font-dm-mono), monospace" };

const headerRow: CSSProperties = { display: "flex", alignItems: "center", gap: 16, marginBottom: 24 };
const avatar: CSSProperties = {
  width: 40, height: 40, borderRadius: 8,
  background: "linear-gradient(135deg, var(--blue), var(--violet))",
  display: "flex", alignItems: "center", justifyContent: "center",
  color: "#FFF", fontSize: 16, fontWeight: 700, flexShrink: 0,
};
const addrFull: CSSProperties = { ...mono, fontSize: 13, color: "var(--text)", wordBreak: "break-all" };
const addrSub: CSSProperties = { fontSize: 11, color: "var(--text-dim)", marginTop: 2 };

const copyBtn: CSSProperties = {
  marginLeft: 8, padding: "2px 8px", border: "1px solid var(--border)",
  borderRadius: 4, fontSize: 10, fontWeight: 600, color: "var(--text-dim)",
  backgroundColor: "var(--surf)", cursor: "pointer",
};

const searchWrap: CSSProperties = { display: "flex", gap: 8, marginBottom: 24 };
const inputStyle: CSSProperties = {
  flex: 1, padding: "10px 14px", border: "1px solid var(--border)",
  borderRadius: 6, fontSize: 13, ...mono, outline: "none",
  color: "var(--text)", backgroundColor: "var(--surf)",
};
const btnStyle: CSSProperties = {
  padding: "10px 20px", backgroundColor: "var(--blue)", color: "#FFF",
  border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer",
};

const kpiGrid: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 };
const kpiLabel: CSSProperties = { fontSize: 10, fontWeight: 600, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 };
const kpiValue: CSSProperties = { fontSize: 24, fontWeight: 700, color: "var(--text)", ...mono, lineHeight: 1.1 };
const kpiSub: CSSProperties = { fontSize: 11, color: "var(--text-mid)", marginTop: 4 };

const secTitle: CSSProperties = { fontSize: 11, fontWeight: 600, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 };

const noteStyle: CSSProperties = {
  marginTop: 16, padding: "12px 16px", backgroundColor: "var(--blue-lt)",
  borderRadius: 6, border: "1px solid var(--blue-bd)",
  fontSize: 12, color: "var(--text-mid)",
};

function shortenHash(h: string) { return h.slice(0, 10) + "..." + h.slice(-8); }
function shortenAddr(a: string) { return a.slice(0, 8) + "..." + a.slice(-6); }

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(() => {
    navigator.clipboard.writeText(text); setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);
  return <button style={copyBtn} onClick={copy}>{copied ? "Copied" : "Copy"}</button>;
}

function getTxColumns(walletAddr: string) {
  return [
    {
      key: "type",
      header: "Type",
      render: (row: WalletTransaction) => {
        const isSend = row.from.toLowerCase() === walletAddr.toLowerCase();
        return <Badge variant={isSend ? "warning" : "success"}>{isSend ? "Sent" : "Received"}</Badge>;
      },
    },
    {
      key: "hash",
      header: "Hash",
      mono: true,
      render: (row: WalletTransaction) => (
        <Link href={`/tx/${row.hash}`} style={{ color: "var(--blue)", fontWeight: 500, textDecoration: "none" }}>{shortenHash(row.hash)}</Link>
      ),
    },
    {
      key: "from",
      header: "From",
      mono: true,
      render: (row: WalletTransaction) => (
        <Link href={`/wallet/${row.from}`} style={{ color: "var(--text-mid)", textDecoration: "none", fontSize: 11 }}>{shortenAddr(row.from)}</Link>
      ),
    },
    {
      key: "to",
      header: "To",
      mono: true,
      render: (row: WalletTransaction) => (
        row.to
          ? <Link href={`/wallet/${row.to}`} style={{ color: "var(--text-mid)", textDecoration: "none", fontSize: 11 }}>{shortenAddr(row.to)}</Link>
          : <span style={{ color: "var(--text-dim)" }}>--</span>
      ),
    },
    {
      key: "value",
      header: "Value (USDC)",
      align: "right" as const,
      mono: true,
      render: (row: WalletTransaction) => {
        const v = parseFloat(row.value);
        return <span style={{ color: v > 0 ? "var(--green)" : "var(--text)" }}>{v.toFixed(4)}</span>;
      },
    },
    {
      key: "block",
      header: "Block",
      align: "right" as const,
      render: (row: WalletTransaction) => (
        <Link href={`/blocks/${row.blockNumber}`} style={{ color: "var(--blue)", fontWeight: 500, textDecoration: "none" }}>
          #{row.blockNumber.toLocaleString()}
        </Link>
      ),
    },
  ];
}

export default function WalletPage() {
  const params = useParams();
  const router = useRouter();
  const address = params.address as string;
  const [searchInput, setSearchInput] = useState("");

  const { data, isLoading } = useWallet(address);

  function handleSearch() {
    const trimmed = searchInput.trim();
    if (trimmed.startsWith("0x") && trimmed.length === 42) {
      router.push(`/wallet/${trimmed}`);
    }
  }

  const initials = address.slice(2, 4).toUpperCase();
  const hasRecentActivity = (data?.recentTransactions.length ?? 0) > 0;

  return (
    <>
      <Sidebar />
      <main style={M}>
        <div style={searchWrap}>
          <input
            style={inputStyle}
            placeholder="Search another wallet address (0x...)"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button style={btnStyle} onClick={handleSearch}>Search</button>
        </div>

        <div style={headerRow}>
          <div style={avatar}>{initials}</div>
          <div>
            <div style={addrFull}>
              {address}
              <CopyButton text={address} />
            </div>
            <div style={addrSub}>Arc Testnet</div>
          </div>
        </div>

        <div style={kpiGrid}>
          <Card style={{ padding: "14px 18px", borderTop: "3px solid var(--green)" }}>
            <div style={kpiLabel}>Balance (USDC)</div>
            <div style={kpiValue}>{isLoading ? "--" : parseFloat(data?.balance ?? "0").toFixed(6)}</div>
          </Card>
          <Card style={{ padding: "14px 18px", borderTop: "3px solid var(--blue)" }}>
            <div style={kpiLabel}>Transactions</div>
            <div style={kpiValue}>{isLoading ? "--" : data?.transactionCount ?? 0}</div>
          </Card>
          <Card style={{ padding: "14px 18px", borderTop: "3px solid var(--violet)" }}>
            <div style={kpiLabel}>Recent Txns</div>
            <div style={kpiValue}>{isLoading ? "--" : data?.recentTransactions.length ?? 0}</div>
            <div style={kpiSub}>Last 20 blocks scanned</div>
          </Card>
          <Card style={{ padding: "14px 18px", borderTop: "3px solid var(--orange)" }}>
            <div style={kpiLabel}>Status</div>
            <div style={kpiValue}>
              {isLoading ? "--" : (
                <Badge variant={hasRecentActivity ? "success" : "default"}>
                  {hasRecentActivity ? "Active" : "Inactive"}
                </Badge>
              )}
            </div>
          </Card>
        </div>

        <Card style={{ padding: "16px 20px" }}>
          <div style={secTitle}>Recent Transactions</div>
          {data && data.recentTransactions.length === 0 && !isLoading ? (
            <div style={{ padding: 32, textAlign: "center", color: "var(--text-dim)", fontSize: 13 }}>
              No transactions found in recent blocks for this address.
            </div>
          ) : (
            <Table
              columns={getTxColumns(address)}
              data={data?.recentTransactions ?? []}
              loading={isLoading}
            />
          )}
        </Card>

        <div style={noteStyle}>
          Donnees limitees au RPC public. Pour l'historique complet, voir{" "}
          <a
            href={`https://testnet.arcscan.app/address/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--blue)", fontWeight: 600 }}
          >
            testnet.arcscan.app
          </a>
        </div>
      </main>
    </>
  );
}
