import { cn } from "@/app/lib/utils";

const bgColors = {
  black: "bg-emn-black",
  "green-dark": "bg-emn-green-dark",
  "green-mid": "bg-emn-green-mid",
} as const;

type SectionContainerProps = {
  color: keyof typeof bgColors;
  className?: string;
  children: React.ReactNode;
};

export default function SectionContainer({
  color,
  className,
  children,
}: SectionContainerProps) {
  return (
    <section
      className={cn(
        "flex w-full max-w-[1190px] flex-col items-center gap-10 rounded-section px-6 py-12 md:gap-[45px] md:px-[30px] md:py-16",
        bgColors[color],
        className,
      )}
    >
      {children}
    </section>
  );
}
