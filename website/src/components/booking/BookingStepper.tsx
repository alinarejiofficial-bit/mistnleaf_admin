import Link from "next/link";
import { bookingSteps, type BookingStepKey } from "@/lib/booking";

type Props = {
  current: BookingStepKey;
  query?: string;
};

export function BookingStepper({ current, query = "" }: Props) {
  const currentIndex = bookingSteps.findIndex((step) => step.key === current);
  const suffix = query ? `?${query}` : "";

  return (
    <nav aria-label="Booking progress" className="booking-stepper">
      <ol className="booking-stepper__list">
        {bookingSteps.map((step, index) => {
          const done = index < currentIndex;
          const active = index === currentIndex;
          const reachable = index <= currentIndex;
          const href =
            step.key === "confirmation"
              ? `${step.href}${suffix}`
              : reachable
                ? `${step.href}${suffix}`
                : undefined;

          const stepClass = active
            ? "booking-stepper__step--active"
            : done
              ? "booking-stepper__step--done"
              : "booking-stepper__step--upcoming";

          const badgeClass = active
            ? "booking-stepper__badge--active"
            : done
              ? "booking-stepper__badge--done"
              : "booking-stepper__badge--upcoming";

          const content = (
            <span className={`booking-stepper__step ${stepClass}`}>
              <span className={`booking-stepper__badge ${badgeClass}`}>
                {index + 1}
              </span>
              <span className="booking-stepper__label">
                <span className="booking-stepper__label--short">
                  {step.shortLabel}
                </span>
                <span className="booking-stepper__label--full">{step.label}</span>
              </span>
            </span>
          );

          return (
            <li key={step.key} className="booking-stepper__item">
              {href && index < currentIndex ? (
                <Link href={href} className="hover:opacity-80">
                  {content}
                </Link>
              ) : (
                content
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
