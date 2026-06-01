"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { type CSSProperties, useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const M: CSSProperties = { marginLeft: 228, padding: "28px 32px", minHeight: "100vh" };
const mono: CSSProperties = { fontFamily: "var(--font-dm-mono), monospace" };
const breadcrumb: CSSProperties = { fontSize: 12, color: "var(--text-mid)", marginBottom: 8 };
const bcLink: CSSProperties = { color: "var(--blue)", textDecoration: "none" };
const pageTitle: CSSProperties = { fontSize: 22, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em", marginBottom: 24 };

const twoCols: CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 };
const row: CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "9px 0", borderBottom: "1px solid var(--border)", fontSize: 13, gap: 12 };
const lbl: CSSProperties = { color: "var(--text-mid)", fontWeight: 500, flexShrink: 0 };
const val: CSSProperties = { color: "var(--text)", fontWeight: 600, ...mono, fontSize: 12, wordBreak: "break-all", textAlign: "right" };

const secTitle: CSSProperties = { fontSize: 11, fontWeight: 600, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 };
const tbl: CSSProperties = { width: "100%", borderCollapse: "collapse" };
const th: CSSProperties = { textAlign: "left", padding: "7px 8px", fontWeight: 600, fontSize: 10, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: "2px solid var(--border)" };
const td: CSSProperties = { padding: "8px 8px", borderBottom: "1px solid var(--border)", fontSize: 11, ...mono, color: "var(--text-mid)", wordBreak: "break-all" };

const copyBtn: CSSProperties = { marginLeft: 6, padding: "2px 6px", border: "1px solid var(--border)", borderRadius: 4, fontSize: 10, fontWeight: 600, color: "var(--text-dim)", backgroundColor: "var(--surf)", cursor: "pointer" };

interface TxLog { logIndex: number; address: string; topics: string[]; data: string; }
interface TxDetail {
  hash: string; from: string; to: string | null; value: string; gasPrice: string; gas: string; nonce: number;
  blockNumber: number; blockHash: string; transactionIndex: number; input: string; status: string;
  gasUsed: string; effectiveGasPrice: string; cumulativeGasUsed: string; contractAddress: string | null; logs: TxLog[];
}

function shortenAddr(a: string) { return a.slice(0, 10) + "..." + a.slice(-8); }
function gasPercent(u: string, l: string) { const lv = Number(l); return lv === 0 ? "0%" : ((Number(u) / lv) * 100).toFixed(2) + "%"; }

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      style={copyBtn}
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export default function TxDetailPage() {
  const { hash } = useParams();
  const txHash = hash as string;

  const { data, isLoading, error } = useQuery<TxDetail>({
    queryKey: ["tx-detail", txHash],
    queryFn: async () => { const r = await fetch(`/api/tx/${txHash}`); if (!r.ok) throw new Error("Fetch failed"); return r.json(); },
    enabled: !!txHash,
  });

  return (
    <>
      <Sidebar />
      <main style={M}>
        <div style={breadcrumb}>
          <Link href="/transactions" style={bcLink}>Transactions</Link>
          {" > "}
          <span style={mono}>{txHash.slice(0, 14)}...</span>
        </div>
        <h1 style={pageTitle}>Transaction</h1>

        {isLoading && <Card><div style={{ padding: 40, textAlign: "center", color: "var(--text-dim)" }}>Loading transaction...</div></Card>}
        {error && <Card><div style={{ padding: 40, textAlign: "center", color: "var(--red)" }}>Failed to load transaction.</div></Card>}

        {data && (
          <>
            <div style={twoCols}>
              <Card>
                <div style={row}>
                  <span style={lbl}>Status</span>
                  <Badge variant={data.status === "success" ? "success" : "warning"}>
                    {data.status === "success" ? "Success" : "Failed"}
                  </Badge>
                </div>
                <div style={row}>
                  <span style={lbl}>Hash</span>
                  <span style={val}>{shortenAddr(data.hash)}<CopyButton text={data.hash} /></span>
                </div>
                <div style={row}>
                  <span style={lbl}>Block</span>
                  <Link href={`/blocks/${data.blockNumber}`} style={{ ...val, color: "var(--blue)", textDecoration: "none" }}>
                    #{data.blockNumber.toLocaleString()}
                  </Link>
                </div>
                <div style={row}>
                  <span style={lbl}>From</span>
                  <span style={val}>
                    <Link href={`/wallet/${data.from}`} style={{ color: "var(--blue)", textDecoration: "none" }}>{shortenAddr(data.from)}</Link>
                    <CopyButton text={data.from} />
                  </span>
                </div>
                <div style={row}>
                  <span style={lbl}>To</span>
                  <span style={val}>
                    {data.to ? (
                      <><Link href={`/wallet/${data.to}`} style={{ color: "var(--blue)", textDecoration: "none" }}>{shortenAddr(data.to)}</Link><CopyButton text={data.to} /></>
                    ) : (
                      <Badge variant="warning">Contract Creation</Badge>
                    )}
                  </span>
                </div>
                <div style={{ ...row, borderBottom: "none" }}>
                  <span style={lbl}>Value</span>
                  <span style={val}>{parseFloat(data.value).toFixed(6)} USDC</span>
                </div>
              </Card>

              <Card>
                <div style={row}><span style={lbl}>Gas Price</span><span style={val}>{parseFloat(data.gasPrice).toFixed(4)} Gwei</span></div>
                <div style={row}><span style={lbl}>Gas Limit</span><span style={val}>{Number(data.gas).toLocaleString()}</span></div>
                <div style={row}><span style={lbl}>Gas Used</span><span style={val}>{Number(data.gasUsed).toLocaleString()}</span></div>
                <div style={row}><span style={lbl}>Gas Usage</span><span style={val}><Badge variant="success">{gasPercent(data.gasUsed, data.gas)}</Badge></span></div>
                <div style={row}><span style={lbl}>Nonce</span><span style={val}>{data.nonce}</span></div>
                <div style={row}><span style={lbl}>Tx Index</span><span style={val}>{data.transactionIndex}</span></div>
                <div style={{ ...row, borderBottom: "none" }}>
                  <span style={lbl}>Input Data</span>
                  <span style={{ ...val, fontSize: 10, color: "var(--text-dim)", maxWidth: "70%" }}>
                    {data.input.length > 100 ? data.input.slice(0, 100) + "..." : data.input}
                  </span>
                </div>
              </Card>
            </div>

            {data.logs.length > 0 && (
              <Card style={{ padding: "16px 20px" }}>
                <div style={secTitle}>Logs ({data.logs.length})</div>
                <div style={{ overflowX: "auto" }}>
                  <table style={tbl}>
                    <thead>
                      <tr>
                        <th style={th}>Index</th>
                        <th style={th}>Contract</th>
                        <th style={th}>Topic 0</th>
                        <th style={th}>Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.logs.map((log) => (
                        <tr key={log.logIndex}>
                          <td style={td}>{log.logIndex}</td>
                          <td style={td}>{shortenAddr(log.address)}</td>
                          <td style={td}>{log.topics[0] ? log.topics[0].slice(0, 18) + "..." : "--"}</td>
                          <td style={td}>{log.data.length > 66 ? log.data.slice(0, 66) + "..." : log.data}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </>
        )}
      </main>
    </>
  );
}
