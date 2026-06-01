"use client";

import { type CSSProperties } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { Card } from "@/components/ui/Card";
import { LiveDot } from "@/components/ui/LiveDot";
import { Badge } from "@/components/ui/Badge";
import { useBlocks, type BlockSummary } from "@/hooks/useBlocks";

const M: CSSProperties = { marginLeft: 228, padding: "28px 32px", minHeight: "100vh" };
const mono: CSSProperties = { fontFamily: "var(--font-dm-mono), monospace" };
const header: CSSProperties = { display: "flex", alignItems: "center", gap: 12, marginBottom: 24 };
const title: CSSProperties = { fontSize: 20, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em" };

const tbl: CSSProperties = { width: "100%", borderCollapse: "collapse", fontSize: 13 };
const th: CSSProperties = { textAlign: "left", padding: "8px 10px", fontWeight: 600, fontSize: 10, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: "2px solid var(--border)" };
const td: CSSProperties = { padding: "10px 10px", borderBottom: "1px solid var(--border)", color: "var(--text)", fontSize: 12 };

function shortenHash(h: string) { return h.slice(0, 10) + "..." + h.slice(-6); }
function timeAgo(ts: number) { const d = Math.floor(Date.now() / 1000) - ts; if (d < 0) return "just now"; if (d < 60) return `${d}s ago`; if (d < 3600) return `${Math.floor(d / 60)}m ago`; return `${Math.floor(d / 3600)}h ago`; }
function gasPercent(u: string, l: string) { const lv = Number(l); return lv === 0 ? "0%" : ((Number(u) / lv) * 100).toFixed(1) + "%"; }

export default function BlocksPage() {
  const { data: blocks, isLoading } = useBlocks();

  return (
    <>
      <Sidebar />
      <main style={M}>
        <div style={header}>
          <h1 style={title}>Blocks</h1>
          <LiveDot />
        </div>

        <Card style={{ padding: 0 }}>
          {isLoading ? (
            <div style={{ padding: 48, textAlign: "center", color: "var(--text-dim)", fontSize: 13 }}>Loading blocks...</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={tbl}>
                <thead>
                  <tr>
                    <th style={th}>Block</th>
                    <th style={th}>Hash</th>
                    <th style={th}>Validator</th>
                    <th style={{ ...th, textAlign: "center" }}>Txns</th>
                    <th style={{ ...th, textAlign: "right" }}>Gas Used</th>
                    <th style={{ ...th, textAlign: "right" }}>Gas Limit</th>
                    <th style={{ ...th, textAlign: "right" }}>Usage</th>
                    <th style={{ ...th, textAlign: "right" }}>Age</th>
                  </tr>
                </thead>
                <tbody>
                  {(blocks ?? []).map((b: BlockSummary) => (
                    <tr key={b.number} onMouseEnter={e => e.currentTarget.style.backgroundColor = "#F8F9FB"} onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                      <td style={td}>
                        <Link href={`/blocks/${b.number}`} style={{ fontWeight: 600, color: "var(--blue)", textDecoration: "none" }}>
                          #{b.number.toLocaleString()}
                        </Link>
                      </td>
                      <td style={{ ...td, ...mono, color: "var(--text-mid)" }}>{shortenHash(b.hash)}</td>
                      <td style={{ ...td, ...mono, color: "var(--text-mid)", fontSize: 11 }}>
                        <Link href={`/wallet/${b.miner}`} style={{ color: "var(--text-mid)", textDecoration: "none" }}>{shortenHash(b.miner)}</Link>
                      </td>
                      <td style={{ ...td, textAlign: "center" }}>
                        <Badge variant={b.transactionCount > 0 ? "info" : "default"}>{b.transactionCount}</Badge>
                      </td>
                      <td style={{ ...td, ...mono, textAlign: "right", color: "var(--text-mid)", fontSize: 11 }}>{Number(b.gasUsed).toLocaleString()}</td>
                      <td style={{ ...td, ...mono, textAlign: "right", color: "var(--text-dim)", fontSize: 11 }}>{Number(b.gasLimit).toLocaleString()}</td>
                      <td style={{ ...td, textAlign: "right" }}><Badge variant="success">{gasPercent(b.gasUsed, b.gasLimit)}</Badge></td>
                      <td style={{ ...td, textAlign: "right", color: "var(--text-dim)", fontSize: 11 }}>{timeAgo(b.timestamp)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </main>
    </>
  );
}
