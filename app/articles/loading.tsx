import Container from "@/app/components/container";

// Skeleton mirroring the index layout so the swap-in doesn't jump.
export default function ArticlesLoading() {
  return (
    <div className="min-h-screen bg-background p-3 md:p-8">
      <Container className="max-w-[1236px]">
        <div className="mb-6 h-16 w-72 animate-pulse rounded-[12px] bg-emn-black/10 md:h-20" />
        <div className="mb-8 h-6 w-full max-w-[600px] animate-pulse rounded-[8px] bg-emn-black/10" />
        <div className="mb-10 h-12 w-full max-w-[480px] animate-pulse rounded-full bg-emn-black/10" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-[360px] animate-pulse rounded-[16px] bg-emn-black/10"
            />
          ))}
        </div>
      </Container>
    </div>
  );
}
