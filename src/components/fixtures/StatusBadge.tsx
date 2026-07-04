import type { Match } from '../../api/footballApi'

type Status = Match['status']

const cfg: Record<Status, { label: string; className: string }> = {
  IN_PLAY: { label: 'LIVE', className: 'bg-live text-white animate-pulse' },
  PAUSED: { label: 'HT', className: 'bg-yellow-500 text-black' },
  FINISHED: { label: 'FT', className: 'bg-white/20 text-white/70' },
  SCHEDULED: { label: 'vs', className: 'bg-white/10 text-white/50' },
  TIMED: { label: 'vs', className: 'bg-white/10 text-white/50' },
  POSTPONED: { label: 'PPD', className: 'bg-orange-500 text-white' },
  CANCELLED: { label: 'CXL', className: 'bg-red-800 text-white' },
}

export default function StatusBadge({ status }: { status: Status }) {
  const { label, className } = cfg[status] ?? cfg.SCHEDULED
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-heading tracking-wider ${className}`}>
      {label}
    </span>
  )
}
