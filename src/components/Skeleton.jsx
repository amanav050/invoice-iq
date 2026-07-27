export function SkeletonLine({ width = 'w-full', height = 'h-4' }) {
  return (
    <div className={`relative overflow-hidden ${width} ${height} rounded-lg bg-white/[0.03]`}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent animate-[shimmer_2s_infinite]" />
    </div>
  )
}

export function SkeletonBlock() {
  return (
    <div className="space-y-5 p-6">
      <SkeletonLine width="w-1/3" height="h-5" />
      <div className="flex justify-center py-8">
        <div className="relative overflow-hidden w-32 h-32 rounded-full bg-white/[0.03]">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent animate-[shimmer_2s_infinite]" />
        </div>
      </div>
      <div className="space-y-3">
        <SkeletonLine />
        <SkeletonLine width="w-4/5" />
        <SkeletonLine width="w-3/5" />
      </div>
      <div className="space-y-3 pt-2">
        <SkeletonLine height="h-20" />
        <SkeletonLine height="h-20" />
      </div>
    </div>
  )
}