import { NextResponse } from "next/server";
import { publicClient } from "@/lib/arc";
import { getCached, setCache } from "@/lib/cache";
import { formatUnits } from "viem";

const CACHE_KEY = "recent-transactions";
const TTL = 5_000;

const TRANSFER_TOPIC =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

// TODO: Replace with actual USDC contract address on Arc Testnet once known
// const USDC_CONTRACT = "0x...";

interface TxSummary {
  hash: string;
  from: string;
  to: string | null;
  value: string;
  gasPrice: string;
  nonce: number;
  blockNumber: number;
  blockHash: string;
  transactionIndex: number;
  usdcValue: string | null;
}

export async function GET() {
  try {
    const cached = getCached<TxSummary[]>(CACHE_KEY);
    if (cached) return NextResponse.json(cached);

    const block = await publicClient.getBlock({
      blockTag: "latest",
      includeTransactions: true,
    });

    const rawTxs = block.transactions.filter(
      (tx): tx is Exclude<typeof tx, string> => typeof tx !== "string"
    );

    const receipts = await Promise.allSettled(
      rawTxs.map((tx) =>
        publicClient.getTransactionReceipt({ hash: tx.hash })
      )
    );

    const txs: TxSummary[] = rawTxs.map((tx, i) => {
      let usdcValue: string | null = null;

      const receiptResult = receipts[i];
      if (receiptResult.status === "fulfilled") {
        const receipt = receiptResult.value;
        for (const log of receipt.logs) {
          if (
            log.topics[0] === TRANSFER_TOPIC &&
            log.topics.length >= 3 &&
            log.data &&
            log.data !== "0x"
          ) {
            try {
              const rawAmount = BigInt(log.data);
              usdcValue = formatUnits(rawAmount, 6);
            } catch {
              // non-standard log data
            }
            break;
          }
        }
      }

      return {
        hash: tx.hash,
        from: tx.from,
        to: tx.to ?? null,
        value: formatUnits(tx.value, 18),
        gasPrice: tx.gasPrice ? formatUnits(tx.gasPrice, 9) : "0",
        nonce: tx.nonce,
        blockNumber: Number(tx.blockNumber),
        blockHash: tx.blockHash ?? "",
        transactionIndex: tx.transactionIndex ?? 0,
        usdcValue,
      };
    });

    setCache(CACHE_KEY, txs, TTL);
    return NextResponse.json(txs);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
