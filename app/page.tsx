"use client";

import { type CSSProperties, useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Sidebar } from "@/components/Sidebar";
import { Card } from "@/components/ui/Card";
import { LiveDot } from "@/components/ui/LiveDot";
import { Badge } from "@/components/ui/Badge";
import { useNetworkStats } from "@/hooks/useNetworkStats";
import { useBlocks, type BlockSummary } from "@/hooks/useBlocks";

/* ───────── Layout ───────── */

const mainStyle: CSSProperties = {
  marginLeft: 228,
  padding: "24px 32px",
  minHeight: "100vh",
  maxWidth: 1628,
};

/* ───────── Header ───────── */

const headerBar: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 24,
  paddingBottom: 16,
  borderBottom: "1px solid var(--border)",
};

const titleStyle: CSSProperties = {
  fontSize: 20,
  fontWeight: 700,
  color: "var(--text)",
  letterSpacing: "-0.02em",
};

const headerRight: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const utcClock: CSSProperties = {
  fontFamily: "var(--font-dm-mono), monospace",
  fontSize: 12,
  color: "#4B5563",
};

/* ───────── KPI Grid ───────── */

const kpiGrid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: 14,
  marginBottom: 24,
};

const kpiLabel: CSSProperties = {
  fontSize: 10,
  fontWeight: 600,
  color: "var(--text-dim)",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  marginBottom: 8,
};

const kpiValue: CSSProperties = {
  fontSize: 28,
  fontWeight: 700,
  color: "var(--text)",
  fontFamily: "var(--font-dm-mono), monospace",
  lineHeight: 1.1,
};

const kpiSub: CSSProperties = {
  fontSize: 11,
  color: "var(--text-mid)",
  marginTop: 6,
};

/* ───────── Two columns ───────── */

const twoCols: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.5fr 1fr",
  gap: 16,
  alignItems: "start",
};

const sectionHeader: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 12,
};

const sectionTitle: CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: "var(--text-dim)",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const viewAll: CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: "var(--blue)",
  textDecoration: "none",
};

/* ───────── Table ───────── */

const tableStyle: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
};

const thStyle: CSSProperties = {
  textAlign: "left",
  padding: "7px 8px",
  fontWeight: 600,
  fontSize: 10,
  color: "var(--text-dim)",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  borderBottom: "2px solid var(--border)",
};

const tdStyle: CSSProperties = {
  padding: "8px 8px",
  borderBottom: "1px solid var(--border)",
  fontSize: 12,
  color: "var(--text)",
};

const monoStyle: CSSProperties = {
  fontFamily: "var(--font-dm-mono), monospace",
};

/* ───────── Stats List ───────── */

const statRow: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "9px 0",
  borderBottom: "1px solid var(--border)",
  fontSize: 12,
};

const statLabel: CSSProperties = { color: "var(--text-mid)" };
const statVal: CSSProperties = {
  color: "var(--text)",
  fontWeight: 600,
  fontFamily: "var(--font-dm-mono), monospace",
  fontSize: 12,
};

/* ───────── Helpers ───────── */

function shortenHash(hash: string): string {
  return hash.slice(0, 10) + "..." + hash.slice(-6);
}

function timeAgo(ts: number): string {
  const diff = Math.floor(Date.now() / 1000) - ts;
  if (diff < 0) return "just now";
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

function txnBadgeVariant(count: number): "success" | "warning" | "default" {
  if (count > 50) return "warning";
  if (count > 20) return "warning";
  return count > 0 ? "success" : "default";
}

/* ───────── Custom tooltip ───────── */

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "#FFF",
        border: "1px solid #E2E5EA",
        borderRadius: 6,
        padding: "8px 12px",
        fontSize: 12,
        fontFamily: "var(--font-dm-mono), monospace",
      }}
    >
      <div style={{ color: "#9CA3AF", fontSize: 10 }}>{label}</div>
      <div style={{ fontWeight: 600, color: "#0D1117" }}>{payload[0].value} txns</div>
    </div>
  );
}

/* ───────── KPI accent colors ───────── */

const kpiAccents = ["var(--green)", "var(--violet)", "var(--blue)", "var(--orange)"];

/* ───────── Page Component ───────── */

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useNetworkStats();
  const { data: blocks, isLoading: blocksLoading } = useBlocks();

  const [utcTime, setUtcTime] = useState("");
  useEffect(() => {
    function tick() {
      setUtcTime(
        new Date().toLocaleTimeString("en-GB", {
          timeZone: "UTC",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }) + " UTC"
      );
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const chartData = blocks
    ? [...blocks].reverse().map((b, i) => ({
        block: `#${b.number}`,
        txns: b.transactionCount,
        isLast: i === blocks.length - 1,
      }))
    : [];

  return (
    <>
      <Sidebar />
      <main style={mainStyle}>
        {/* Header */}
        <div style={headerBar}>
          <h1 style={titleStyle}>Network Overview</h1>
          <div style={headerRight}>
            <Badge variant="info">TESTNET</Badge>
            <LiveDot />
            <span style={utcClock}>{utcTime}</span>
          </div>
        </div>

        {/* KPI Row */}
        <div style={kpiGrid}>
          {[
            {
              label: "Latest Block",
              value: stats ? `#${stats.blockNumber.toLocaleString()}` : "--",
              sub: stats ? timeAgo(stats.timestamp) : undefined,
            },
            {
              label: "Gas Price",
              value: stats ? `${stats.gasPrice}` : "--",
              sub: "Gwei",
            },
            {
              label: "Txns in Block",
              value: stats?.transactionCount ?? "--",
              sub: stats ? `Block #${stats.blockNumber.toLocaleString()}` : undefined,
            },
            {
              label: "Network",
              value: "Arc",
              sub: "Chain ID 5042002",
            },
          ].map((kpi, i) => (
            <Card
              key={kpi.label}
              style={{
                padding: "16px 20px",
                borderTop: `3px solid ${kpiAccents[i]}`,
              }}
            >
              <div style={kpiLabel}>{kpi.label}</div>
              <div style={kpiValue}>
                {statsLoading && i < 3 ? (
                  <span style={{ color: "var(--text-dim)" }}>--</span>
                ) : (
                  kpi.value
                )}
              </div>
              {kpi.sub && <div style={kpiSub}>{kpi.sub}</div>}
            </Card>
          ))}
        </div>

        {/* Two columns */}
        <div style={twoCols}>
          {/* Left: Recent blocks */}
          <Card style={{ padding: "16px 20px" }}>
            <div style={sectionHeader}>
              <span style={sectionTitle}>Recent Blocks</span>
              <Link href="/blocks" style={viewAll}>
                View all &rarr;
              </Link>
            </div>
            {blocksLoading ? (
              <div style={{ padding: 40, textAlign: "center", color: "#9CA3AF", fontSize: 13 }}>
                Loading...
              </div>
            ) : (
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Block</th>
                    <th style={thStyle}>Hash</th>
                    <th style={{ ...thStyle, textAlign: "center" }}>Txns</th>
                    <th style={thStyle}>Validator</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>Age</th>
                  </tr>
                </thead>
                <tbody>
                  {(blocks ?? []).map((b: BlockSummary) => (
                    <tr
                      key={b.number}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#F8F9FB")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                      }
                    >
                      <td style={tdStyle}>
                        <Link
                          href={`/blocks/${b.number}`}
                          style={{
                            fontWeight: 600,
                            color: "var(--blue)",
                            textDecoration: "none",
                          }}
                        >
                          #{b.number.toLocaleString()}
                        </Link>
                      </td>
                      <td
                        style={{
                          ...tdStyle,
                          ...monoStyle,
                          color: "var(--text-mid)",
                          fontSize: 11,
                        }}
                      >
                        {shortenHash(b.hash)}
                      </td>
                      <td style={{ ...tdStyle, textAlign: "center" }}>
                        <Badge variant={txnBadgeVariant(b.transactionCount)}>
                          {b.transactionCount}
                        </Badge>
                      </td>
                      <td
                        style={{
                          ...tdStyle,
                          ...monoStyle,
                          color: "var(--text-mid)",
                          fontSize: 11,
                        }}
                      >
                        <Link href={`/wallet/${b.miner}`} style={{ color: "var(--text-mid)", textDecoration: "none" }}>
                          {shortenHash(b.miner)}
                        </Link>
                      </td>
                      <td
                        style={{
                          ...tdStyle,
                          textAlign: "right",
                          color: "var(--text-dim)",
                          fontSize: 11,
                        }}
                      >
                        {timeAgo(b.timestamp)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>

          {/* Right: Chart + Network stats */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Card style={{ padding: "16px 20px" }}>
              <div style={{ ...sectionTitle, marginBottom: 12 }}>
                Transactions per Block
              </div>
              <div style={{ width: "100%", minHeight: 200, height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} barCategoryGap="20%">
                    <XAxis
                      dataKey="block"
                      tick={{ fontSize: 9, fill: "#4B5563" }}
                      tickLine={false}
                      axisLine={{ stroke: "#E2E5EA" }}
                    />
                    <YAxis
                      tick={{ fontSize: 9, fill: "#4B5563" }}
                      tickLine={false}
                      axisLine={false}
                      width={28}
                      allowDecimals={false}
                    />
                    <Tooltip
                      content={<ChartTooltip />}
                      cursor={{ fill: "rgba(27, 77, 219, 0.04)" }}
                    />
                    <Bar
                      dataKey="txns"
                      fill="#1B4DDB"
                      radius={[3, 3, 0, 0]}
                      maxBarSize={28}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card style={{ padding: "16px 20px" }}>
              <div style={{ ...sectionTitle, marginBottom: 8 }}>
                Network Info
              </div>
              {[
                { label: "Chain ID", value: "5042002" },
                { label: "Gas Token", value: "USDC" },
                { label: "Consensus", value: "Malachite PoA" },
                { label: "Finality", value: "< 1 seconde" },
                {
                  label: "Explorer",
                  value: "testnet.arcscan.app",
                  link: "https://testnet.arcscan.app",
                },
              ].map((s, i, arr) => (
                <div
                  key={s.label}
                  style={{
                    ...statRow,
                    borderBottom:
                      i === arr.length - 1 ? "none" : statRow.borderBottom,
                  }}
                >
                  <span style={statLabel}>{s.label}</span>
                  {"link" in s && s.link ? (
                  <a
                    href={s.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ ...statVal, color: "var(--blue)" }}
                  >
                      {s.value}
                    </a>
                  ) : (
                    <span style={statVal}>{s.value}</span>
                  )}
                </div>
              ))}
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
