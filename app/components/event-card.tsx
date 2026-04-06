"use client";

import React from "react";
import { cn } from "@/app/lib/utils";
import LeafHeading from "./leaf-heading";

interface EventCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  date: string;
  location: string;
  description: string;
  imageSrc: string;
}

const PUB_NIGHT_IMAGE =
  "https://www.figma.com/api/mcp/asset/11e3b0b0-cb49-4981-9b84-ca49c24e1cf6";

export default function EventCard({
  title,
  date,
  location,
  description,
  imageSrc = PUB_NIGHT_IMAGE,
  className,
  ...props
}: EventCardProps) {
  return (
    <div
      className={cn(
        "relative w-full max-w-[600px] rounded-2xl border-[4px] border-[#18512d] bg-[#f1f1f1] pb-6 shadow-sm",
        className
      )}
      {...props}
    >
      <div className="relative h-[260px] w-full overflow-hidden rounded-t-2xl">
        <img
          src={imageSrc}
          alt={title}
          className="size-full object-cover"
        />
      </div>

      <div className="absolute -top-9 left-6">
        <LeafHeading
          as="div"
          variant="light"
          className="border-[4px] border-[#18512d] bg-[#f1f1f1] text-[#18512d]"
          style={{ backgroundColor: "#f1f1f1" }}
        >
          {title}
        </LeafHeading>
      </div>

      <div className="mt-6 px-6">
        <div className="flex flex-col gap-1 text-[#18512d] text-sm md:text-base font-semibold md:flex-row md:items-center md:justify-between">
          <p>{date}</p>
          <p className="md:text-right">{location}</p>
        </div>
        <p className="mt-3 text-[#18512d] text-sm md:text-base font-normal max-w-[380px]">
          {description}
        </p>
      </div>
    </div>
  );
}

