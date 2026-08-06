// Skeleton mirroring the new Research index layout so the swap-in doesn't jump:
// centered head, The Numbers block, then the article grid — all borderless on
// the #f1f1f1 body.
export default function ArticlesLoading() {
  return (
    <main className="px-3 pb-16 md:px-[18px]">
      {/* Head */}
      <div className="mx-auto flex max-w-[720px] flex-col items-center gap-5 px-3 pt-10 text-center md:pt-16">
        <div className="h-16 w-72 animate-pulse rounded-[16px] bg-emn-black/10 md:h-24 md:w-[420px]" />
        <div className="h-6 w-full max-w-[600px] animate-pulse rounded-[8px] bg-emn-black/10" />
      </div>

      {/* The Numbers */}
      <div className="mx-auto mt-16 max-w-[1236px] px-3 md:px-[18px]">
        <div className="h-10 w-56 animate-pulse rounded-[8px] bg-emn-black/10" />
        <div className="mt-6 h-64 w-full animate-pulse rounded-[18px] bg-emn-black/10" />
      </div>

      {/* Article grid */}
      <div className="mx-auto mt-16 max-w-[1236px] px-3 md:px-[18px]">
        <div className="mb-8 h-10 w-40 animate-pulse rounded-[8px] bg-emn-black/10" />
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-[360px] animate-pulse rounded-[18px] bg-emn-black/10"
            />
          ))}
        </div>
      </div>
    </main>
  );
}
