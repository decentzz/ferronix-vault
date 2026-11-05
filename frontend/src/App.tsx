import React, { useState } from 'react';
import { VaultEntry, VaultStats } from './types/vault';

export default function App() {
  const [account] = useState<string>('G...8K2P');
  const [deposits, setDeposits] = useState<VaultEntry[]>([
    {
      id: 1,
      depositor: 'G...8K2P',
      token: 'USDC (Stellar)',
      amount: '500.00',
      unlockTimestamp: Math.floor(Date.now() / 1000) + 86400 * 3, // 3 days
      withdrawn: false,
      createdAt: Math.floor(Date.now() / 1000) - 3600,
    },
    {
      id: 2,
      depositor: 'G...8K2P',
      token: 'XLM (Native)',
      amount: '1,250.00',
      unlockTimestamp: Math.floor(Date.now() / 1000) - 100, // unlocked
      withdrawn: false,
      createdAt: Math.floor(Date.now() / 1000) - 86400 * 7,
    },
  ]);

  const [token, setToken] = useState('USDC (Stellar)');
  const [amount, setAmount] = useState('');
  const [lockDays, setLockDays] = useState('7');

  const nowSecs = Math.floor(Date.now() / 1000);

  const stats: VaultStats = {
    totalDeposited: '1,750.00 XLM/USDC',
    activeDepositsCount: deposits.filter((d) => !d.withdrawn).length,
    totalWithdrawn: '0.00',
    vaultStatus: 'active',
  };

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    const newEntry: VaultEntry = {
      id: deposits.length + 1,
      depositor: account,
      token,
      amount: parseFloat(amount).toFixed(2),
      unlockTimestamp: nowSecs + parseInt(lockDays, 10) * 86400,
      withdrawn: false,
      createdAt: nowSecs,
    };

    setDeposits([newEntry, ...deposits]);
    setAmount('');
  };

  const handleWithdraw = (id: number) => {
    setDeposits((prev) =>
      prev.map((d) => (d.id === id ? { ...d, withdrawn: true } : d))
    );
  };

  const formatRemaining = (unlockTs: number) => {
    const diff = unlockTs - nowSecs;
    if (diff <= 0) return 'Unlocked';
    const days = Math.floor(diff / 86400);
    const hours = Math.floor((diff % 86400) / 3600);
    return `${days}d ${hours}h remaining`;
  };

  return (
    <div className="container">
      {/* Header */}
      <header>
        <div className="brand">
          <div className="brand-icon">⏳</div>
          <div>
            <h1 className="brand-title">Ferronix Vault</h1>
            <p className="brand-subtitle">Soroban Smart Contract dApp • Stellar Network</p>
          </div>
        </div>
        <div className="wallet-badge">
          <span className="status-dot"></span>
          <span>Account: {account}</span>
        </div>
      </header>

      {/* Global Stats */}
      <div className="stats-grid">
        <div className="card">
          <div className="stat-label">Vault State</div>
          <div className="stat-value" style={{ color: '#10b981', textTransform: 'capitalize' }}>
            {stats.vaultStatus}
          </div>
        </div>
        <div className="card">
          <div className="stat-label">Active Time-Locks</div>
          <div className="stat-value">{stats.activeDepositsCount}</div>
        </div>
        <div className="card">
          <div className="stat-label">Total Vaulted Value</div>
          <div className="stat-value">{stats.totalDeposited}</div>
        </div>
      </div>

      {/* Main Layout: Deposit Form & Active Locks */}
      <div className="layout-grid">
        {/* Deposit Card */}
        <div className="card">
          <h2 style={{ marginBottom: '1.25rem', fontSize: '1.25rem' }}>Create Time-Lock</h2>
          <form onSubmit={handleDeposit}>
            <div className="form-group">
              <label>Asset / Token</label>
              <select value={token} onChange={(e) => setToken(e.target.value)}>
                <option value="USDC (Stellar)">USDC (Stellar)</option>
                <option value="XLM (Native)">XLM (Native)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Amount</label>
              <input
                type="number"
                step="any"
                min="0.01"
                placeholder="e.g. 100.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Lock Duration</label>
              <select value={lockDays} onChange={(e) => setLockDays(e.target.value)}>
                <option value="1">1 Day</option>
                <option value="3">3 Days</option>
                <option value="7">7 Days (1 Week)</option>
                <option value="30">30 Days (1 Month)</option>
                <option value="90">90 Days (3 Months)</option>
                <option value="365">365 Days (1 Year)</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
              Deposit & Lock Assets
            </button>
          </form>
        </div>

        {/* Active Deposits List */}
        <div className="card">
          <h2 style={{ marginBottom: '1.25rem', fontSize: '1.25rem' }}>Your Vault Deposits</h2>
          {deposits.length === 0 ? (
            <div className="empty-state">No deposits recorded in this vault.</div>
          ) : (
            <div>
              {deposits.map((item) => {
                const isUnlocked = nowSecs >= item.unlockTimestamp;
                return (
                  <div key={item.id} className="deposit-item">
                    <div className="deposit-info">
                      <div className="deposit-amount">
                        {item.amount} {item.token}
                      </div>
                      <div className="deposit-meta">
                        Deposit #{item.id} • Unlock:{' '}
                        {new Date(item.unlockTimestamp * 1000).toLocaleDateString()} (
                        {formatRemaining(item.unlockTimestamp)})
                      </div>
                    </div>

                    <div>
                      {item.withdrawn ? (
                        <span className="badge badge-withdrawn">Withdrawn</span>
                      ) : isUnlocked ? (
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => handleWithdraw(item.id)}
                        >
                          Withdraw
                        </button>
                      ) : (
                        <span className="badge badge-locked">
                          {formatRemaining(item.unlockTimestamp)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
