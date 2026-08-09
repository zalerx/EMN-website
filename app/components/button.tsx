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
  /** Text color on hover. Accepts emn token names or hex values. */
  hoverTextColor?: string;
  /** When true, the face color and outline color swap on hover. */
  swapOnHover?: boolean;
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
  hoverTextColor,
  swapOnHover,
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
  const resolvedHoverText = hoverTextColor
    ? resolveColor(hoverTextColor)
    : undefined;

  // Base color tokens live in inline CSS vars; the active --btn-face / --btn-outline
  // are derived via classes so a :hover rule can swap them (inline styles can't).
  const outerClasses = cn(
    "group inline-flex cursor-pointer border-none font-bold",
    "rounded-[0.75em] disabled:opacity-50 disabled:pointer-events-none",
    "[--btn-face:var(--btn-c-face)] [--btn-outline:var(--btn-c-outline)] [--btn-text:var(--btn-c-text)]",
    "[background:var(--btn-outline)] transition-colors duration-100 ease-in-out",
    swapOnHover &&
      "hover:[--btn-face:var(--btn-c-outline)] hover:[--btn-outline:var(--btn-c-face)]",
    resolvedHoverText && "hover:[--btn-text:var(--btn-c-hover-text)]",
    className
  );

  // The inner face of the button — translates on hover/active for the 3D effect
  const innerClasses = cn(
    "block box-border rounded-[inherit] border-2 px-6 py-3",
    "transition-[transform,background-color,border-color,color] duration-100 ease-in-out",
    // Default: lifted up. Hover: lifted more. Active/click: pushed flat.
    "-translate-y-[0.2em] group-hover:-translate-y-[0.33em] group-active:translate-y-0",
    innerClassName
  );

  const outerStyle = {
    "--btn-c-face": resolvedColor,
    "--btn-c-outline": resolvedOutline,
    "--btn-c-text": resolvedText,
    ...(resolvedHoverText ? { "--btn-c-hover-text": resolvedHoverText } : {}),
  } as React.CSSProperties;

  const innerStyle: React.CSSProperties = {
    borderColor: "var(--btn-outline)",
    backgroundColor: "var(--btn-face)",
    color: "var(--btn-text)",
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
        style={outerStyle}
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
      style={outerStyle}
      onClick={onClick}
      disabled={disabled}
    >
      {face}
    </button>
  );
}
