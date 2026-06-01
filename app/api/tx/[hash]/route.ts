import { NextRequest, NextResponse } from "next/server";
import { publicClient } from "@/lib/arc";
import { formatUnits } from "viem";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ hash: string }> }
) {
  try {
    const { hash } = await params;
    if (!hash.startsWith("0x") || hash.length !== 66) {
      return NextResponse.json({ error: "Invalid transaction hash" }, { status: 400 });
    }

    const txHash = hash as `0x${string}`;
    const [tx, receipt] = await Promise.all([
      publicClient.getTransaction({ hash: txHash }),
      publicClient.getTransactionReceipt({ hash: txHash }),
    ]);

    const logs = receipt.logs.map((log) => ({
      logIndex: Number(log.logIndex),
      address: log.address,
      topics: log.topics,
      data: log.data,
    }));

    const data = {
      hash: tx.hash,
      from: tx.from,
      to: tx.to ?? null,
      value: formatUnits(tx.value, 18),
      gasPrice: tx.gasPrice ? formatUnits(tx.gasPrice, 9) : "0",
      gas: tx.gas.toString(),
      nonce: tx.nonce,
      blockNumber: Number(tx.blockNumber),
      blockHash: tx.blockHash,
      transactionIndex: Number(tx.transactionIndex),
      input: tx.input,
      status: receipt.status === "success" ? "success" : "failed",
      gasUsed: receipt.gasUsed.toString(),
      effectiveGasPrice: receipt.effectiveGasPrice
        ? formatUnits(receipt.effectiveGasPrice, 9)
        : "0",
      cumulativeGasUsed: receipt.cumulativeGasUsed.toString(),
      contractAddress: receipt.contractAddress ?? null,
      logs,
    };

    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
