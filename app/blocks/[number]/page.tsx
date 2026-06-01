"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { type CSSProperties } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const M: CSSProperties = { marginLeft: 228, padding: "28px 32px", minHeight: "100vh" };
const mono: CSSProperties = { fontFamily: "var(--font-dm-mono), monospace" };

const breadcrumb: CSSProperties = { fontSize: 12, color: "var(--text-mid)", marginBottom: 8 };
const bcLink: CSSProperties = { color: "var(--blue)", textDecoration: "none" };
const title: CSSProperties = { fontSize: 22, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em", marginBottom: 24 };

const infoGrid: CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 };
const row: CSSProperties = { display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid var(--border)", fontSize: 13 };
const lbl: CSSProperties = { color: "var(--text-mid)", fontWeight: 500 };
const val: CSSProperties = { color: "var(--text)", fontWeight: 600, ...mono, fontSize: 12, wordBreak: "break-all", maxWidth: "60%", textAlign: "right" };

const tbl: CSSProperties = { width: "100%", borderCollapse: "collapse" };
const th: CSSProperties = { textAlign: "left", padding: "7px 8px", fontWeight: 600, fontSize: 10, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: "2px solid var(--border)" };
const td: CSSProperties = { padding: "8px 8px", borderBottom: "1px solid var(--border)", fontSize: 12 };

const navRow: CSSProperties = { display: "flex", justifyContent: "space-between", marginBottom: 24 };
const navBtn: CSSProperties = { padding: "8px 16px", border: "1px solid var(--border)", borderRadius: 6, fontSize: 12, fontWeight: 600, color: "var(--blue)", backgroundColor: "var(--surf)", cursor: "pointer", textDecoration: "none" };

interface BlockTx { hash: string; from: string; to: string | null; value: string; gasPrice: string; nonce: number; transactionIndex: number; }
interface BlockDetail { number: number; hash: string; parentHash: string; timestamp: number; miner: string; gasUsed: string; gasLimit: string; baseFeePerGas: string | null; transactionCount: number; size: number | null; transactions: BlockTx[]; }

function shortenHash(h: string) { return h.slice(0, 12) + "..." + h.slice(-8); }
function shortenAddr(a: string) { return a.slice(0, 8) + "..." + a.slice(-6); }
function timeAgo(ts: number) { const d = Math.floor(Date.now() / 1000) - ts; if (d < 60) return `${d}s ago`; if (d < 3600) return `${Math.floor(d / 60)}m ago`; return `${Math.floor(d / 3600)}h ago`; }
function gasPercent(u: string, l: string) { const lv = Number(l); return lv === 0 ? "0%" : ((Number(u) / lv) * 100).toFixed(2) + "%"; }

export default function BlockDetailPage() {
  const { number } = useParams();
  const blockNum = Number(number);

  const { data, isLoading, error } = useQuery<BlockDetail>({
    queryKey: ["block-detail", blockNum],
    queryFn: async () => { const r = await fetch(`/api/blocks/${blockNum}`); if (!r.ok) throw new Error("Fetch failed"); return r.json(); },
    enabled: !isNaN(blockNum),
  });

  return (
    <>
      <Sidebar />
      <main style={M}>
        <div style={breadcrumb}>
          <Link href="/blocks" style={bcLink}>Blocks</Link>
          {" > "}
          <span>#{blockNum.toLocaleString()}</span>
        </div>
        <h1 style={title}>Block #{blockNum.toLocaleString()}</h1>

        <div style={navRow}>
          <Link href={`/blocks/${blockNum - 1}`} style={navBtn}>&larr; Previous Block</Link>
          <Link href={`/blocks/${blockNum + 1}`} style={navBtn}>Next Block &rarr;</Link>
        </div>

        {isLoading && <Card><div style={{ padding: 40, textAlign: "center", color: "var(--text-dim)" }}>Loading block data...</div></Card>}
        {error && <Card><div style={{ padding: 40, textAlign: "center", color: "var(--red)" }}>Failed to load block.</div></Card>}

        {data && (
          <>
            <div style={infoGrid}>
              <Card>
                <div style={row}><span style={lbl}>Block Hash</span><span style={val}>{shortenHash(data.hash)}</span></div>
                <div style={row}><span style={lbl}>Parent Hash</span><span style={val}>{shortenHash(data.parentHash)}</span></div>
                <div style={row}><span style={lbl}>Timestamp</span><span style={val}>{new Date(data.timestamp * 1000).toUTCString()} ({timeAgo(data.timestamp)})</span></div>
                <div style={{ ...row, borderBottom: "none" }}><span style={lbl}>Validator</span><span style={val}>{shortenHash(data.miner)}</span></div>
              </Card>
              <Card>
                <div style={row}><span style={lbl}>Transactions</span><span style={val}>{data.transactionCount}</span></div>
                <div style={row}><span style={lbl}>Gas Used</span><span style={val}>{Number(data.gasUsed).toLocaleString()}</span></div>
                <div style={row}><span style={lbl}>Gas Limit</span><span style={val}>{Number(data.gasLimit).toLocaleString()}</span></div>
                <div style={{ ...row, borderBottom: "none" }}><span style={lbl}>Gas Usage</span><span style={val}><Badge variant="success">{gasPercent(data.gasUsed, data.gasLimit)}</Badge></span></div>
              </Card>
            </div>

            <Card style={{ padding: "16px 20px" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                Transactions ({data.transactions.length})
              </div>
              {data.transactions.length === 0 ? (
                <div style={{ padding: 32, textAlign: "center", color: "var(--text-dim)", fontSize: 13 }}>No transactions in this block.</div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={tbl}>
                    <thead>
                      <tr>
                        <th style={th}>Hash</th>
                        <th style={th}>From</th>
                        <th style={th}>To</th>
                        <th style={{ ...th, textAlign: "right" }}>Value</th>
                        <th style={{ ...th, textAlign: "right" }}>Gas Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.transactions.map((tx) => (
                        <tr key={tx.hash} onMouseEnter={e => e.currentTarget.style.backgroundColor = "#F8F9FB"} onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
                          <td style={{ ...td, ...mono }}>
                            <Link href={`/tx/${tx.hash}`} style={{ color: "var(--blue)", fontWeight: 500, textDecoration: "none" }}>{shortenHash(tx.hash)}</Link>
                          </td>
                          <td style={{ ...td, ...mono, color: "var(--text-mid)", fontSize: 11 }}>
                            <Link href={`/wallet/${tx.from}`} style={{ color: "var(--text-mid)", textDecoration: "none" }}>{shortenAddr(tx.from)}</Link>
                          </td>
                          <td style={{ ...td, ...mono, color: "var(--text-mid)", fontSize: 11 }}>
                            {tx.to ? <Link href={`/wallet/${tx.to}`} style={{ color: "var(--text-mid)", textDecoration: "none" }}>{shortenAddr(tx.to)}</Link> : <Badge variant="warning">Contract</Badge>}
                          </td>
                          <td style={{ ...td, ...mono, textAlign: "right" }}>{parseFloat(tx.value).toFixed(4)}</td>
                          <td style={{ ...td, ...mono, textAlign: "right", color: "var(--text-mid)", fontSize: 11 }}>{parseFloat(tx.gasPrice).toFixed(3)} Gwei</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </>
        )}
      </main>
    </>
  );
}
