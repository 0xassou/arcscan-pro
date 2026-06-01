import { useQuery } from "@tanstack/react-query";

export interface BlockSummary {
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

async function fetchBlocks(): Promise<BlockSummary[]> {
  const res = await fetch("/api/blocks");
  if (!res.ok) throw new Error("Failed to fetch blocks");
  return res.json();
}

export function useBlocks() {
  return useQuery<BlockSummary[]>({
    queryKey: ["recent-blocks"],
    queryFn: fetchBlocks,
    refetchInterval: 4_000,
  });
}
