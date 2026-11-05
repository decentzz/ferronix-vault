import React, { useState, useEffect, useCallback } from 'react';

const EVENT_TYPES = [
  'deposit_created',
  'deposit_withdrawn',
  'deposit_cancelled',
  'vault_paused',
  'vault_unpaused',
];

const PAGE_SIZE = 20;

export interface EventData {
  timestamp: number;
  event_type: string;
  address?: string;
  amount?: string;
  tx_hash?: string;
}

async function fetchEvents(params: {
  eventType?: string;
  address?: string;
  dateFrom?: string;
  dateTo?: string;
  page: number;
}): Promise<{ events: EventData[]; total: number }> {
  // In demo or local mode, fallback gracefully if indexer API is not present
  try {
    const searchParams = new URLSearchParams({
      page: String(params.page),
      limit: String(PAGE_SIZE),
    });
    if (params.eventType) searchParams.set('event_type', params.eventType);
    if (params.address) searchParams.set('address', params.address);
    if (params.dateFrom) searchParams.set('date_from', params.dateFrom);
    if (params.dateTo) searchParams.set('date_to', params.dateTo);

    const res = await fetch(`/api/events?${searchParams}`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return await res.json();
  } catch {
    return { events: [], total: 0 };
  }
}

function EventRow({ event }: { event: EventData }) {
  return (
    <tr>
      <td style={{ padding: '0.6rem' }}>{new Date(event.timestamp * 1000).toLocaleString()}</td>
      <td style={{ padding: '0.6rem' }}>
        <span className="badge badge-locked">{event.event_type}</span>
      </td>
      <td style={{ padding: '0.6rem' }} title={event.address}>
        {event.address ? `${event.address.slice(0, 6)}…${event.address.slice(-4)}` : '—'}
      </td>
      <td style={{ padding: '0.6rem' }}>{event.amount ?? '—'}</td>
      <td style={{ padding: '0.6rem' }}>
        {event.tx_hash ? (
          <a
            href={`https://stellar.expert/explorer/testnet/tx/${event.tx_hash}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#3b82f6' }}
          >
            {event.tx_hash.slice(0, 8)}…
          </a>
        ) : (
          '—'
        )}
      </td>
    </tr>
  );
}

export default function TransactionHistoryFeed() {
  const [filters, setFilters] = useState({
    eventType: '',
    address: '',
    dateFrom: '',
    dateTo: '',
  });
  const [page, setPage] = useState(1);
  const [events, setEvents] = useState<EventData[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchEvents({ ...filters, page });
      setEvents(data.events ?? []);
      setTotal(data.total ?? 0);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    load();
  }, [load]);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div style={{ marginTop: '2rem' }}>
      <h3 style={{ marginBottom: '1rem' }}>Transaction History</h3>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <select
          name="eventType"
          value={filters.eventType}
          onChange={handleFilterChange}
          aria-label="Filter by event type"
          style={{ width: 'auto' }}
        >
          <option value="">All event types</option>
          {EVENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <input
          type="text"
          name="address"
          placeholder="Filter by address"
          value={filters.address}
          onChange={handleFilterChange}
          aria-label="Filter by address"
          style={{ width: 'auto' }}
        />

        <button
          onClick={load}
          disabled={loading}
          className="btn btn-sm btn-primary"
          style={{ width: 'auto' }}
        >
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {error && <p style={{ color: '#ef4444' }}>{error}</p>}

      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <th style={{ padding: '0.6rem' }}>Time</th>
            <th style={{ padding: '0.6rem' }}>Event</th>
            <th style={{ padding: '0.6rem' }}>Address</th>
            <th style={{ padding: '0.6rem' }}>Amount</th>
            <th style={{ padding: '0.6rem' }}>Tx Hash</th>
          </tr>
        </thead>
        <tbody>
          {events.length === 0 && !loading ? (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center', padding: '1rem', color: '#94a3b8' }}>
                No events found.
              </td>
            </tr>
          ) : (
            events.map((ev, i) => (
              <EventRow key={`${ev.tx_hash ?? 'tx'}-${i}`} event={ev} />
            ))
          )}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', alignItems: 'center' }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="btn btn-sm"
          >
            ← Prev
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="btn btn-sm"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
