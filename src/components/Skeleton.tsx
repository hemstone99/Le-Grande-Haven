export function CardSkeleton() {
  return (
    <div className="rounded-3xl overflow-hidden bg-cream border border-forest/5">
      <div className="h-56 skeleton" />
      <div className="p-6 space-y-3">
        <div className="h-4 w-3/4 skeleton rounded" />
        <div className="h-3 w-full skeleton rounded" />
        <div className="h-3 w-2/3 skeleton rounded" />
      </div>
    </div>
  )
}
export function LineSkeleton({ n = 5 }: { n?: number }) {
  return <div className="space-y-2">{Array.from({ length: n }).map((_, i) => <div key={i} className="h-4 skeleton rounded" />)}</div>
}
