import { NextResponse } from "next/server";
import { publicClient } from "@/lib/arc";
import { getCached, setCache } from "@/lib/cache";

const CACHE_KEY = "recent-blocks-v2";
const TTL = 3_000;
const BLOCK_COUNT = 15;

interface BlockRow {
  number: number;
  hash: string;
  timestamp: number;
  transactionCount: number;
  gasUsed: string;
  gasLimit: string;
  gasUsedPct: number;
  miner: string;
  size: number | null;
  blockTime: number;
}

export async function GET() {
  try {
    const cached = getCached<BlockRow[]>(CACHE_KEY);
    if (cached) return NextResponse.json(cached);

    const latest = await publicClient.getBlock({ blockTag: "latest" });
    const latestNum = Number(latest.number);

    const blockPromises = Array.from({ length: BLOCK_COUNT + 1 }, (_, i) =>
      publicClient.getBlock({ blockNumber: BigInt(latestNum - i) })
    );
    const rawBlocks = await Promise.all(blockPromises);
    rawBlocks.sort((a, b) => Number(b.number) - Number(a.number));

    const data: BlockRow[] = [];
    for (let i = 0; i < BLOCK_COUNT; i++) {
      const b = rawBlocks[i];
      const prev = rawBlocks[i + 1];
      const gasUsed = Number(b.gasUsed);
      const gasLimit = Number(b.gasLimit);
      const gasUsedPct = gasLimit > 0 ? Math.round((gasUsed / gasLimit) * 1000) / 10 : 0;
      const blockTime = prev ? Math.max(Number(b.timestamp) - Number(prev.timestamp), 0) : 0;

      data.push({
        number: Number(b.number),
        hash: b.hash,
        timestamp: Number(b.timestamp),
        transactionCount: b.transactions.length,
        gasUsed: b.gasUsed.toString(),
        gasLimit: b.gasLimit.toString(),
        gasUsedPct,
        miner: b.miner,
        size: b.size ? Number(b.size) : null,
        blockTime,
      });
    }

    setCache(CACHE_KEY, data, TTL);
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
