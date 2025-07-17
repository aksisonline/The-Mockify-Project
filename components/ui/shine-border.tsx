"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface ShineBorderProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Width of the border in pixels
   * @default 1
   */
  borderWidth?: number;
  /**
   * Duration of the animation in seconds
   * @default 14
   */
  duration?: number;
  /**
   * Color of the border, can be a single color or an array of colors
   * @default "#000000"
   */
  shineColor?: string | string[];
  /**
   * Different colors for each of the 4 animated lines
   */
  shineColors?: {
    line1?: string | string[];
    line2?: string | string[];
    line3?: string | string[];
    line4?: string | string[];
  };
}

/**
 * Shine Border
 *
 * An animated background border effect component with configurable properties.
 * Now includes 4 animated lines: 2 clockwise and 2 counter-clockwise from opposite corners.
 * Each line can have different colors for aesthetic appeal.
 */
export function ShineBorder({
  borderWidth = 1,
  duration = 14,
  shineColor = "#ffffff",
  shineColors,
  className,
  style,
  ...props
}: ShineBorderProps) {
  // Helper function to get color string
  const getColorString = (color: string | string[]) => 
    Array.isArray(color) ? color.join(",") : color;
  
  // Use individual colors if provided, otherwise fallback to default
  const line1Color = shineColors?.line1 || shineColor;
  const line2Color = shineColors?.line2 || shineColor;
  const line3Color = shineColors?.line3 || shineColor;
  const line4Color = shineColors?.line4 || shineColor;
  
  return (
    <>
      {/* First line: Top-left to bottom-right (clockwise) - Blue */}
      <div
        style={
          {
            "--border-width": `${borderWidth}px`,
            "--duration": `${duration}s`,
            backgroundImage: `radial-gradient(transparent,transparent, ${getColorString(line1Color)},transparent,transparent)`,
            backgroundSize: "300% 300%",
            mask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
            WebkitMask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
            padding: "var(--border-width)",
            ...style,
          } as React.CSSProperties
        }
        className={cn(
          "pointer-events-none absolute inset-0 size-full rounded-[inherit] will-change-[background-position] motion-safe:animate-shine",
          className,
        )}
        {...props}
      />
      
      {/* Second line: Top-right to bottom-left (counter-clockwise) - Pink */}
      <div
        style={
          {
            "--border-width": `${borderWidth}px`,
            "--duration": `${duration}s`,
            backgroundImage: `radial-gradient(transparent,transparent, ${getColorString(line2Color)},transparent,transparent)`,
            backgroundSize: "300% 300%",
            mask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
            WebkitMask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
            padding: "var(--border-width)",
            ...style,
          } as React.CSSProperties
        }
        className={cn(
          "pointer-events-none absolute inset-0 size-full rounded-[inherit] will-change-[background-position] motion-safe:animate-shine-reverse",
          className,
        )}
        {...props}
      />
      
      {/* Third line: Bottom-left to top-right (clockwise, delayed) - Purple-Blue */}
      <div
        style={
          {
            "--border-width": `${borderWidth}px`,
            "--duration": `${duration}s`,
            backgroundImage: `radial-gradient(transparent,transparent, ${getColorString(line3Color)},transparent,transparent)`,
            backgroundSize: "300% 300%",
            mask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
            WebkitMask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
            padding: "var(--border-width)",
            ...style,
          } as React.CSSProperties
        }
        className={cn(
          "pointer-events-none absolute inset-0 size-full rounded-[inherit] will-change-[background-position] motion-safe:animate-shine-delayed",
          className,
        )}
        {...props}
      />
      
      {/* Fourth line: Bottom-right to top-left (counter-clockwise, delayed) - Pink-Orange */}
      <div
        style={
          {
            "--border-width": `${borderWidth}px`,
            "--duration": `${duration}s`,
            backgroundImage: `radial-gradient(transparent,transparent, ${getColorString(line4Color)},transparent,transparent)`,
            backgroundSize: "300% 300%",
            mask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
            WebkitMask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
            padding: "var(--border-width)",
            ...style,
          } as React.CSSProperties
        }
        className={cn(
          "pointer-events-none absolute inset-0 size-full rounded-[inherit] will-change-[background-position] motion-safe:animate-shine-reverse-delayed",
          className,
        )}
        {...props}
      />
    </>
  );
}
