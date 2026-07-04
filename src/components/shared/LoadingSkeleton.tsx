export function SkeletonCard({ className = '' }: { className?: string }) {
  return <div className={`skeleton rounded-xl ${className}`} />
}

export function SkeletonText({ className = '' }: { className?: string }) {
  return <div className={`skeleton rounded h-4 ${className}`} />
}

export function MatchCardSkeleton() {
  return (
    <div className="bg-pitch-mid rounded-xl p-4 space-y-3">
      <SkeletonText className="w-24" />
      <div className="flex items-center gap-3">
        <SkeletonCard className="w-8 h-8 rounded-full" />
        <SkeletonText className="flex-1" />
        <SkeletonCard className="w-16 h-8" />
        <SkeletonText className="flex-1" />
        <SkeletonCard className="w-8 h-8 rounded-full" />
      </div>
    </div>
  )
}
