import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import type { GalleryItem, Locale } from "../types";

type GalleryLabels = {
  sectionEyebrow: string;
  title: string;
  intro: string;
  close: string;
  previous: string;
  next: string;
  replaceHint: string;
};

type MemoryGalleryProps = {
  items: GalleryItem[];
  locale: Locale;
  labels: GalleryLabels;
};

const imageVariants = {
  enter: (direction: number) => ({
    opacity: 0,
    scale: 0.985,
    x: direction * 48,
  }),
  center: {
    opacity: 1,
    scale: 1,
    x: 0,
  },
  exit: (direction: number) => ({
    opacity: 0,
    scale: 0.985,
    x: direction * -48,
  }),
};

export function MemoryGallery({ items, locale, labels }: MemoryGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [direction, setDirection] = useState(1);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);

  const activeItem = activeIndex === null ? null : items[activeIndex];
  const isLightboxOpen = activeIndex !== null;
  const hasMultipleItems = items.length > 1;

  const dialogLabel = useMemo(() => {
    if (!activeItem) return labels.title;
    return `${labels.title}: ${activeItem.caption[locale]}`;
  }, [activeItem, labels.title, locale]);

  const closeLightbox = () => {
    setActiveIndex(null);
  };

  const showPrevious = () => {
    if (activeIndex === null || !hasMultipleItems) return;
    setDirection(-1);
    setActiveIndex((activeIndex - 1 + items.length) % items.length);
  };

  const showNext = () => {
    if (activeIndex === null || !hasMultipleItems) return;
    setDirection(1);
    setActiveIndex((activeIndex + 1) % items.length);
  };

  const openLightbox = (index: number, trigger: HTMLButtonElement) => {
    lastFocusedElementRef.current = trigger;
    setDirection(1);
    setActiveIndex(index);
  };

  const handleSwipeEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeDistance = 72;
    const swipeVelocity = 450;

    if (Math.abs(info.offset.x) < swipeDistance && Math.abs(info.velocity.x) < swipeVelocity) {
      return;
    }

    if (info.offset.x > 0 || info.velocity.x > 0) {
      showPrevious();
    } else {
      showNext();
    }
  };

  const trapFocus = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab") return;

    const focusableElements = dialogRef.current?.querySelectorAll<HTMLElement>(
      "button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])",
    );

    if (!focusableElements?.length) {
      event.preventDefault();
      return;
    }

    const first = focusableElements[0];
    const last = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  useEffect(() => {
    if (activeIndex !== null && activeIndex >= items.length) {
      setActiveIndex(null);
    }
  }, [activeIndex, items.length]);

  useEffect(() => {
    if (!isLightboxOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const frame = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = originalOverflow;
      lastFocusedElementRef.current?.focus();
    };
  }, [isLightboxOpen]);

  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeLightbox();
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        showPrevious();
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        showNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeIndex, isLightboxOpen, items.length]);

  return (
    <section
      id="memories"
      aria-labelledby="memories-title"
      className="relative overflow-hidden bg-cream px-5 py-20 transition-colors duration-500 sm:px-8 sm:py-28 dark:bg-slate-950"
    >
      <div className="pointer-events-none absolute -left-20 top-24 h-64 w-64 rounded-full bg-sunshine/20 blur-3xl dark:bg-sunshine/10" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-sky/35 blur-3xl dark:bg-sky/10" />

      <div className="relative mx-auto max-w-6xl">
        <header className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#b08b18] dark:text-sunshine">
            {labels.sectionEyebrow}
          </p>
          <h2 id="memories-title" className="mt-3 font-serif text-4xl font-semibold text-ink sm:text-5xl dark:text-white">
            {labels.title}
          </h2>
          <p className="mx-auto mt-5 max-w-xl leading-7 text-ink/65 dark:text-slate-300">
            {labels.intro}
          </p>
        </header>

        <ul className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3 lg:gap-9" aria-label={labels.title}>
          {items.map((item, index) => (
            <motion.li
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, delay: Math.min(index * 0.06, 0.24) }}
              className={item.featured ? "sm:col-span-2 lg:col-span-1" : undefined}
            >
              <button
                type="button"
                onClick={(event) => openLightbox(index, event.currentTarget)}
                className="group block w-full rounded-[1.25rem] text-left outline-none focus-visible:ring-4 focus-visible:ring-champagne/70 focus-visible:ring-offset-4 focus-visible:ring-offset-cream dark:focus-visible:ring-offset-slate-950"
                aria-label={`${labels.title}: ${item.caption[locale]}`}
              >
                <div style={{ transform: `rotate(${item.rotation})` }}>
                  <div className="relative overflow-hidden rounded-[1.1rem] bg-white p-3 pb-5 shadow-soft transition duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_30px_70px_rgba(74,55,27,0.18)] dark:bg-slate-800 dark:shadow-black/30">
                    <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-[#e9e0cd] dark:bg-slate-700">
                      <img
                        src={item.src}
                        alt={item.alt[locale]}
                        width={1080}
                        height={1620}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
                      />
                      <span className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
                      <span className="absolute bottom-4 right-4 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-ink opacity-0 shadow-lg backdrop-blur transition duration-300 group-hover:opacity-100 dark:bg-slate-900/90 dark:text-white">
                        <Maximize2 className="h-4 w-4" aria-hidden="true" />
                      </span>
                    </div>
                    <p className="mt-4 px-1 font-serif text-lg italic leading-snug text-ink dark:text-white sm:text-xl">
                      {item.caption[locale]}
                    </p>
                  </div>
                </div>
              </button>
            </motion.li>
          ))}
        </ul>

        {items.length === 0 && (
          <p className="mx-auto max-w-md rounded-2xl border border-champagne/30 bg-white/60 px-6 py-8 text-center text-sm leading-6 text-ink/60 shadow-soft dark:bg-slate-900/70 dark:text-slate-300">
            {labels.replaceHint}
          </p>
        )}
      </div>

      <AnimatePresence>
        {activeItem && activeIndex !== null && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              aria-label={labels.close}
              className="absolute inset-0 cursor-default bg-slate-950/75 backdrop-blur-md"
              onClick={closeLightbox}
            />

            <motion.div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-label={dialogLabel}
              aria-describedby="lightbox-caption"
              tabIndex={-1}
              onKeyDown={trapFocus}
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ type: "spring", stiffness: 260, damping: 25 }}
              className="relative flex h-full w-full max-w-6xl items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-3 shadow-2xl backdrop-blur-2xl sm:p-5"
            >
              <button
                ref={closeButtonRef}
                type="button"
                onClick={closeLightbox}
                className="absolute right-4 top-4 z-20 grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-slate-950/55 text-white shadow-lg backdrop-blur transition hover:bg-slate-950/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-sunshine focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                aria-label={labels.close}
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>

              {hasMultipleItems && (
                <button
                  type="button"
                  onClick={showPrevious}
                  className="absolute left-2 top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-slate-950/55 text-white shadow-lg backdrop-blur transition hover:bg-slate-950/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-sunshine sm:left-5 sm:h-12 sm:w-12"
                  aria-label={labels.previous}
                >
                  <ChevronLeft className="h-6 w-6" aria-hidden="true" />
                </button>
              )}

              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.figure
                  key={activeItem.id}
                  custom={direction}
                  variants={imageVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.24, ease: "easeOut" }}
                  drag={hasMultipleItems ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.18}
                  onDragEnd={handleSwipeEnd}
                  className="flex h-full w-full cursor-grab touch-pan-y select-none flex-col items-center justify-center active:cursor-grabbing"
                >
                  <img
                    src={activeItem.src}
                    alt={activeItem.alt[locale]}
                    width={1080}
                    height={1620}
                    draggable={false}
                    className="max-h-[72vh] max-w-full rounded-xl object-contain shadow-2xl sm:max-h-[78vh]"
                  />
                  <figcaption id="lightbox-caption" className="mt-4 max-w-xl text-center font-serif text-lg italic text-white sm:text-xl">
                    {activeItem.caption[locale]}
                  </figcaption>
                </motion.figure>
              </AnimatePresence>

              {hasMultipleItems && (
                <button
                  type="button"
                  onClick={showNext}
                  className="absolute right-2 top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-slate-950/55 text-white shadow-lg backdrop-blur transition hover:bg-slate-950/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-sunshine sm:right-5 sm:h-12 sm:w-12"
                  aria-label={labels.next}
                >
                  <ChevronRight className="h-6 w-6" aria-hidden="true" />
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default MemoryGallery;
