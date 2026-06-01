import { NextRequest, NextResponse } from "next/server";
import { publicClient } from "@/lib/arc";
import { formatUnits } from "viem";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ number: string }> }
) {
  try {
    const { number } = await params;
    const blockNum = parseInt(number, 10);
    if (isNaN(blockNum) || blockNum < 0) {
      return NextResponse.json({ error: "Invalid block number" }, { status: 400 });
    }

    const block = await publicClient.getBlock({
      blockNumber: BigInt(blockNum),
      includeTransactions: true,
    });

    const txs = block.transactions
      .filter((tx): tx is Exclude<typeof tx, string> => typeof tx !== "string")
      .map((tx) => ({
        hash: tx.hash,
        from: tx.from,
        to: tx.to ?? null,
        value: formatUnits(tx.value, 18),
        gasPrice: tx.gasPrice ? formatUnits(tx.gasPrice, 9) : "0",
        nonce: tx.nonce,
        transactionIndex: tx.transactionIndex ?? 0,
      }));

    const data = {
      number: Number(block.number),
      hash: block.hash,
      parentHash: block.parentHash,
      timestamp: Number(block.timestamp),
      miner: block.miner,
      gasUsed: block.gasUsed.toString(),
      gasLimit: block.gasLimit.toString(),
      baseFeePerGas: block.baseFeePerGas ? block.baseFeePerGas.toString() : null,
      transactionCount: block.transactions.length,
      size: block.size ? Number(block.size) : null,
      transactions: txs,
    };

    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
