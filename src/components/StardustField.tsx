import type { CSSProperties } from "react";

/**
 * Lightweight, deterministic glitter field.
 * No canvas, no runtime timers, and no pointer interception on mobile.
 */
type StardustFieldProps = {
  variant?: "intro" | "hero" | "finale";
};

const stars = Array.from({ length: 74 }, (_, index) => {
  const seed = index + 1;
  return {
    x: ((seed * 73.37 + seed * seed * 0.91) % 94) + 3,
    y: ((seed * 41.19 + seed * seed * 1.37) % 92) + 4,
    size: seed % 11 === 0 ? 4 : seed % 4 === 0 ? 2.5 : 1.5,
    delay: -((seed * 0.67) % 8),
    duration: 2.8 + ((seed * 0.43) % 5),
    opacity: 0.35 + ((seed * 0.13) % 0.55),
  };
});

export function StardustField({ variant = "intro" }: StardustFieldProps) {
  return (
    <div className={`sd-field sd-field--${variant}`} aria-hidden="true">
      <div className="sd-field__nebula sd-field__nebula--gold" />
      <div className="sd-field__nebula sd-field__nebula--blue" />
      <div className="sd-field__aurora" />
      {stars.map((star, index) => (
        <span
          key={index}
          className={`sd-star ${index % 9 === 0 ? "sd-star--blue" : ""}`}
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            opacity: star.opacity,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
          } satisfies CSSProperties}
        />
      ))}
      <span className="sd-cross sd-cross--one">✦</span>
      <span className="sd-cross sd-cross--two">✧</span>
      <span className="sd-cross sd-cross--three">✦</span>
      <span className="sd-cross sd-cross--four">✧</span>
      <span className="sd-shooting sd-shooting--one" />
      <span className="sd-shooting sd-shooting--two" />
    </div>
  );
}
