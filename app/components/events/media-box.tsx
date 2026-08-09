import { cn } from "@/app/lib/utils";

// The striped green placeholder shown behind an image slot until a photo is
// present — lifted from the Events.html mock's .media-box background.
const STRIPE = "repeating-linear-gradient(45deg,#d6e6cd 0 14px,#c9e3b8 14px 28px)";

// Shared image frame for cards, the headline, the detail hero and galleries.
// Sizing/rounding come from `className`; the image fills the frame.
export default function MediaBox({
  src,
  alt,
  className,
  imgClassName,
}: {
  src: string | null;
  alt: string;
  className?: string;
  imgClassName?: string;
}) {
  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{ background: STRIPE }}
    >
      {src && (
        // eslint-disable-next-line @next/next/no-img-element -- Supabase public bucket
        <img
          src={src}
          alt={alt}
          className={cn("absolute inset-0 h-full w-full object-cover", imgClassName)}
        />
      )}
    </div>
  );
}
