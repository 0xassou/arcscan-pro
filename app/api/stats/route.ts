import { NextResponse } from "next/server";
import { publicClient } from "@/lib/arc";
import { getCached, setCache } from "@/lib/cache";
import { formatUnits } from "viem";

const CACHE_KEY = "network-stats-v7";
const TTL = 15_000;
const BLOCK_DEPTH = 20;
const TX_BLOCK_DEPTH = 3;
const LOGS_TIMEOUT_MS = 3_000;
const MAX_BLOCK_USDC = 1_000_000_000;

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

const TRANSFER_TOPIC =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

function decodeTransferLogAmount(logData: string): number {
  try {
    const hex = logData.startsWith("0x") ? logData.slice(2) : logData;
    const raw = BigInt(`0x${hex.padStart(64, "0")}`);

    let amount = Number(raw / BigInt(10 ** 12)) / 1_000_000;

    if (amount > 100_000_000_000) {
      amount = Number(raw / BigInt(10 ** 18)) / 1_000_000;
    }

    if (amount > 1_000_000_000_000) {
      amount = 0;
    }

    return Number.isFinite(amount) ? amount : 0;
  } catch {
    return 0;
  }
}

interface HistoryPoint {
  blockNumber: number;
  value: number;
}

interface TopAddress {
  address: string;
  txCount: number;
}

interface BlockTx {
  from: string;
  to: string | null;
  gasPrice: bigint | null;
  gas: bigint;
}

interface StatsPayload {
  blockNumber: number;
  gasPrice: string;
  txnsInBlock: number;
  avgTxnsPerBlock: number;
  avgBlockTime: number;
  tps: number;
  avgGasUsedPct: number;
  totalTxns20Blocks: number;
  tpsHistory: HistoryPoint[];
  gasUsageHistory: HistoryPoint[];
  timestamp: number;
  activeWallets: number;
  contractsDeployed: number;
  totalGasFeesUsdc: string;
  usdcVolumeHistory: HistoryPoint[];
  topAddresses: TopAddress[];
}

function extractTxs(
  block: Awaited<ReturnType<typeof publicClient.getBlock>>
): BlockTx[] {
  return block.transactions
    .filter((tx): tx is Exclude<typeof tx, string> => typeof tx !== "string")
    .map((tx) => ({
      from: tx.from,
      to: tx.to ?? null,
      gasPrice: tx.gasPrice ?? null,
      gas: tx.gas,
    }));
}

function computeActiveWallets(allTxs: BlockTx[]): number {
  try {
    return new Set(allTxs.map((tx) => tx.from.toLowerCase())).size;
  } catch {
    return 0;
  }
}

function computeContractsDeployed(allTxs: BlockTx[]): number {
  try {
    return allTxs.filter((tx) => !tx.to).length;
  } catch {
    return 0;
  }
}

function computeTotalGasFeesUsdc(allTxs: BlockTx[]): string {
  try {
    let total = BigInt(0);
    for (const tx of allTxs) {
      const price = tx.gasPrice ?? BigInt(0);
      total += price * tx.gas;
    }
    const formatted = formatUnits(total, 18);
    const num = parseFloat(formatted);
    if (!Number.isFinite(num)) return "0";
    return num.toFixed(4);
  } catch {
    return "0";
  }
}

async function computeUsdcVolumeHistory(
  blocks: Awaited<ReturnType<typeof publicClient.getBlock>>[]
): Promise<HistoryPoint[]> {
  try {
    const results = await Promise.allSettled(
      blocks.map(async (block) => {
        if (!block.hash) {
          return { blockNumber: Number(block.number), value: 0 };
        }
        const logs = await withTimeout(
          publicClient.getLogs({ blockHash: block.hash }),
          LOGS_TIMEOUT_MS,
          []
        );

        let blockVolume = 0;
        for (const log of logs) {
          if (log.topics[0] !== TRANSFER_TOPIC) continue;
          if (!log.data || log.data === "0x") continue;
          blockVolume += decodeTransferLogAmount(log.data);
        }

        const value = Math.round(blockVolume * 100) / 100;
        return {
          blockNumber: Number(block.number),
          value: value < MAX_BLOCK_USDC ? value : 0,
        };
      })
    );

    return results
      .filter(
        (r): r is PromiseFulfilledResult<HistoryPoint> => r.status === "fulfilled"
      )
      .map((r) => r.value)
      .filter((p) => p.value < MAX_BLOCK_USDC)
      .sort((a, b) => a.blockNumber - b.blockNumber);
  } catch {
    return [];
  }
}

function computeTopAddresses(allTxs: BlockTx[]): TopAddress[] {
  try {
    const counts = new Map<string, number>();
    for (const tx of allTxs) {
      const addr = tx.from.toLowerCase();
      counts.set(addr, (counts.get(addr) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([address, txCount]) => ({ address, txCount }))
      .sort((a, b) => b.txCount - a.txCount)
      .slice(0, 5);
  } catch {
    return [];
  }
}

export async function GET() {
  try {
    const cached = getCached<StatsPayload>(CACHE_KEY);
    if (cached) return NextResponse.json(cached);

    const [latestBlock, gasPrice] = await Promise.all([
      publicClient.getBlock({ blockTag: "latest" }),
      publicClient.getGasPrice(),
    ]);

    const latestNum = Number(latestBlock.number);

    const [blocks, txBlocks] = await Promise.all([
      Promise.all(
        Array.from({ length: BLOCK_DEPTH }, (_, i) =>
          publicClient.getBlock({ blockNumber: BigInt(latestNum - i) })
        )
      ),
      Promise.all(
        Array.from({ length: TX_BLOCK_DEPTH }, (_, i) =>
          publicClient.getBlock({
            blockNumber: BigInt(latestNum - i),
            includeTransactions: true,
          })
        )
      ),
    ]);

    blocks.sort((a, b) => Number(a.number) - Number(b.number));

    const allTxs = txBlocks.flatMap(extractTxs);

    const blockTimes: number[] = [];
    for (let i = 1; i < blocks.length; i++) {
      const dt = Number(blocks[i].timestamp) - Number(blocks[i - 1].timestamp);
      blockTimes.push(Math.max(dt, 0));
    }

    const avgBlockTime =
      blockTimes.length > 0
        ? Math.round(
            (blockTimes.reduce((a, b) => a + b, 0) / blockTimes.length) * 100
          ) / 100
        : 0;

    const txCounts = blocks.map((b) => b.transactions.length);
    const totalTxns = txCounts.reduce((a, b) => a + b, 0);
    const avgTxns = Math.round((totalTxns / blocks.length) * 10) / 10;
    const txnsInBlock = latestBlock.transactions.length;

    const safeBt = avgBlockTime > 0 ? avgBlockTime : 1;
    const rawTps = txnsInBlock / safeBt;
    const tps = Number.isFinite(rawTps) ? Math.round(rawTps * 10) / 10 : 0;

    const gasPcts = blocks.map((b) => {
      const limit = Number(b.gasLimit);
      return limit > 0 ? (Number(b.gasUsed) / limit) * 100 : 0;
    });
    const avgGasUsedPct =
      Math.round(
        (gasPcts.reduce((a, b) => a + b, 0) / gasPcts.length) * 10
      ) / 10;

    const tpsHistory: HistoryPoint[] = blocks.map((b, i) => {
      const bt =
        i > 0
          ? Math.max(
              Number(blocks[i].timestamp) - Number(blocks[i - 1].timestamp),
              0
            )
          : safeBt;
      const raw = bt > 0 ? b.transactions.length / bt : 0;
      return {
        blockNumber: Number(b.number),
        value: Number.isFinite(raw) ? Math.round(raw * 10) / 10 : 0,
      };
    });

    const gasUsageHistory: HistoryPoint[] = blocks.map((b, i) => ({
      blockNumber: Number(b.number),
      value: Math.round(gasPcts[i] * 10) / 10,
    }));

    const [activeWallets, contractsDeployed, totalGasFeesUsdc, usdcVolumeHistory, topAddresses] =
      await Promise.all([
        Promise.resolve(computeActiveWallets(allTxs)),
        Promise.resolve(computeContractsDeployed(allTxs)),
        Promise.resolve(computeTotalGasFeesUsdc(allTxs)),
        withTimeout(computeUsdcVolumeHistory(blocks), LOGS_TIMEOUT_MS, []),
        Promise.resolve(computeTopAddresses(allTxs)),
      ]);

    const data: StatsPayload = {
      blockNumber: latestNum,
      gasPrice: formatUnits(gasPrice, 9),
      txnsInBlock,
      avgTxnsPerBlock: avgTxns,
      avgBlockTime,
      tps,
      avgGasUsedPct,
      totalTxns20Blocks: totalTxns,
      tpsHistory,
      gasUsageHistory,
      timestamp: Number(latestBlock.timestamp),
      activeWallets,
      contractsDeployed,
      totalGasFeesUsdc,
      usdcVolumeHistory,
      topAddresses,
    };

    setCache(CACHE_KEY, data, TTL);
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
