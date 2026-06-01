"use client";

import { type CSSProperties } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { Card } from "@/components/ui/Card";
import { LiveDot } from "@/components/ui/LiveDot";
import { Badge } from "@/components/ui/Badge";
import { useTransactions, type TransactionSummary } from "@/hooks/useTransactions";

const M: CSSProperties = { marginLeft: 228, padding: "28px 32px", minHeight: "100vh" };
const mono: CSSProperties = { fontFamily: "var(--font-dm-mono), monospace" };
const header: CSSProperties = { display: "flex", alignItems: "center", gap: 12, marginBottom: 24 };
const title: CSSProperties = { fontSize: 20, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em" };

const tbl: CSSProperties = { width: "100%", borderCollapse: "collapse", fontSize: 13 };
const th: CSSProperties = { textAlign: "left", padding: "8px 10px", fontWeight: 600, fontSize: 10, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: "2px solid var(--border)" };
const td: CSSProperties = { padding: "10px 10px", borderBottom: "1px solid var(--border)", color: "var(--text)", fontSize: 12 };

function shortenHash(h: string) { return h.slice(0, 10) + "..." + h.slice(-6); }
function shortenAddr(a: string) { return a.slice(0, 8) + "..." + a.slice(-6); }

export default function TransactionsPage() {
  const { data: txs, isLoading } = useTransactions();
  const isEmpty = !isLoading && (!txs || txs.length === 0);

  return (
    <>
      <Sidebar />
      <main style={M}>
        <div style={header}>
          <h1 style={title}>Transactions</h1>
          <LiveDot label="Live Feed" />
        </div>

        <Card style={{ padding: 0 }}>
          {isLoading ? (
            <div style={{ padding: 48, textAlign: "center", color: "var(--text-dim)", fontSize: 13 }}>Loading transactions...</div>
          ) : isEmpty ? (
            <div style={{ padding: 48, textAlign: "center", color: "var(--text-dim)", fontSize: 13 }}>No transactions in the latest block. Waiting for new activity...</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={tbl}>
                <thead>
                  <tr>
                    <th style={th}>Tx Hash</th>
                    <th style={th}>From</th>
                    <th style={th}>To</th>
                    <th style={{ ...th, textAlign: "right" }}>Value (USDC)</th>
                    <th style={{ ...th, textAlign: "right" }}>Gas Price</th>
                    <th style={{ ...th, textAlign: "center" }}>Nonce</th>
                    <th style={{ ...th, textAlign: "right" }}>Block</th>
                  </tr>
                </thead>
                <tbody>
                  {(txs ?? []).map((tx: TransactionSummary) => {
                    const displayValue = tx.usdcValue ?? tx.value;
                    const numVal = parseFloat(displayValue);
                    return (
                      <tr key={tx.hash} onMouseEnter={e => e.currentTarget.style.backgroundColor = "#F8F9FB"} onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                        <td style={{ ...td, ...mono }}>
                          <Link href={`/tx/${tx.hash}`} style={{ color: "var(--blue)", fontWeight: 500, textDecoration: "none" }}>{shortenHash(tx.hash)}</Link>
                        </td>
                        <td style={{ ...td, ...mono, color: "var(--text-mid)", fontSize: 11 }}>
                          <Link href={`/wallet/${tx.from}`} style={{ color: "var(--text-mid)", textDecoration: "none" }}>{shortenAddr(tx.from)}</Link>
                        </td>
                        <td style={{ ...td, ...mono, color: "var(--text-mid)", fontSize: 11 }}>
                          {tx.to ? (
                            <Link href={`/wallet/${tx.to}`} style={{ color: "var(--text-mid)", textDecoration: "none" }}>{shortenAddr(tx.to)}</Link>
                          ) : (
                            <Badge variant="warning">Contract</Badge>
                          )}
                        </td>
                        <td style={{ ...td, ...mono, textAlign: "right", color: numVal > 0 ? "var(--green)" : "var(--text)" }}>
                          {numVal.toFixed(4)}
                          {tx.usdcValue && <span style={{ fontSize: 9, color: "var(--text-dim)", marginLeft: 3 }}>ERC20</span>}
                        </td>
                        <td style={{ ...td, ...mono, textAlign: "right", color: "var(--text-mid)", fontSize: 11 }}>
                          {parseFloat(tx.gasPrice).toFixed(3)} Gwei
                        </td>
                        <td style={{ ...td, textAlign: "center", color: "var(--text-dim)" }}>{tx.nonce}</td>
                        <td style={{ ...td, textAlign: "right" }}>
                          <Link href={`/blocks/${tx.blockNumber}`} style={{ color: "var(--blue)", fontWeight: 500, textDecoration: "none" }}>
                            #{tx.blockNumber.toLocaleString()}
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </main>
    </>
  );
}
