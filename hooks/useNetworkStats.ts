import { useQuery } from "@tanstack/react-query";

export interface NetworkStats {
  blockNumber: number;
  timestamp: number;
  gasPrice: string;
  transactionCount: number;
  gasUsed: string;
  gasLimit: string;
  hash: string;
}

async function fetchStats(): Promise<NetworkStats> {
  const res = await fetch("/api/stats");
  if (!res.ok) throw new Error("Failed to fetch network stats");
  return res.json();
}

export function useNetworkStats() {
  return useQuery<NetworkStats>({
    queryKey: ["network-stats"],
    queryFn: fetchStats,
    refetchInterval: 5_000,
  });
}
