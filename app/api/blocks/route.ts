import { NextResponse } from "next/server";
import { publicClient } from "@/lib/arc";
import { getCached, setCache } from "@/lib/cache";

const CACHE_KEY = "recent-blocks";
const TTL = 3_000;
const BLOCK_COUNT = 10;

interface BlockSummary {
  number: number;
  hash: string;
  timestamp: number;
  transactionCount: number;
  gasUsed: string;
  gasLimit: string;
  miner: string;
}

export async function GET() {
  try {
    const cached = getCached<BlockSummary[]>(CACHE_KEY);
    if (cached) return NextResponse.json(cached);

    const latest = await publicClient.getBlock({ blockTag: "latest" });
    const latestNumber = Number(latest.number);

    const blockPromises = Array.from({ length: BLOCK_COUNT }, (_, i) =>
      publicClient.getBlock({ blockNumber: BigInt(latestNumber - i) })
    );

    const blocks = await Promise.all(blockPromises);

    const data: BlockSummary[] = blocks.map((b) => ({
      number: Number(b.number),
      hash: b.hash,
      timestamp: Number(b.timestamp),
      transactionCount: b.transactions.length,
      gasUsed: b.gasUsed.toString(),
      gasLimit: b.gasLimit.toString(),
      miner: b.miner,
    }));

    setCache(CACHE_KEY, data, TTL);
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
