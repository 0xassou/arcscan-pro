import { useQuery } from "@tanstack/react-query";

export interface WalletTransaction {
  hash: string;
  from: string;
  to: string | null;
  value: string;
  blockNumber: number;
}

export interface WalletData {
  address: string;
  balance: string;
  transactionCount: number;
  recentTransactions: WalletTransaction[];
}

async function fetchWallet(address: string): Promise<WalletData> {
  const res = await fetch(`/api/wallet/${address}`);
  if (!res.ok) throw new Error("Failed to fetch wallet data");
  return res.json();
}

export function useWallet(address: string | undefined) {
  return useQuery<WalletData>({
    queryKey: ["wallet", address],
    queryFn: () => fetchWallet(address!),
    enabled: !!address,
    refetchInterval: 15_000,
  });
}
