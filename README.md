# ArcScan Pro

**Real-time network explorer and analytics dashboard for Arc Testnet — built for the Arc ecosystem.**

Live: https://arcscan-pro.vercel.app

---

## What is ArcScan Pro?

ArcScan Pro is an open-source analytics dashboard built on top of Arc Testnet's public RPC. 
It provides real-time network metrics, wallet exploration, live transaction feeds, 
and onboarding tools for new users — everything the official block explorer doesn't cover.

It is designed as a complement to the official Arc explorer (testnet.arcscan.app), 
not a replacement. Where Blockscout shows raw data, ArcScan Pro shows insights.

---

## Features

### Network Overview
- Live TPS, block time, gas price updated every 4 seconds
- TPS and Gas Usage % charts over the last 20 blocks
- Transaction count per block (bar chart)
- Active wallets, USDC volume, contracts deployed (last 3 blocks)
- Full recent blocks table with gas usage percentage

### Wallet Explorer
- Search any Arc Testnet address
- Balance, transaction count, recent transaction history
- Sent/Received classification with USDC amounts

### Live Transaction Feed
- Real-time transactions from the latest block
- ERC-20 Transfer event decoding for USDC values
- Clickable tx hashes → full transaction detail page

### Block Detail
- Full block metadata: hash, validator, gas stats
- All transactions in the block with links

### Transaction Detail
- Status, From/To addresses, value, gas breakdown
- Input data preview, event logs

### Connect to Arc
- One-click MetaMask integration (EIP-3085)
- Manual network configuration with copy buttons
- Circle Faucet link for test USDC
- Compatible wallets guide

### ARC Economics
- Network stats: Chain ID, consensus, finality, RPC endpoints
- Live block gas statistics

---

## Tech Stack

- **Framework**: Next.js 14 (App Router, TypeScript)
- **Data**: Arc Testnet public RPC via Viem — no API key required
- **Charts**: Recharts
- **Web3**: Viem + Wagmi
- **Styling**: CSS-in-JS (inline styles), DM Sans + DM Mono
- **Deploy**: Vercel

---

## Architecture

All blockchain data is fetched server-side through Next.js API routes 
that proxy Arc Testnet's JSON-RPC endpoint. This avoids CORS issues 
and enables server-side caching (4–15 second TTL depending on the route).
app/
api/
stats/          → Network metrics (20 blocks, cached 15s)
blocks/         → Recent blocks list (cached 3s)
blocks/[number] → Single block detail
transactions/   → Latest block transactions
tx/[hash]       → Transaction detail
wallet/[address]→ Wallet balance + history

---

## Running Locally

```bash
git clone https://github.com/0xassou/arcscan-pro
cd arcscan-pro
npm install
npm run dev
```

Open http://localhost:3000

No environment variables required. The app connects directly 
to Arc Testnet's public RPC at https://rpc.testnet.arc.network

---

## Arc Testnet

| Parameter | Value |
|-----------|-------|
| Network Name | Arc Testnet |
| RPC URL | https://rpc.testnet.arc.network |
| Chain ID | 5042002 |
| Currency | USDC |
| Explorer | https://testnet.arcscan.app |
| Consensus | Malachite PoA |
| Finality | < 1 second |

---

## Built for Arc Ecosystem

This project was built as a contribution to the Arc ecosystem 
and the Circle Architect program.

Arc is Circle's Layer-1 blockchain designed as the Economic OS for the internet — 
featuring sub-second finality, USDC-native gas, and native support for 
AI agents (ERC-8004/8183) and cross-chain transfers via CCTP.

---

## License

MIT — open source, free to use and fork.
