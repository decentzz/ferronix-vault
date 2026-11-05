export interface VaultEntry {
  id: number;
  depositor: string;
  token: string;
  amount: string;
  unlockTimestamp: number;
  unlockLedger?: number;
  withdrawn: boolean;
  createdAt: number;
}

export interface VaultStats {
  totalDeposited: string;
  activeDepositsCount: number;
  totalWithdrawn: string;
  vaultStatus: 'active' | 'paused';
}
