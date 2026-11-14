import { FormEvent, useEffect, useMemo, useState } from "react";
import type { Locale, Wish } from "../types";

export interface WishWallProps {
  locale: Locale;
  maxLength: number;
  labels: {
    eyebrow: string;
    title: string;
    body: string;
    placeholder: string;
    submit: string;
    empty: string;
    note: string;
  };
}

const STORAGE_KEY = "zheng-guolin-birthday-wishes";
function trimToUnicodeLength(value: string, maxLength: number) {
  return Array.from(value).slice(0, maxLength).join("");
}

function isWish(value: unknown): value is Wish {
  if (!value || typeof value !== "object") return false;
  const wish = value as Wish;
  return (
    typeof wish.id === "string" &&
    typeof wish.message === "string" &&
    typeof wish.createdAt === "number" &&
    Number.isFinite(wish.createdAt) &&
    !Number.isNaN(new Date(wish.createdAt).getTime())
  );
}

function createWishId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `wish-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function dateLocale(locale: Locale) {
  return locale === "zh" ? "zh-CN" : "vi-VN";
}

export default function WishWall({ locale, maxLength, labels }: WishWallProps) {
  const [draft, setDraft] = useState("");
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loaded, setLoaded] = useState(false);
  const characterCount = Array.from(draft).length;
  const formatter = useMemo(
    () =>
      new Intl.DateTimeFormat(dateLocale(locale), {
        month: "short",
        day: "numeric",
      }),
    [locale],
  );

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setWishes(parsed.filter(isWish).slice(0, 48));
        }
      }
    } catch {
      // Visitors can still post wishes when storage is blocked or malformed.
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(wishes));
    } catch {
      // Keep the in-memory wish wall functional when storage has no capacity.
    }
  }, [loaded, wishes]);

  const submitWish = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = draft.trim();
    if (!message) return;

    const wish: Wish = {
      id: createWishId(),
      message,
      createdAt: Date.now(),
    };

    setWishes((current) => [wish, ...current].slice(0, 48));
    setDraft("");
  };

  return (
    <section
      className="relative overflow-hidden bg-[#f3fbff] px-5 py-20 transition-colors duration-500 dark:bg-[#17242d] sm:px-8 sm:py-28"
      lang={locale === "zh" ? "zh-Hans" : "vi"}
      aria-labelledby="wish-wall-title"
    >
      <div className="absolute -left-20 top-16 h-48 w-48 rounded-full bg-[#a9ddf1]/30 blur-3xl" aria-hidden="true" />
      <div className="absolute -right-16 bottom-0 h-56 w-56 rounded-full bg-[#f6ce4b]/20 blur-3xl" aria-hidden="true" />

      <div className="relative mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.26em] text-[#5d9bb5] dark:text-[#A9DDF1]">
            {labels.eyebrow}
          </p>
          <h2 id="wish-wall-title" className={`text-4xl font-semibold text-ink dark:text-[#FFF5E4] sm:text-5xl ${locale === "zh" ? "font-chinese" : "font-vietnamese"}`}>
            {labels.title}
          </h2>
          <p className="mt-5 text-base leading-8 text-ink/70 dark:text-[#FFF5E4]/70 sm:text-lg">{labels.body}</p>
        </div>

        <div className="mx-auto mt-11 grid max-w-5xl gap-10 lg:grid-cols-[0.83fr_1.17fr] lg:items-start">
          <form
            className="rounded-[1.75rem] border border-white/80 bg-white/85 p-6 shadow-soft backdrop-blur dark:border-[#A9DDF1]/15 dark:bg-[#202f3a]/85 sm:p-8"
            onSubmit={submitWish}
          >
            <label className="sr-only" htmlFor="birthday-wish">
              {labels.placeholder}
            </label>
            <textarea
              id="birthday-wish"
              value={draft}
              onChange={(event) => setDraft(trimToUnicodeLength(event.target.value, maxLength))}
              placeholder={labels.placeholder}
              rows={5}
              className="w-full resize-none rounded-2xl border border-[#a9ddf1]/70 bg-[#f9fdff] px-4 py-4 text-base leading-7 text-ink outline-none transition placeholder:text-ink/40 focus:border-[#5d9bb5] focus:ring-4 focus:ring-[#a9ddf1]/30 dark:bg-[#17242d] dark:text-[#FFF5E4] dark:placeholder:text-[#FFF5E4]/35"
              aria-describedby="wish-note wish-character-count"
            />
            <div className="mt-3 flex items-start justify-between gap-5 text-xs leading-5 text-ink/55 dark:text-[#FFF5E4]/55">
              <p id="wish-note">{labels.note}</p>
              <p id="wish-character-count" className="shrink-0 tabular-nums" aria-live="polite">
                {characterCount}/{maxLength}
              </p>
            </div>
            <button
              type="submit"
              disabled={!draft.trim()}
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#4d91ad] px-6 py-3 text-sm font-bold text-white shadow-[0_12px_24px_rgba(77,145,173,0.24)] transition hover:-translate-y-0.5 hover:bg-[#397c97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#397c97] disabled:cursor-not-allowed disabled:translate-y-0 disabled:bg-[#9fc6d5] disabled:shadow-none"
            >
              <span className="mr-2" aria-hidden="true">♡</span>
              {labels.submit}
            </button>
          </form>

          <div className="min-w-0" aria-live="polite" aria-relevant="additions">
            {wishes.length === 0 ? (
              <div className="flex min-h-64 items-center justify-center rounded-[1.75rem] border border-dashed border-[#8ac6dd] bg-white/55 px-8 text-center text-sm leading-7 text-ink/55 dark:bg-[#202f3a]/55 dark:text-[#FFF5E4]/60">
                {labels.empty}
              </div>
            ) : (
              <div className="wish-wall-grid" aria-label={labels.title}>
                {wishes.map((wish, index) => (
                  <article
                    className="wish-wall-card"
                    key={wish.id}
                    style={
                      {
                        "--wish-rotation": `${[-1.3, 1.1, -0.55, 0.75, -0.85, 1.35][index % 6]}deg`,
                        "--wish-delay": `${(index % 5) * -0.62}s`,
                      } as React.CSSProperties
                    }
                  >
                    <span className="wish-wall-pin" aria-hidden="true" />
                    <p className="whitespace-pre-wrap break-words text-[15px] leading-7 text-ink/80">
                      {wish.message}
                    </p>
                    <time className="mt-5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#6b9eae]" dateTime={new Date(wish.createdAt).toISOString()}>
                      {formatter.format(new Date(wish.createdAt))}
                    </time>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .wish-wall-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }
        .wish-wall-card {
          position: relative;
          min-height: 150px;
          padding: 27px 23px 20px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.92);
          border-radius: 10px 16px 12px 17px;
          background: linear-gradient(145deg, #fffef8, #fff5d9);
          box-shadow: 0 14px 24px rgba(81, 112, 121, 0.13);
          transform: rotate(var(--wish-rotation));
          transition: transform 250ms ease, box-shadow 250ms ease;
          animation: wish-wall-float 6.8s ease-in-out var(--wish-delay) infinite;
        }
        .wish-wall-card:nth-child(3n + 2) { background: linear-gradient(145deg, #ffffff, #eaf8fd); }
        .wish-wall-card:nth-child(3n) { background: linear-gradient(145deg, #fffdfa, #fde9e6); }
        .wish-wall-card::after {
          position: absolute;
          right: -22px;
          bottom: -34px;
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.42);
          content: "";
        }
        .wish-wall-card:hover {
          z-index: 1;
          box-shadow: 0 20px 32px rgba(81, 112, 121, 0.19);
          transform: translateY(-5px) rotate(0deg);
        }
        .wish-wall-pin {
          position: absolute;
          top: 11px;
          left: 50%;
          width: 9px;
          height: 9px;
          transform: translateX(-50%);
          border: 2px solid #fff9ed;
          border-radius: 50%;
          background: #f4a7a1;
          box-shadow: 0 2px 3px rgba(97, 54, 43, 0.23);
        }
        @keyframes wish-wall-float {
          0%, 100% { margin-top: 0; }
          50% { margin-top: -7px; }
        }
        @media (max-width: 460px) {
          .wish-wall-grid { grid-template-columns: minmax(0, 1fr); }
        }
        @media (prefers-reduced-motion: reduce) {
          .wish-wall-card { animation: none; transition: none; }
        }
      `}</style>
    </section>
  );
}
