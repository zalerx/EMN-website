import React from "react";
import { cn } from "@/app/lib/utils";

interface EventCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  date: string;
  description: string;
  imageSrc: string;
}

export default function EventCard({
  title,
  date,
  description,
  imageSrc,
  className,
  ...props
}: EventCardProps) {
  return (
    <div
      className={cn(
        "rounded-[14px] border-4 border-emn-offwhite p-2",
        className
      )}
      {...props}
    >
      <div className="flex w-[272px] flex-col gap-2 rounded-[11px] border-4 border-emn-offwhite bg-emn-offwhite p-[10px]">
        <div className="h-[247px] w-[252px] overflow-hidden rounded-[24px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt={title}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex w-full flex-col items-center gap-2 text-center text-emn-green-dark">
          <p className="font-candu text-heading uppercase">{title}</p>
          <p className="text-base font-bold uppercase">{date}</p>
          <p className="text-base font-normal">{description}</p>
        </div>
      </div>
    </div>
  );
}
