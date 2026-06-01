import { useQuery } from "@tanstack/react-query";

export interface HistoryPoint {
  blockNumber: number;
  value: number;
}

export interface NetworkStats {
  blockNumber: number;
  gasPrice: string;
  txnsInBlock: number;
  avgTxnsPerBlock: number;
  avgBlockTime: number;
  tps: number;
  avgGasUsedPct: number;
  totalTxns20Blocks: number;
  tpsHistory: HistoryPoint[];
  gasUsageHistory: HistoryPoint[];
  timestamp: number;
}

async function fetchStats(): Promise<NetworkStats> {
  const res = await fetch("/api/stats");
  if (!res.ok) throw new Error("Failed to fetch network stats");
  return res.json();
}

export function useNetworkStats() {
  const query = useQuery<NetworkStats>({
    queryKey: ["network-stats"],
    queryFn: fetchStats,
    refetchInterval: 4_000,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,

    blockNumber: query.data?.blockNumber ?? 0,
    gasPrice: query.data?.gasPrice ?? "0",
    txnsInBlock: query.data?.txnsInBlock ?? 0,
    avgBlockTime: query.data?.avgBlockTime ?? 0,
    tps: query.data?.tps ?? 0,
    avgTxnsPerBlock: query.data?.avgTxnsPerBlock ?? 0,
    avgGasUsedPct: query.data?.avgGasUsedPct ?? 0,
    tpsHistory: query.data?.tpsHistory ?? [],
    gasUsageHistory: query.data?.gasUsageHistory ?? [],
  };
}
