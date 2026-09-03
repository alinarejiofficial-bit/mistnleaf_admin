"use client";

import Image from "next/image";

type MistnLeafLogoProps = {
  /** full = login / hero; compact = sidebar / chrome */
  variant?: "full" | "compact";
  className?: string;
  priority?: boolean;
};

/** Official MISTNLEAF brand mark (1024×512). */
export function MistnLeafLogo({
  variant = "compact",
  className = "",
  priority = false,
}: MistnLeafLogoProps) {
  const size =
    variant === "full"
      ? { width: 1024, height: 512, className: "h-28 w-auto sm:h-32" }
      : { width: 1024, height: 512, className: "h-11 w-auto max-w-[200px]" };

  return (
    <span
      className={`inline-flex items-center justify-center overflow-hidden rounded-lg ${className}`}
    >
      <Image
        src="/brand/mistnleaf-logo.png"
        alt="MISTNLEAF — Nature in every breath"
        width={size.width}
        height={size.height}
        priority={priority}
        unoptimized
        className={`${size.className} object-contain object-center`}
      />
    </span>
  );
}
