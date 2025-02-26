"use client";

import React from 'react'
import { cn } from '@/app/lib/utils'

interface ButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  href?: string;
}

export default function Button({
  className,
  href,
  children,
  ...props
}: ButtonProps) {

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (href) {
      window.location.href = href;
    }
    if (props.onClick) {
      props.onClick(event);
    }
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-bold border-black border-2 px-5 py-2 rounded-full text-xs md:text-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
        className ?? ""
      )}
      onClick={handleClick}
      {...props}
    >
    {children}
    </button>
  )
}
