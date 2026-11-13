import { useState } from "react";
import confetti from "canvas-confetti";
import type { Locale } from "../types";

export interface BirthdayCakeProps {
  locale: Locale;
  onWishEffect?: () => void;
  labels: {
    eyebrow: string;
    title: string;
    body: string;
    makeWish: string;
    replay: string;
    wishResult: string;
    wishResultZh: string;
  };
}

const colors = ["#F6CE4B", "#A9DDF1", "#FFF5E4", "#D7AC64", "#F4A7A1"];

function reducedMotionIsPreferred() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function launchConfetti() {
  if (reducedMotionIsPreferred()) return;

  const burst = (origin: { x: number; y: number }, angle: number) => {
    confetti({
      particleCount: 72,
      angle,
      spread: 64,
      startVelocity: 27,
      gravity: 1.05,
      ticks: 220,
      scalar: 1.05,
      colors,
      origin,
    });
  };

  burst({ x: 0.28, y: 0.66 }, 58);
  window.setTimeout(() => burst({ x: 0.72, y: 0.66 }, 122), 120);
}

export default function BirthdayCake({ locale, labels, onWishEffect }: BirthdayCakeProps) {
  const [hasWished, setHasWished] = useState(false);
  const [celebrationCount, setCelebrationCount] = useState(0);
  const result = locale === "zh" ? labels.wishResultZh : labels.wishResult;

  const handleWish = () => {
    setHasWished(true);
    setCelebrationCount((count) => count + 1);
    onWishEffect?.();
    launchConfetti();
  };

  return (
    <section
      className="relative overflow-hidden bg-[#fff8ea] px-5 py-20 transition-colors duration-500 dark:bg-[#1b2027] sm:px-8 sm:py-28"
      lang={locale === "zh" ? "zh-Hans" : "vi"}
      aria-labelledby="cake-title"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div className="order-2 max-w-xl text-center lg:order-1 lg:text-left">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.26em] text-[#b88a2d] dark:text-[#F6CE4B]">
            {labels.eyebrow}
          </p>
          <h2
            id="cake-title"
            className="font-editorial text-4xl font-semibold leading-tight text-ink dark:text-[#FFF5E4] sm:text-5xl"
          >
            {labels.title}
          </h2>
          <p className="mt-5 text-base leading-8 text-ink/70 dark:text-[#FFF5E4]/70 sm:text-lg">{labels.body}</p>

          <div className="mt-8 flex flex-col items-center gap-4 lg:items-start">
            <button
              type="button"
              className="group inline-flex min-h-12 items-center justify-center rounded-full bg-ink px-7 py-3 text-sm font-bold text-white shadow-[0_12px_25px_rgba(41,40,44,0.2)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#46444a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b88a2d] active:translate-y-0 dark:bg-[#F6CE4B] dark:text-[#29282C] dark:hover:bg-[#ffe27d]"
              onClick={handleWish}
              aria-describedby="cake-wish-result"
            >
              <span className="mr-2 text-base transition-transform duration-300 group-hover:-rotate-12">✦</span>
              {hasWished ? labels.replay : labels.makeWish}
            </button>
            <p
              id="cake-wish-result"
              className={`min-h-6 text-sm font-medium text-[#9b6f1c] transition-opacity duration-500 dark:text-[#F6CE4B] ${
                hasWished ? "opacity-100" : "opacity-0"
              }`}
              role="status"
              aria-live="polite"
            >
              {hasWished ? result : " "}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleWish}
          className="order-1 flex justify-center rounded-3xl focus:outline-none focus-visible:ring-4 focus-visible:ring-[#F6CE4B] focus-visible:ring-offset-4 focus-visible:ring-offset-[#fff8ea] dark:focus-visible:ring-offset-[#1b2027] lg:order-2"
          aria-label={hasWished ? labels.replay : labels.makeWish}
        >
          <div
            className={`birthday-cake-stage ${hasWished ? "is-wished" : ""} ${
              celebrationCount > 0 ? "is-celebrating" : ""
            }`}
          >
            <div className="birthday-cake-sparkle birthday-cake-sparkle-one">✦</div>
            <div className="birthday-cake-sparkle birthday-cake-sparkle-two">✦</div>
            <div className="birthday-cake-sparkle birthday-cake-sparkle-three">•</div>

            <div className="birthday-cake" key={celebrationCount}>
              <div className="birthday-cake-plate" />
              <div className="birthday-cake-tier birthday-cake-tier-bottom">
                <span className="birthday-cake-icing birthday-cake-icing-bottom" />
                <span className="birthday-cake-dot birthday-cake-dot-one" />
                <span className="birthday-cake-dot birthday-cake-dot-two" />
                <span className="birthday-cake-dot birthday-cake-dot-three" />
              </div>
              <div className="birthday-cake-tier birthday-cake-tier-top">
                <span className="birthday-cake-icing birthday-cake-icing-top" />
                <span className="birthday-cake-cherry" />
              </div>

              <div className="birthday-candles">
                {[0, 1, 2, 3, 4].map((candle) => (
                  <div className="birthday-candle" key={candle}>
                    <span className="birthday-flame" />
                    <span className="birthday-candle-stripe" />
                  </div>
                ))}
              </div>

              {hasWished && (
                <div className="birthday-smoke" key={celebrationCount}>
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
              )}
            </div>
          </div>
        </button>
      </div>

      <style>{`
        .birthday-cake-stage {
          position: relative;
          display: grid;
          min-height: 318px;
          width: min(100%, 360px);
          place-items: end center;
          isolation: isolate;
        }
        .birthday-cake {
          position: relative;
          z-index: 1;
          width: 285px;
          height: 238px;
          transform-origin: center bottom;
        }
        .birthday-cake-plate {
          position: absolute;
          right: 50%;
          bottom: 0;
          width: 292px;
          height: 26px;
          transform: translateX(50%);
          border: 7px solid #f8edd7;
          border-radius: 50%;
          background: #a9ddf1;
          box-shadow: 0 12px 0 rgba(169, 221, 241, 0.33), 0 17px 24px rgba(62, 48, 25, 0.16);
        }
        .birthday-cake-tier {
          position: absolute;
          left: 50%;
          overflow: hidden;
          transform: translateX(-50%);
          border: 4px solid rgba(255, 255, 255, 0.68);
          background: linear-gradient(90deg, #f9d661, #f6ce4b 48%, #e9bb2d);
          box-shadow: inset 18px 0 20px rgba(255, 255, 255, 0.22), inset -14px 0 18px rgba(166, 103, 20, 0.12);
        }
        .birthday-cake-tier-bottom {
          bottom: 20px;
          width: 258px;
          height: 111px;
          border-radius: 31px 31px 17px 17px;
        }
        .birthday-cake-tier-top {
          bottom: 118px;
          width: 184px;
          height: 75px;
          border-radius: 27px 27px 12px 12px;
        }
        .birthday-cake-icing {
          position: absolute;
          right: -8px;
          left: -8px;
          top: -4px;
          display: block;
          height: 31px;
          border-radius: 45% 45% 56% 56% / 60% 60% 40% 40%;
          background: #fff5e4;
          box-shadow: 0 8px 0 #fff5e4;
        }
        .birthday-cake-icing-bottom::after,
        .birthday-cake-icing-top::after {
          position: absolute;
          top: 14px;
          width: 23px;
          height: 29px;
          border-radius: 0 0 18px 18px;
          background: #fff5e4;
          content: "";
        }
        .birthday-cake-icing-bottom::after { left: 42px; box-shadow: 63px 5px 0 #fff5e4, 130px -2px 0 #fff5e4; }
        .birthday-cake-icing-top::after { left: 30px; box-shadow: 77px 3px 0 #fff5e4; }
        .birthday-cake-dot,
        .birthday-cake-cherry {
          position: absolute;
          z-index: 2;
          display: block;
          border-radius: 50%;
          background: #f4a7a1;
          box-shadow: inset -2px -3px 0 rgba(156, 71, 70, 0.18);
        }
        .birthday-cake-dot { top: 54px; width: 13px; height: 13px; }
        .birthday-cake-dot-one { left: 38px; }
        .birthday-cake-dot-two { left: 118px; }
        .birthday-cake-dot-three { right: 39px; }
        .birthday-cake-cherry {
          top: 39px;
          left: 50%;
          width: 18px;
          height: 18px;
          transform: translateX(-50%);
        }
        .birthday-cake-cherry::before {
          position: absolute;
          top: -14px;
          left: 9px;
          width: 17px;
          height: 17px;
          border-top: 3px solid #7a9d52;
          border-radius: 55% 0 0;
          content: "";
        }
        .birthday-candles {
          position: absolute;
          z-index: 3;
          bottom: 182px;
          left: 50%;
          display: flex;
          align-items: end;
          gap: 11px;
          transform: translateX(-50%);
        }
        .birthday-candle {
          position: relative;
          width: 13px;
          height: 52px;
          overflow: visible;
          border-radius: 5px 5px 2px 2px;
          background: repeating-linear-gradient(135deg, #a9ddf1 0 5px, #ffffff 5px 9px);
          box-shadow: inset -3px 0 0 rgba(70, 130, 147, 0.14), 0 2px 3px rgba(55, 42, 27, 0.12);
        }
        .birthday-candle:nth-child(2), .birthday-candle:nth-child(4) { height: 42px; }
        .birthday-candle:nth-child(3) { height: 59px; }
        .birthday-candle::before {
          position: absolute;
          top: -6px;
          left: 50%;
          width: 2px;
          height: 8px;
          transform: translateX(-50%);
          background: #6c5935;
          content: "";
        }
        .birthday-flame {
          position: absolute;
          bottom: calc(100% + 5px);
          left: 50%;
          width: 16px;
          height: 25px;
          transform: translateX(-50%) rotate(45deg);
          transform-origin: center bottom;
          border-radius: 70% 0 70% 70%;
          background: linear-gradient(135deg, #fff7ae 10%, #f6a720 55%, #e56b27);
          box-shadow: 0 0 14px rgba(246, 173, 41, 0.82);
          animation: birthday-flame 1.15s ease-in-out infinite alternate;
          transition: opacity 280ms ease, transform 280ms ease;
        }
        .birthday-flame::after {
          position: absolute;
          right: 4px;
          bottom: 4px;
          width: 7px;
          height: 12px;
          border-radius: 70% 0 70% 70%;
          background: #fff5e4;
          content: "";
        }
        .birthday-candle:nth-child(2) .birthday-flame { animation-delay: -0.38s; }
        .birthday-candle:nth-child(3) .birthday-flame { animation-delay: -0.77s; }
        .birthday-candle:nth-child(4) .birthday-flame { animation-delay: -0.2s; }
        .birthday-candle:nth-child(5) .birthday-flame { animation-delay: -0.55s; }
        .birthday-cake-stage.is-wished .birthday-flame {
          opacity: 0;
          transform: translateX(-50%) translateY(-13px) scale(0.45) rotate(45deg);
        }
        .birthday-smoke {
          position: absolute;
          z-index: 4;
          bottom: 229px;
          left: 50%;
          width: 172px;
          height: 90px;
          transform: translateX(-50%);
          pointer-events: none;
        }
        .birthday-smoke span {
          position: absolute;
          bottom: 0;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: rgba(116, 105, 91, 0.35);
          filter: blur(2px);
          animation: birthday-smoke 1.7s ease-out forwards;
        }
        .birthday-smoke span:nth-child(1) { left: 15px; animation-delay: 0s; }
        .birthday-smoke span:nth-child(2) { left: 46px; animation-delay: 0.18s; }
        .birthday-smoke span:nth-child(3) { left: 76px; animation-delay: 0.08s; }
        .birthday-smoke span:nth-child(4) { left: 107px; animation-delay: 0.24s; }
        .birthday-smoke span:nth-child(5) { left: 139px; animation-delay: 0.12s; }
        .birthday-cake-sparkle {
          position: absolute;
          z-index: 2;
          color: #d7ac64;
          font-size: 26px;
          line-height: 1;
          animation: birthday-twinkle 2.1s ease-in-out infinite;
        }
        .birthday-cake-sparkle-one { top: 44px; left: 3px; }
        .birthday-cake-sparkle-two { top: 92px; right: 12px; font-size: 19px; animation-delay: -0.9s; }
        .birthday-cake-sparkle-three { top: 22px; right: 83px; font-size: 40px; color: #f4a7a1; animation-delay: -1.45s; }
        .birthday-cake-stage.is-celebrating .birthday-cake { animation: birthday-cake-bounce 620ms cubic-bezier(.2,.9,.25,1.35); }
        @keyframes birthday-flame { from { margin-bottom: 0; scale: 0.92 1; } to { margin-bottom: 3px; scale: 1.08 0.92; } }
        @keyframes birthday-smoke { 0% { opacity: 0; transform: translate(0, 0) scale(0.4); } 18% { opacity: 0.52; } 100% { opacity: 0; transform: translate(13px, -72px) scale(2.05); } }
        @keyframes birthday-twinkle { 0%, 100% { opacity: 0.3; transform: scale(0.75) rotate(0); } 50% { opacity: 1; transform: scale(1.14) rotate(18deg); } }
        @keyframes birthday-cake-bounce { 0%, 100% { transform: translateY(0) rotate(0); } 36% { transform: translateY(-14px) rotate(-1.5deg); } 68% { transform: translateY(0) rotate(1deg); } }
        @media (max-width: 420px) {
          .birthday-cake-stage { width: 310px; min-height: 292px; transform: scale(0.88); transform-origin: center bottom; margin-bottom: -22px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .birthday-flame, .birthday-smoke span, .birthday-cake-sparkle, .birthday-cake-stage.is-celebrating .birthday-cake { animation: none; }
          .birthday-cake-stage.is-wished .birthday-flame { transition: none; }
        }
      `}</style>
    </section>
  );
}
