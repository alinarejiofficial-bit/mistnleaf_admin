import Image from "next/image";
import Link from "next/link";
import { media } from "@/lib/media";

/** Tight-cropped lockup aspect (913 × 548) */
const LOGO_ASPECT = 913 / 548;

const sizes = {
  header: {
    width: Math.round(68 * LOGO_ASPECT),
    height: 68,
    className: "h-12 w-auto sm:h-14 md:h-[3.75rem]",
  },
  footer: {
    width: Math.round(72 * LOGO_ASPECT),
    height: 72,
    className: "h-[3.75rem] w-auto sm:h-16",
  },
  hero: {
    width: Math.round(180 * LOGO_ASPECT),
    height: 180,
    className: "h-36 w-auto sm:h-44 md:h-52",
  },
  about: {
    width: Math.round(150 * LOGO_ASPECT),
    height: 150,
    className: "h-32 w-auto sm:h-36 md:h-40",
  },
} as const;

type LogoProps = {
  size?: keyof typeof sizes;
  /** dark = forest green on light; light = tan on dark */
  variant?: "dark" | "light";
  href?: string | null;
  className?: string;
  priority?: boolean;
  onClick?: () => void;
};

export function Logo({
  size = "header",
  variant = "dark",
  href = "/",
  className = "",
  priority = false,
  onClick,
}: LogoProps) {
  const { width, height, className: sizeClass } = sizes[size];
  const src = variant === "light" ? media.logoLight : media.logo;

  const image = (
    <Image
      src={`${src}?v=4`}
      alt="Mistnleaf — Nature in Every Breath"
      width={width}
      height={height}
      className={`object-contain object-left ${sizeClass} ${className}`.trim()}
      priority={priority}
      unoptimized
    />
  );

  if (href) {
    return (
      <Link
        href={href}
        className="site-logo inline-flex shrink-0 items-center"
        onClick={onClick}
      >
        {image}
      </Link>
    );
  }

  return <span className="site-logo inline-flex items-center">{image}</span>;
}
