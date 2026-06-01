import { NextResponse } from "next/server";
import { publicClient } from "@/lib/arc";
import { getCached, setCache } from "@/lib/cache";
import { formatUnits } from "viem";

const CACHE_KEY = "network-stats";
const TTL = 5_000;

export async function GET() {
  try {
    const cached = getCached<Record<string, unknown>>(CACHE_KEY);
    if (cached) return NextResponse.json(cached);

    const block = await publicClient.getBlock({ blockTag: "latest" });
    const gasPrice = await publicClient.getGasPrice();

    const data = {
      blockNumber: Number(block.number),
      timestamp: Number(block.timestamp),
      gasPrice: formatUnits(gasPrice, 9),
      transactionCount: block.transactions.length,
      gasUsed: block.gasUsed.toString(),
      gasLimit: block.gasLimit.toString(),
      hash: block.hash,
    };

    setCache(CACHE_KEY, data, TTL);
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
