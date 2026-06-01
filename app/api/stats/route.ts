import { NextResponse } from "next/server";
import { publicClient } from "@/lib/arc";
import { getCached, setCache } from "@/lib/cache";
import { formatUnits } from "viem";

const CACHE_KEY = "network-stats-v3";
const TTL = 4_000;
const BLOCK_DEPTH = 20;

interface HistoryPoint {
  blockNumber: number;
  value: number;
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

    const blockPromises = Array.from({ length: BLOCK_DEPTH }, (_, i) =>
      publicClient.getBlock({ blockNumber: BigInt(latestNum - i) })
    );
    const blocks = await Promise.all(blockPromises);

    blocks.sort((a, b) => Number(a.number) - Number(b.number));

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
    const avgTxns =
      Math.round((totalTxns / blocks.length) * 10) / 10;
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
    };

    setCache(CACHE_KEY, data, TTL);
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
