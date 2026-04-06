"use client";

import React from "react";
import { cn } from "@/app/lib/utils";

type LeafHeadingVariant = "light" | "medium" | "dark" | "black";

interface LeafHeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /**
   * Visual variant, mapped from Figma:
   * - light  -> #6fbe46  (15:65)
   * - medium -> #469042  (16:91)
   * - dark   -> #18512d  (16:482)
   * - black  -> #221f20  (16:484)
   */
  variant?: LeafHeadingVariant;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "div";
}

const VARIANT_BG: Record<LeafHeadingVariant, string> = {
  light: "#6fbe46",
  medium: "#469042",
  dark: "#18512d",
  black: "#221f20",
};

export default function LeafHeading({
  children,
  className,
  variant = "light",
  as = "h2",
  ...props
}: LeafHeadingProps) {
  const Tag = as;
  const background = VARIANT_BG[variant];

  return (
    <Tag
      className={cn(
        "inline-flex items-center justify-center rounded-tl-[28px] rounded-br-[28px] px-[30px] pt-3 pb-1.5",
        "font-candu tracking-[0.2em] text-xl md:text-3xl uppercase",
        "text-[#f1f1f1]",
        className
      )}
      style={{ backgroundColor: background }}
      {...props}
    >
      {children}
    </Tag>
  );
}

