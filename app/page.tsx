"use client";

import { type CSSProperties, useEffect, useState } from "react";
import Link from "next/link";
import {
  ComposedChart, AreaChart, BarChart,
  Line, Area, Bar, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, ReferenceLine,
} from "recharts";
import { Sidebar } from "@/components/Sidebar";
import { LiveDot } from "@/components/ui/LiveDot";
import { Badge } from "@/components/ui/Badge";
import { useNetworkStats } from "@/hooks/useNetworkStats";
import { useBlocks, type BlockSummary } from "@/hooks/useBlocks";

/* ════════ Hex palette ════════ */

const C = {
  blue: "#1B4DDB",
  green: "#16A34A",
  violet: "#5B21B6",
  purple: "#7C3AED",
  orange: "#D97706",
  red: "#DC2626",
  text: "#0D1117",
  mid: "#4B5563",
  dim: "#9CA3AF",
  border: "#E2E5EA",
  grid: "#F0F2F6",
  surf: "#FFFFFF",
  bg2: "#F7F8FA",
};

/* ════════ Layout ════════ */

const mainS: CSSProperties = { marginLeft: 228, padding: "24px 32px", minHeight: "100vh", maxWidth: 1600 };
const headerS: CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4, paddingBottom: 14, borderBottom: `1px solid ${C.border}` };
const titleS: CSSProperties = { fontSize: 20, fontWeight: 700, color: C.text, letterSpacing: "-0.02em" };
const rightS: CSSProperties = { display: "flex", alignItems: "center", gap: 12 };
const clockS: CSSProperties = { fontFamily: "var(--font-dm-mono), monospace", fontSize: 12, color: C.mid };
const subBarS: CSSProperties = { fontFamily: "var(--font-dm-mono), monospace", fontSize: 12, color: C.mid, padding: "10px 0 20px", display: "flex", gap: 8, flexWrap: "wrap" };
const dotSep: CSSProperties = { color: C.dim };

/* ════════ ROW 1 — KPI cards ════════ */

const kpiGridS: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 };
const kpiCardS = (accent: string): CSSProperties => ({
  backgroundColor: C.surf, border: `1px solid ${C.border}`, borderTop: `3px solid ${accent}`,
  borderRadius: 8, padding: "16px 18px",
});
const kpiLblS: CSSProperties = { fontSize: 10, fontWeight: 600, color: C.dim, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 8 };
const kpiValS: CSSProperties = { fontSize: 28, fontWeight: 700, color: C.text, fontFamily: "var(--font-dm-mono), monospace", lineHeight: 1.1 };
const kpiSubS: CSSProperties = { fontSize: 11, color: C.dim, marginTop: 6 };

/* ════════ ROW 2 — Charts ════════ */

const chartGridS: CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 16 };
const chartCardS: CSSProperties = { backgroundColor: C.surf, border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" };
const chartTitleS: CSSProperties = { fontSize: 11, fontWeight: 600, color: C.dim, textTransform: "uppercase", letterSpacing: "0.08em", padding: "14px 18px", borderBottom: `1px solid ${C.border}` };
const chartBodyS: CSSProperties = { padding: 16 };
const chartWrapS: CSSProperties = { width: "100%", height: 180, minHeight: 180 };

/* ════════ ROW 3 — Secondary metrics ════════ */

const metricGridS: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginTop: 16 };
const metricCardS: CSSProperties = { backgroundColor: C.bg2, borderRadius: 8, padding: "16px 18px" };
const metricLblS: CSSProperties = { fontSize: 10, fontWeight: 600, color: C.dim, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 8 };
const metricValS: CSSProperties = { fontSize: 20, fontWeight: 700, color: C.text, fontFamily: "var(--font-dm-mono), monospace", lineHeight: 1.2 };
const metricSubS: CSSProperties = { fontSize: 10, color: C.dim, marginTop: 5 };

/* ════════ ROW 4 — Bottom 60/40 ════════ */

const bottomS: CSSProperties = { display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 14, marginTop: 16, alignItems: "start" };
const cardS: CSSProperties = { backgroundColor: C.surf, border: `1px solid ${C.border}`, borderRadius: 8, padding: "14px 16px" };
const secHdrS: CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 };
const secTitleS: CSSProperties = { fontSize: 11, fontWeight: 600, color: C.dim, textTransform: "uppercase", letterSpacing: "0.08em" };
const viewAllS: CSSProperties = { fontSize: 11, fontWeight: 600, color: C.blue, textDecoration: "none" };

/* ════════ Table ════════ */

const tblS: CSSProperties = { width: "100%", borderCollapse: "collapse" };
const thS: CSSProperties = { textAlign: "left", padding: "6px 6px", fontWeight: 600, fontSize: 10, color: C.dim, textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: `2px solid ${C.border}` };
const tdS: CSSProperties = { padding: "7px 6px", borderBottom: `1px solid ${C.border}`, fontSize: 12, color: C.text };
const monoS: CSSProperties = { fontFamily: "var(--font-dm-mono), monospace" };

/* ════════ Stat rows ════════ */

const statRowS: CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${C.border}`, fontSize: 12 };
const statLblS: CSSProperties = { color: C.mid };
const statValS: CSSProperties = { color: C.text, fontWeight: 600, fontFamily: "var(--font-dm-mono), monospace", fontSize: 12 };

/* ════════ Helpers ════════ */

function shortenHash(h: string) { return h.slice(0, 10) + "..." + h.slice(-6); }
function timeAgo(ts: number) { const d = Math.floor(Date.now() / 1000) - ts; if (d < 0) return "now"; if (d < 60) return `${d}s ago`; if (d < 3600) return `${Math.floor(d / 60)}m ago`; return `${Math.floor(d / 3600)}h ago`; }
function shortBlock(v: unknown) { return "#" + String(v).slice(-5); }

function txnBadge(count: number) {
  if (count >= 100) return { bg: "#FDF2FF", color: C.purple };
  if (count >= 50) return { bg: "#FEF2F2", color: C.red };
  if (count >= 20) return { bg: "#FFFBEB", color: C.orange };
  return { bg: "#EEF3FF", color: C.blue };
}

function gasColor(pct: number) {
  if (pct > 80) return C.red;
  if (pct >= 50) return C.orange;
  return C.green;
}

function formatUsdcVolume(total: number): string {
  if (!Number.isFinite(total) || total <= 0) return "0 USDC";
  if (total >= 1_000_000) return `${(total / 1_000_000).toFixed(1)}M USDC`;
  if (total >= 1_000) return `${Math.round(total).toLocaleString("en-US")} USDC`;
  return `${total.toFixed(2)} USDC`;
}

const sectionTitleS: CSSProperties = {
  fontSize: 10,
  fontWeight: 600,
  color: C.dim,
  textTransform: "uppercase",
  letterSpacing: "0.09em",
  marginTop: 20,
  marginBottom: 10,
};

function UserIcon({ color }: { color: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden style={{ marginBottom: 6 }}>
      <circle cx="12" cy="8" r="4" stroke={color} strokeWidth="2" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* ════════ Tooltip renderers ════════ */

const tipS: CSSProperties = { background: "#fff", border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 11, fontFamily: "DM Mono, monospace", padding: "6px 10px" };

function TpsTip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: unknown }) {
  if (!active || !payload?.length) return null;
  return <div style={tipS}><div style={{ color: C.dim, fontSize: 9 }}>Bloc #{String(label)}</div><div style={{ fontWeight: 600, color: C.text }}>{payload[0].value.toFixed(1)} tps</div></div>;
}
function GasTip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: unknown }) {
  if (!active || !payload?.length) return null;
  return <div style={tipS}><div style={{ color: C.dim, fontSize: 9 }}>Bloc #{String(label)}</div><div style={{ fontWeight: 600, color: C.text }}>{payload[0].value.toFixed(1)}%</div></div>;
}
function TxTip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: unknown }) {
  if (!active || !payload?.length) return null;
  return <div style={tipS}><div style={{ color: C.dim, fontSize: 9 }}>Bloc #{String(label)}</div><div style={{ fontWeight: 600, color: C.text }}>{payload[0].value} txns</div></div>;
}

/* ════════════════════════════════════════
   DASHBOARD
   ════════════════════════════════════════ */

export default function DashboardPage() {
  const { data: stats, isLoading: sl } = useNetworkStats();
  const { data: blocks, isLoading: bl } = useBlocks();

  const [utc, setUtc] = useState("");
  useEffect(() => {
    const tick = () => setUtc(new Date().toLocaleTimeString("en-GB", { timeZone: "UTC", hour: "2-digit", minute: "2-digit", second: "2-digit" }) + " UTC");
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
  }, []);

  const tpsData = stats?.tpsHistory ?? [];
  const gasData = stats?.gasUsageHistory ?? [];
  const gasPct = stats?.avgGasUsedPct ?? 0;
  const gasCol = gasColor(gasPct);
  const usdcVolumeTotal = (stats?.usdcVolumeHistory ?? []).reduce((s, p) => s + p.value, 0);
  const topAddr = stats?.topAddresses?.[0];

  return (
    <>
      <Sidebar />
      <main style={mainS}>

        {/* ── Header ── */}
        <div style={headerS}>
          <h1 style={titleS}>Network Overview</h1>
          <div style={rightS}>
            <Badge variant="info">TESTNET</Badge>
            <LiveDot />
            <span style={clockS}>{utc}</span>
          </div>
        </div>
        <div style={subBarS}>
          {stats ? (<>
            <span>Block #{stats.blockNumber.toLocaleString()}</span>
            <span style={dotSep}>&#183;</span>
            <span>TPS: {stats.tps.toFixed(1)}</span>
            <span style={dotSep}>&#183;</span>
            <span>Block time: {stats.avgBlockTime.toFixed(2)}s</span>
            <span style={dotSep}>&#183;</span>
            <span>Gas: {parseFloat(stats.gasPrice).toFixed(2)} Gwei</span>
          </>) : <span style={{ color: C.dim }}>Connecting to Arc Testnet...</span>}
        </div>

        {/* ── ROW 1 — 4 KPIs ── */}
        <div style={kpiGridS}>
          <div style={kpiCardS(C.green)}>
            <div style={kpiLblS}>Latest Block</div>
            <div style={kpiValS}>{sl ? <span style={{ color: C.dim }}>--</span> : `#${stats!.blockNumber.toLocaleString()}`}</div>
            <div style={kpiSubS}>{stats ? timeAgo(stats.timestamp) : ""}</div>
          </div>
          <div style={kpiCardS(C.blue)}>
            <div style={kpiLblS}>TPS Live</div>
            <div style={kpiValS}>{sl ? <span style={{ color: C.dim }}>--</span> : stats!.tps.toFixed(1)}</div>
            <div style={kpiSubS}>transactions / seconde</div>
          </div>
          <div style={kpiCardS(C.violet)}>
            <div style={kpiLblS}>Txns / Bloc</div>
            <div style={kpiValS}>{sl ? <span style={{ color: C.dim }}>--</span> : stats!.avgTxnsPerBlock.toFixed(0)}</div>
            <div style={kpiSubS}>moyenne 20 blocs</div>
          </div>
          <div style={kpiCardS(C.orange)}>
            <div style={kpiLblS}>Block Time</div>
            <div style={kpiValS}>{sl ? <span style={{ color: C.dim }}>--</span> : `${stats!.avgBlockTime.toFixed(2)}s`}</div>
            <div style={kpiSubS}>temps moyen entre blocs</div>
          </div>
        </div>

        {/* ── Activité réseau — 20 blocs ── */}
        <div style={sectionTitleS}>Activité réseau — 20 derniers blocs</div>
        <div style={metricGridS}>
          <div style={metricCardS}>
            <UserIcon color={C.blue} />
            <div style={metricLblS}>Wallets actifs</div>
            <div style={{ ...metricValS, color: C.blue }}>
              {sl ? "--" : stats!.activeWallets.toLocaleString()}
            </div>
            <div style={metricSubS}>adresses uniques · 20 blocs</div>
          </div>

          <div style={metricCardS}>
            <div style={metricLblS}>Volume USDC</div>
            <div style={metricValS}>
              {sl ? "--" : formatUsdcVolume(usdcVolumeTotal)}
            </div>
            <div style={metricSubS}>transferts ERC-20 · 20 blocs</div>
          </div>

          <div style={metricCardS}>
            <div style={metricLblS}>Contrats déployés</div>
            <div style={metricValS}>
              {sl ? "--" : stats!.contractsDeployed.toLocaleString()}
            </div>
            <div style={metricSubS}>créations de contrat · 20 blocs</div>
          </div>

          <div style={metricCardS}>
            <div style={metricLblS}>Frais gas estimés</div>
            <div style={metricValS}>
              {sl ? "--" : `${stats!.totalGasFeesUsdc} USDC`}
            </div>
            <div style={metricSubS}>
              {topAddr
                ? `top émetteur · ${topAddr.address.slice(0, 6)}…${topAddr.address.slice(-4)} (${topAddr.txCount} tx)`
                : "gasPrice × gasLimit · 20 blocs"}
            </div>
          </div>
        </div>

        {/* ── ROW 2 — 3 Charts ── */}
        <div style={chartGridS}>
          <div style={chartCardS}>
            <div style={chartTitleS}>TPS &mdash; 20 Derniers Blocs</div>
            <div style={chartBodyS}>
              <div style={chartWrapS}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={tpsData}>
                    <CartesianGrid vertical={false} stroke={C.grid} strokeDasharray="3 3" />
                    <XAxis dataKey="blockNumber" tick={{ fontSize: 9, fill: C.dim }} tickFormatter={shortBlock} interval="preserveStartEnd" axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: C.dim }} axisLine={false} tickLine={false} width={25} />
                    <Tooltip content={<TpsTip />} cursor={{ stroke: C.border }} />
                    <Area type="monotone" dataKey="value" fill="rgba(27,77,219,0.08)" stroke="none" />
                    <Line type="monotone" dataKey="value" stroke={C.blue} strokeWidth={2} dot={false} activeDot={{ r: 4, fill: C.blue }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div style={chartCardS}>
            <div style={chartTitleS}>Gas Usage % &mdash; 20 Blocs</div>
            <div style={chartBodyS}>
              <div style={chartWrapS}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={gasData}>
                    <defs>
                      <linearGradient id="gasGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={C.red} stopOpacity={0.15} />
                        <stop offset="95%" stopColor={C.red} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke={C.grid} strokeDasharray="3 3" />
                    <XAxis dataKey="blockNumber" tick={{ fontSize: 9, fill: C.dim }} tickFormatter={shortBlock} interval="preserveStartEnd" axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: C.dim }} axisLine={false} tickLine={false} width={25} domain={[0, 100]} tickFormatter={(v: number) => `${v}%`} />
                    <Tooltip content={<GasTip />} cursor={{ stroke: C.border }} />
                    <ReferenceLine y={50} stroke={C.border} strokeDasharray="4 4" label={{ value: "50%", position: "right", fontSize: 9, fill: C.dim }} />
                    <Area type="monotone" dataKey="value" stroke={C.red} strokeWidth={2} fill="url(#gasGrad)" dot={false} activeDot={{ r: 4 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Txns per block BarChart */}
          <div style={chartCardS}>
            <div style={chartTitleS}>Txns / Bloc &mdash; 15 Blocs</div>
            <div style={chartBodyS}>
              <div style={chartWrapS}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={(blocks ?? []).slice(0, 15).reverse()} barCategoryGap="18%">
                    <CartesianGrid vertical={false} stroke={C.grid} strokeDasharray="3 3" />
                    <XAxis dataKey="number" tick={{ fontSize: 9, fill: C.dim }} tickFormatter={(v: number) => "#" + String(v).slice(-5)} interval="preserveStartEnd" axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: C.dim }} axisLine={false} tickLine={false} width={25} allowDecimals={false} />
                    <Tooltip content={<TxTip />} cursor={{ fill: "rgba(27,77,219,0.04)" }} />
                    <Bar dataKey="transactionCount" radius={[3, 3, 0, 0]} maxBarSize={24}>
                      {(blocks ?? []).slice(0, 15).reverse().map((_, i, arr) => (
                        <Cell key={i} fill={i === arr.length - 1 ? C.green : C.blue} opacity={i === arr.length - 1 ? 1 : 0.6} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* ── ROW 3 — 4 Secondary Metrics ── */}
        <div style={metricGridS}>
          <div style={metricCardS}>
            <div style={metricLblS}>Total Txns (20 Blocs)</div>
            <div style={metricValS}>{sl ? "--" : stats!.totalTxns20Blocks.toLocaleString()}</div>
            <div style={metricSubS}>sur les 20 derniers blocs</div>
          </div>

          <div style={metricCardS}>
            <div style={metricLblS}>Avg Gas Usage</div>
            <div style={{ ...metricValS, color: gasCol }}>{sl ? "--" : `${gasPct.toFixed(1)}%`}</div>
            <div style={{ marginTop: 8, height: 4, borderRadius: 2, backgroundColor: C.border }}>
              <div style={{ height: 4, borderRadius: 2, backgroundColor: gasCol, width: `${Math.min(gasPct, 100)}%`, transition: "width 0.4s" }} />
            </div>
          </div>

          <div style={metricCardS}>
            <div style={metricLblS}>Gas Price</div>
            <div style={metricValS}>{sl ? "--" : `${parseFloat(stats!.gasPrice).toFixed(2)} Gwei`}</div>
            <div style={metricSubS}>USDC -- Arc Testnet</div>
          </div>

          <div style={metricCardS}>
            <div style={metricLblS}>Statut Reseau</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
              <LiveDot label="" />
              <span style={{ fontSize: 18, fontWeight: 700, color: C.green }}>Operationnel</span>
            </div>
            <div style={metricSubS}>Malachite PoA -- Chain 5042002</div>
          </div>
        </div>

        {/* ── ROW 4 — Table 60% + Stats 40% ── */}
        <div style={bottomS}>
          <div style={cardS}>
            <div style={secHdrS}>
              <span style={secTitleS}>Recent Blocks</span>
              <Link href="/blocks" style={viewAllS}>View all &rarr;</Link>
            </div>
            {bl ? (
              <div style={{ padding: 32, textAlign: "center", color: C.dim, fontSize: 13 }}>Loading...</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={tblS}>
                  <thead>
                    <tr>
                      <th style={thS}>Block</th>
                      <th style={thS}>Hash</th>
                      <th style={{ ...thS, textAlign: "center" }}>Txns</th>
                      <th style={{ ...thS, textAlign: "center" }}>Time</th>
                      <th style={thS}>Validator</th>
                      <th style={{ ...thS, textAlign: "right" }}>Age</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(blocks ?? []).map((b: BlockSummary) => {
                      const badge = txnBadge(b.transactionCount);
                      return (
                        <tr key={b.number}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = "#F8F9FB"}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                        >
                          <td style={tdS}>
                            <Link href={`/blocks/${b.number}`} style={{ fontWeight: 600, color: C.blue, textDecoration: "none" }}>#{b.number.toLocaleString()}</Link>
                          </td>
                          <td style={{ ...tdS, ...monoS, color: C.mid, fontSize: 11 }}>{shortenHash(b.hash)}</td>
                          <td style={{ ...tdS, textAlign: "center" }}>
                            <span style={{
                              display: "inline-flex", alignItems: "center", padding: "2px 8px",
                              borderRadius: 4, fontSize: 11, fontWeight: 600, lineHeight: "18px",
                              backgroundColor: badge.bg, color: badge.color,
                            }}>
                              {b.transactionCount}
                            </span>
                          </td>
                          <td style={{ ...tdS, textAlign: "center", ...monoS, fontSize: 11, color: C.mid }}>{b.blockTime}s</td>
                          <td style={{ ...tdS, ...monoS, color: C.mid, fontSize: 11 }}>
                            <Link href={`/wallet/${b.miner}`} style={{ color: C.mid, textDecoration: "none" }}>{shortenHash(b.miner)}</Link>
                          </td>
                          <td style={{ ...tdS, textAlign: "right", color: C.dim, fontSize: 11 }}>{timeAgo(b.timestamp)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right column: 2 stacked cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Card A — Live stats */}
            <div style={cardS}>
              <div style={{ ...secTitleS, marginBottom: 4 }}>Network Stats Live</div>
              {([
                { l: "Total Txns (20 blocs)", v: stats ? stats.totalTxns20Blocks.toLocaleString() : "--" },
                { l: "Avg Block Time", v: stats ? `${stats.avgBlockTime.toFixed(2)}s` : "--" },
                { l: "Avg Gas Usage", v: stats ? `${stats.avgGasUsedPct}%` : "--" },
                { l: "Avg Txns/Block", v: stats ? `${stats.avgTxnsPerBlock}` : "--" },
              ]).map(({ l, v }, i, arr) => (
                <div key={l} style={{ ...statRowS, borderBottom: i === arr.length - 1 ? "none" : statRowS.borderBottom }}>
                  <span style={statLblS}>{l}</span><span style={statValS}>{v}</span>
                </div>
              ))}
            </div>

            {/* Card B — Chain info */}
            <div style={cardS}>
              <div style={{ ...secTitleS, marginBottom: 4 }}>Chain Info</div>
              {([
                { l: "Chain ID", v: "5042002", href: "", color: "" },
                { l: "Gas Token", v: "USDC", href: "", color: "" },
                { l: "Consensus", v: "Malachite PoA", href: "", color: "" },
                { l: "Finality", v: "< 1 seconde", href: "", color: C.green },
                { l: "RPC", v: "rpc.testnet.arc.network", href: "", color: "" },
                { l: "Explorer", v: "testnet.arcscan.app", href: "https://testnet.arcscan.app", color: "" },
              ]).map(({ l, v, href, color }, i, arr) => (
                <div key={l} style={{ ...statRowS, borderBottom: i === arr.length - 1 ? "none" : statRowS.borderBottom }}>
                  <span style={statLblS}>{l}</span>
                  {href ? (
                    <a href={href} target="_blank" rel="noopener noreferrer" style={{ ...statValS, color: C.blue }}>{v}</a>
                  ) : (
                    <span style={{ ...statValS, ...(color ? { color } : {}) }}>{v}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

      </main>
    </>
  );
}
