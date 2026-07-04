import { useEffect, useState } from 'react'

function formatCountdown(ms: number) {
  if (ms <= 0) return 'KICK OFF'
  const h = Math.floor(ms / 3_600_000)
  const m = Math.floor((ms % 3_600_000) / 60_000)
  const s = Math.floor((ms % 60_000) / 1000)
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

export default function CountdownTimer({ utcDate }: { utcDate: string }) {
  const [ms, setMs] = useState(() => new Date(utcDate).getTime() - Date.now())

  useEffect(() => {
    const i = setInterval(() => {
      setMs(new Date(utcDate).getTime() - Date.now())
    }, 1000)
    return () => clearInterval(i)
  }, [utcDate])

  return (
    <span className="text-gold font-heading text-sm tabular-nums">
      {formatCountdown(ms)}
    </span>
  )
}
