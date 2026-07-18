"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/app/lib/utils";

/**
 * Maps EMN color token names to hex values.
 * Accepts either a token name (e.g. "emn-green") or a raw hex (e.g. "#6ebf46").
 */
const EMN_COLORS: Record<string, string> = {
  "emn-black": "#221f20",
  "emn-offwhite": "#f1f1f1",
  "emn-green": "#6cbe45",
  "emn-green-mid": "#469042",
  "emn-green-dark": "#18512d",
  white: "#ffffff",
  black: "#000000",
};

function resolveColor(value: string): string {
  return EMN_COLORS[value] ?? value;
}

interface ButtonProps {
  /** Navigation URL — renders a Next.js <Link> instead of <button> */
  href?: string;
  /** Background color of the button face. Accepts emn token names or hex values. */
  color?: string;
  /** Border + shadow color. Accepts emn token names or hex values. */
  outlineColor?: string;
  /** Text color (defaults to outlineColor). Accepts emn token names or hex values. */
  textColor?: string;
  /** Additional classes for the outer wrapper (controls sizing, font, etc.) */
  className?: string;
  /** Additional classes for the inner button face */
  innerClassName?: string;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  target?: string;
  rel?: string;
  disabled?: boolean;
}

export default function Button({
  href,
  color = "emn-offwhite",
  outlineColor = "emn-black",
  textColor,
  className,
  innerClassName,
  children,
  onClick,
  target,
  rel,
  disabled,
}: ButtonProps) {
  const resolvedColor = resolveColor(color);
  const resolvedOutline = resolveColor(outlineColor);
  const resolvedText = resolveColor(textColor ?? outlineColor);

  // Shared styling for the outer wrapper — provides the 3D "shadow" via its background
  const outerClasses = cn(
    "group inline-flex cursor-pointer border-none font-bold",
    "rounded-[0.75em] disabled:opacity-50 disabled:pointer-events-none",
    className
  );

  // The inner face of the button — translates on hover/active for the 3D effect
  const innerClasses = cn(
    "block box-border rounded-[inherit] border-2 px-6 py-3",
    "transition-transform duration-100 ease-in-out",
    // Default: lifted up. Hover: lifted more. Active/click: pushed flat.
    "-translate-y-[0.2em] group-hover:-translate-y-[0.33em] group-active:translate-y-0",
    innerClassName
  );

  const innerStyle: React.CSSProperties = {
    borderColor: resolvedOutline,
    backgroundColor: resolvedColor,
    color: resolvedText,
  };

  const face = (
    <span className={innerClasses} style={innerStyle}>
      {children}
    </span>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={outerClasses}
        style={{ background: resolvedOutline }}
        onClick={onClick}
        target={target}
        rel={rel}
      >
        {face}
      </Link>
    );
  }

  return (
    <button
      className={outerClasses}
      style={{ background: resolvedOutline }}
      onClick={onClick}
      disabled={disabled}
    >
      {face}
    </button>
  );
}
