import { NextRequest, NextResponse } from "next/server";
import { publicClient } from "@/lib/arc";
import { formatUnits, isAddress } from "viem";
import { getCached, setCache } from "@/lib/cache";

const TTL = 10_000;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;

    if (!isAddress(address)) {
      return NextResponse.json(
        { error: "Invalid Ethereum address" },
        { status: 400 }
      );
    }

    const cacheKey = `wallet-${address}`;
    const cached = getCached<Record<string, unknown>>(cacheKey);
    if (cached) return NextResponse.json(cached);

    const [balance, txCount] = await Promise.all([
      publicClient.getBalance({ address: address as `0x${string}` }),
      publicClient.getTransactionCount({ address: address as `0x${string}` }),
    ]);

    let recentTxs: Record<string, unknown>[] = [];
    try {
      const latestBlock = await publicClient.getBlock({
        blockTag: "latest",
        includeTransactions: true,
      });

      const scanDepth = 20;
      const latestNum = Number(latestBlock.number);
      const blocksToScan = Array.from({ length: scanDepth }, (_, i) =>
        publicClient.getBlock({
          blockNumber: BigInt(latestNum - i),
          includeTransactions: true,
        })
      );

      const blocks = await Promise.all(blocksToScan);
      const addrLower = address.toLowerCase();

      for (const block of blocks) {
        for (const tx of block.transactions) {
          if (typeof tx === "string") continue;
          if (
            tx.from.toLowerCase() === addrLower ||
            (tx.to && tx.to.toLowerCase() === addrLower)
          ) {
            recentTxs.push({
              hash: tx.hash,
              from: tx.from,
              to: tx.to,
              value: formatUnits(tx.value, 18),
              blockNumber: Number(tx.blockNumber),
            });
          }
        }
        if (recentTxs.length >= 20) break;
      }
    } catch {
      // scan failure is non-critical
    }

    const data = {
      address,
      balance: formatUnits(balance, 18),
      transactionCount: txCount,
      recentTransactions: recentTxs.slice(0, 20),
    };

    setCache(cacheKey, data, TTL);
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
