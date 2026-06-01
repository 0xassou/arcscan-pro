import { useQuery } from "@tanstack/react-query";

export interface BlockSummary {
  number: number;
  hash: string;
  timestamp: number;
  transactionCount: number;
  gasUsed: string;
  gasLimit: string;
  miner: string;
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
