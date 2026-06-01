import { useQuery } from "@tanstack/react-query";

export interface TransactionSummary {
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

async function fetchTransactions(): Promise<TransactionSummary[]> {
  const res = await fetch("/api/transactions");
  if (!res.ok) throw new Error("Failed to fetch transactions");
  return res.json();
}

export function useTransactions() {
  return useQuery<TransactionSummary[]>({
    queryKey: ["recent-transactions"],
    queryFn: fetchTransactions,
    refetchInterval: 5_000,
  });
}
