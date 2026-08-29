import Link from "next/link";

type ButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
};

const variants = {
  primary:
    "bg-pine text-fog shadow-[0_10px_30px_-18px_rgba(26,54,44,0.85)] hover:bg-pine-soft hover:shadow-[0_14px_34px_-16px_rgba(26,54,44,0.9)] focus-visible:outline-pine",
  secondary:
    "bg-transparent text-fog border border-fog/55 hover:bg-fog/12 hover:border-fog focus-visible:outline-fog",
  ghost:
    "bg-transparent text-pine border border-pine/20 hover:border-pine/45 hover:bg-sand-cool/70 focus-visible:outline-pine",
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className = "",
}: ButtonProps) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-11 items-center justify-center px-7 py-3 text-[0.8rem] font-medium tracking-[0.08em] uppercase transition duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${variants[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}
