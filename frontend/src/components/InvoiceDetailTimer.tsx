import { useState, useEffect, useRef } from 'react';

/**
 * Parses seconds remaining into { days, hours, minutes, seconds }.
 */
function parseCountdown(totalSeconds: number) {
  const s = Math.max(0, totalSeconds);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export interface CountdownTimerProps {
  expiresAt: number;
  onExpired?: () => void;
}

export function CountdownTimer({ expiresAt, onExpired }: CountdownTimerProps) {
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, expiresAt - Math.floor(Date.now() / 1000))
  );
  const onExpiredRef = useRef(onExpired);
  onExpiredRef.current = onExpired;

  useEffect(() => {
    if (remaining <= 0) return;

    const id = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const diff = expiresAt - now;
      if (diff <= 0) {
        setRemaining(0);
        clearInterval(id);
        onExpiredRef.current?.();
      } else {
        setRemaining(diff);
      }
    }, 1000);

    return () => clearInterval(id);
  }, [expiresAt, remaining]);

  if (remaining <= 0) return null;

  const { days, hours, minutes, seconds } = parseCountdown(remaining);

  return (
    <div className="countdown" role="timer" aria-live="off" aria-label="Time remaining">
      {days > 0 && (
        <span className="countdown__segment">
          <strong>{days}</strong>
          <small>d</small>
        </span>
      )}
      <span className="countdown__segment">
        <strong>{pad(hours)}</strong>
        <small>h</small>
      </span>
      <span className="countdown__segment">
        <strong>{pad(minutes)}</strong>
        <small>m</small>
      </span>
      <span className="countdown__segment">
        <strong>{pad(seconds)}</strong>
        <small>s</small>
      </span>
    </div>
  );
}

export interface InvoiceDetailTimerProps {
  invoice: {
    expires_at: number;
    status: string;
  };
  onRefresh?: () => Promise<void> | void;
}

export default function InvoiceDetailTimer({ invoice, onRefresh }: InvoiceDetailTimerProps) {
  const isExpired =
    invoice.status === 'Expired' ||
    invoice.expires_at <= Math.floor(Date.now() / 1000);

  async function handleExpired() {
    try {
      await onRefresh?.();
    } catch {
      // silently ignore refresh errors
    }
  }

  if (isExpired) {
    return (
      <span className="badge badge--expired" aria-label="Invoice expired">
        Expired
      </span>
    );
  }

  return (
    <CountdownTimer expiresAt={invoice.expires_at} onExpired={handleExpired} />
  );
}
