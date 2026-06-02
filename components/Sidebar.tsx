"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type CSSProperties, type ReactNode } from "react";
import { useNetworkStats } from "@/hooks/useNetworkStats";

interface NavItem { label: string; href: string; icon: ReactNode; }

const sidebar: CSSProperties = {
  position: "fixed", top: 0, left: 0, width: 228, height: "100vh",
  backgroundColor: "var(--surf)", borderRight: "1px solid var(--border)",
  display: "flex", flexDirection: "column", zIndex: 100,
};

const logoWrap: CSSProperties = { padding: "20px 16px 18px", borderBottom: "1px solid var(--border)" };
const logoRow: CSSProperties = { display: "flex", alignItems: "center", gap: 10, textDecoration: "none" };
const logoIcon: CSSProperties = { flexShrink: 0, display: "block" };
const logoText: CSSProperties = { fontSize: 15, fontWeight: 700, color: "var(--text)" };
const proBadge: CSSProperties = {
  fontSize: 9, fontWeight: 700, color: "var(--blue)", backgroundColor: "var(--blue-lt)",
  padding: "2px 5px", borderRadius: 3, marginLeft: 4, letterSpacing: "0.04em",
};

const nav: CSSProperties = { display: "flex", flexDirection: "column", gap: 1, padding: "14px 8px", flex: 1 };
const linkBase: CSSProperties = {
  display: "flex", alignItems: "center", gap: 10, padding: "8px 12px",
  borderRadius: 6, fontSize: 13, fontWeight: 500, color: "var(--text-mid)",
  textDecoration: "none", transition: "background 0.12s, color 0.12s",
};
const linkActive: CSSProperties = {
  ...linkBase, backgroundColor: "var(--blue-lt)", color: "var(--blue)", fontWeight: 600,
};

const footer: CSSProperties = { padding: "12px 16px", borderTop: "1px solid var(--border)" };
const blockTag: CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 };
const blockLbl: CSSProperties = { fontSize: 10, fontWeight: 600, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.06em" };
const blockVal: CSSProperties = { fontSize: 12, fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-dm-mono), monospace" };
const footerTxt: CSSProperties = { fontSize: 10, color: "var(--text-dim)" };

const I = ({ children }: { children: ReactNode }) => <svg width="16" height="16" viewBox="0 0 16 16" fill="none">{children}</svg>;

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: <I><rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/></I> },
  { label: "Blocks", href: "/blocks", icon: <I><rect x="2" y="2" width="12" height="4.5" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><rect x="2" y="9.5" width="12" height="4.5" rx="1.5" stroke="currentColor" strokeWidth="1.4"/></I> },
  { label: "Transactions", href: "/transactions", icon: <I><path d="M3 8H13M13 8L9.5 4.5M13 8L9.5 11.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></I> },
  { label: "Wallet Explorer", href: "/wallet", icon: <I><rect x="1.5" y="3.5" width="13" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><path d="M1.5 6.5H14.5" stroke="currentColor" strokeWidth="1.4"/><circle cx="11.5" cy="10" r="0.8" fill="currentColor"/></I> },
  { label: "Connect to Arc", href: "/connect", icon: <I><circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.4"/><path d="M8 5v3l2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 3l1.5-1.5M4 3L2.5 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></I> },
  { label: "Network", href: "/network", icon: <I><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4"/><circle cx="8" cy="8" r="1.5" fill="currentColor"/><line x1="8" y1="2" x2="8" y2="4.5" stroke="currentColor" strokeWidth="1.3"/><line x1="8" y1="11.5" x2="8" y2="14" stroke="currentColor" strokeWidth="1.3"/><line x1="2" y1="8" x2="4.5" y2="8" stroke="currentColor" strokeWidth="1.3"/><line x1="11.5" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="1.3"/></I> },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: stats } = useNetworkStats();

  return (
    <aside style={sidebar}>
      <div style={logoWrap}>
        <Link href="/" style={logoRow}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style={logoIcon} aria-hidden>
            <polygon
              points="14,2 24,7.5 24,20.5 14,26 4,20.5 4,7.5"
              fill="#1B4DDB"
            />
            <circle cx="14" cy="14" r="4" fill="none" stroke="white" strokeWidth="1.5" />
            <circle cx="14" cy="14" r="7" fill="none" stroke="white" strokeWidth="0.75" strokeOpacity="0.5" />
            <line x1="14" y1="14" x2="19" y2="9" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="14" cy="14" r="1.5" fill="white" />
          </svg>
          <span style={logoText}>ArcScan<span style={proBadge}>PRO</span></span>
        </Link>
      </div>

      <nav style={nav}>
        {navItems.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={active ? linkActive : linkBase}
              onMouseEnter={e => { if (!active) e.currentTarget.style.backgroundColor = "#F9FAFB"; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div style={footer}>
        <div style={blockTag}>
          <span style={blockLbl}>Latest Block</span>
          <span style={blockVal}>{stats ? `#${stats.blockNumber.toLocaleString()}` : "--"}</span>
        </div>
        <div style={footerTxt}>Built on Arc Testnet</div>
      </div>
    </aside>
  );
}
