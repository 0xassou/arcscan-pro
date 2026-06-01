"use client";

import { type CSSProperties } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useNetworkStats } from "@/hooks/useNetworkStats";
import { useBlocks, type BlockSummary } from "@/hooks/useBlocks";

const mainStyle: CSSProperties = {
  marginLeft: 228,
  padding: "28px 32px",
  minHeight: "100vh",
};

const titleStyle: CSSProperties = {
  fontSize: 20,
  fontWeight: 700,
  color: "#0D1117",
  letterSpacing: "-0.02em",
  marginBottom: 24,
};

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 16,
  marginBottom: 28,
};

const sectionTitle: CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: "#9CA3AF",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  marginBottom: 16,
};

const rowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "10px 0",
  borderBottom: "1px solid #F3F4F6",
  fontSize: 13,
};

const labelStyle: CSSProperties = {
  color: "#4B5563",
  fontWeight: 500,
};

const valStyle: CSSProperties = {
  color: "#0D1117",
  fontWeight: 600,
  fontFamily: "var(--font-dm-mono), monospace",
};

const tableStyle: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: 12,
};

const thStyle: CSSProperties = {
  textAlign: "left",
  padding: "8px 10px",
  fontWeight: 600,
  fontSize: 10,
  color: "#9CA3AF",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  borderBottom: "2px solid #E2E5EA",
};

const tdCellStyle: CSSProperties = {
  padding: "9px 10px",
  borderBottom: "1px solid #E2E5EA",
  fontFamily: "var(--font-dm-mono), monospace",
  fontSize: 11,
  color: "#4B5563",
};

const networkInfo = [
  { label: "Chain ID", value: "5042002" },
  { label: "Network Name", value: "Arc Testnet" },
  { label: "Gas Token", value: "USDC (18 decimals)" },
  { label: "Consensus", value: "Malachite PoA" },
  { label: "Finality", value: "< 1 seconde" },
  { label: "EVM Compatible", value: "Yes (JSON-RPC)" },
];

const endpoints = [
  { label: "RPC HTTP", value: "https://rpc.testnet.arc.network" },
  { label: "WebSocket", value: "wss://rpc.testnet.arc.network" },
  { label: "Explorer", value: "https://testnet.arcscan.app", link: true },
];

function formatGas(gasUsed: string, gasLimit: string): string {
  const used = Number(gasUsed);
  const limit = Number(gasLimit);
  if (limit === 0) return "0%";
  return ((used / limit) * 100).toFixed(1) + "%";
}

function timeAgo(ts: number): string {
  const diff = Math.floor(Date.now() / 1000) - ts;
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export default function NetworkPage() {
  const { data: stats } = useNetworkStats();
  const { data: blocks, isLoading: blocksLoading } = useBlocks();

  return (
    <>
      <Sidebar />
      <main style={mainStyle}>
        <h1 style={titleStyle}>Network</h1>

        <div style={gridStyle}>
          <Card>
            <div style={sectionTitle}>Chain Information</div>
            {networkInfo.map((item) => (
              <div key={item.label} style={rowStyle}>
                <span style={labelStyle}>{item.label}</span>
                <span style={valStyle}>{item.value}</span>
              </div>
            ))}
          </Card>

          <Card>
            <div style={sectionTitle}>Endpoints</div>
            {endpoints.map((item) => (
              <div key={item.label} style={rowStyle}>
                <span style={labelStyle}>{item.label}</span>
                {item.link ? (
                  <a
                    href={item.value}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ ...valStyle, color: "#1A3FBF", fontSize: 12 }}
                  >
                    {item.value}
                  </a>
                ) : (
                  <span style={{ ...valStyle, fontSize: 11 }}>{item.value}</span>
                )}
              </div>
            ))}
            <div style={{ marginTop: 16 }}>
              <div style={sectionTitle}>Live Stats</div>
              <div style={rowStyle}>
                <span style={labelStyle}>Latest Block</span>
                <span style={valStyle}>
                  {stats ? `#${stats.blockNumber.toLocaleString()}` : "--"}
                </span>
              </div>
              <div style={rowStyle}>
                <span style={labelStyle}>Gas Price</span>
                <span style={valStyle}>
                  {stats ? `${stats.gasPrice} Gwei` : "--"}
                </span>
              </div>
              <div style={{ ...rowStyle, borderBottom: "none" }}>
                <span style={labelStyle}>Status</span>
                <Badge variant="success">Operational</Badge>
              </div>
            </div>
          </Card>
        </div>

        <Card style={{ padding: 0 }}>
          <div style={{ padding: "16px 20px 0" }}>
            <div style={sectionTitle}>Block Gas Statistics</div>
          </div>
          {blocksLoading ? (
            <div style={{ padding: 48, textAlign: "center", color: "#9CA3AF", fontSize: 13 }}>
              Loading...
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Block</th>
                    <th style={thStyle}>Txns</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>Gas Used</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>Gas Limit</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>Usage</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>Age</th>
                  </tr>
                </thead>
                <tbody>
                  {(blocks ?? []).map((b: BlockSummary) => (
                    <tr
                      key={b.number}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F8F9FB")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td style={{ ...tdCellStyle, color: "#1A3FBF", fontWeight: 600 }}>
                        #{b.number.toLocaleString()}
                      </td>
                      <td style={tdCellStyle}>
                        <Badge variant={b.transactionCount > 0 ? "info" : "default"}>
                          {b.transactionCount}
                        </Badge>
                      </td>
                      <td style={{ ...tdCellStyle, textAlign: "right" }}>
                        {Number(b.gasUsed).toLocaleString()}
                      </td>
                      <td style={{ ...tdCellStyle, textAlign: "right", color: "#9CA3AF" }}>
                        {Number(b.gasLimit).toLocaleString()}
                      </td>
                      <td style={{ ...tdCellStyle, textAlign: "right" }}>
                        <Badge variant="success">{formatGas(b.gasUsed, b.gasLimit)}</Badge>
                      </td>
                      <td style={{ ...tdCellStyle, textAlign: "right", color: "#9CA3AF" }}>
                        {timeAgo(b.timestamp)}
                      </td>
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
