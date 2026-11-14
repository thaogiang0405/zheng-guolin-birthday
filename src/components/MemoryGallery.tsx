import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight, Film, Maximize2, Sparkles, X } from "lucide-react";
import type { GalleryItem, Locale } from "../types";
import { featuredFilms } from "../data/filmCollection";
import { birthdayConfig } from "../data/birthdayConfig";

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


        {/* Five verified roles: temporary source images where available, styled placeholders elsewhere. */}
        <div className="mb-12 flex flex-col gap-3 border-b border-[#bd9763]/25 pb-7 dark:border-[#e7c990]/20 sm:mb-14 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-editorial text-2xl font-semibold text-[#463323] dark:text-[#ffe6bd] sm:text-3xl">
              {locale === "zh" ? "光影中的他" : "Trịnh lão sư trên màn ảnh"}
            </p>
            <p className="mt-2 text-sm leading-7 text-[#6e5e51] dark:text-slate-300">
              {locale === "zh" ? "五部作品，五段珍贵的光影记忆。" : "Năm bộ phim, năm dấu ấn đáng nhớ qua từng vai diễn."}
            </p>
          </div>
          <span className="shrink-0 font-editorial text-sm italic text-[#92704b] dark:text-[#e9d0a6]">ON SCREEN · 2003 — 2023</span>
        </div>

        <div className="grid grid-cols-1 gap-7 md:grid-cols-2 xl:gap-9">
          {featuredFilms.map((film, index) => (
            <motion.article
              key={film.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.5, delay: Math.min(index * 0.06, 0.2) }}
              className={"group relative overflow-hidden rounded-[1.6rem] border border-[#ddc096]/50 bg-[#fffaf1]/95 p-4 shadow-[0_24px_60px_rgba(88,55,30,.10)] dark:border-[#d7ac64]/20 dark:bg-[#273148]/90 sm:p-5 " + (index === 4 ? "md:col-span-2" : "")}
            >
              <div className="pointer-events-none absolute -right-9 -top-11 text-[9rem] leading-none text-[#d9bd8a]/10 dark:text-[#f4d38c]/10" aria-hidden="true">✦</div>
              <div className="relative z-10 mb-4 flex items-center justify-between gap-4">
                <span className="font-editorial text-3xl italic text-[#bb9160] dark:text-[#e8bd7f]">{film.highlight}</span>
                <span className="rounded-full border border-[#cba86f]/35 bg-[#f2e3c8]/70 px-3 py-1 text-xs font-bold tracking-[.12em] text-[#705336] dark:bg-[#cba86f]/10 dark:text-[#f2d7a9]">{film.year}</span>
              </div>
              <div className="relative z-10 grid grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] gap-3">
                {film.photos.map((photo, imageIndex) => (
                  <figure key={photo.id} className="min-w-0">
                    <div className={"relative overflow-hidden rounded-xl border border-[#f4e5ca]/70 bg-gradient-to-br " + (index % 3 === 0 ? "from-[#2d384f] via-[#6b5870] to-[#c69d62]" : index % 3 === 1 ? "from-[#334b52] via-[#618078] to-[#e3c39a]" : "from-[#313b58] via-[#82718a] to-[#caa178]") + " " + (imageIndex === 0 ? "aspect-[4/5]" : "aspect-[4/5]")}>
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center text-[#fff2d8]" aria-hidden="true">
                        <span className="mb-2 text-3xl opacity-60">✧</span>
                        <span className="font-chinese text-[clamp(0.7rem,2vw,1.1rem)] font-semibold leading-relaxed">{film.character.zh.split(" · ")[0]}</span>
                        <span className="mt-3 text-[.56rem] font-medium tracking-[.15em] opacity-70">{locale === "zh" ? "照片待补" : "ẢNH TẠM"}</span>
                      </div>
                      {photo.src && (
                        <img
                          src={photo.src}
                          alt={photo.alt[locale]}
                          loading="lazy"
                          decoding="async"
                          referrerPolicy="no-referrer"
                          onError={(event) => { event.currentTarget.style.display = "none"; }}
                          className="absolute inset-0 h-full w-full object-cover object-top transition duration-700 group-hover:scale-[1.035]"
                        />
                      )}
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#131a2c]/35 via-transparent to-transparent" aria-hidden="true" />
                    </div>
                  </figure>
                ))}
              </div>
              <div className="relative z-10 mt-5">
                <p className="font-chinese text-xs font-semibold tracking-[.08em] text-[#967142] dark:text-[#e4bb79]">{film.title.zh}</p>
                <h3 className="mt-1 font-editorial text-xl font-semibold leading-snug text-[#29283c] dark:text-[#fff5e4] sm:text-2xl">
                  {film.title[locale]}
                </h3>
                <p className="mt-2 text-xs font-bold uppercase tracking-[.10em] text-[#87613c] dark:text-[#f1d097]">
                  {locale === "zh" ? "饰演" : "Vai diễn"} · {film.character[locale]}
                </p>
                <p className="mt-3 text-sm leading-7 text-[#685b4e] dark:text-[#d3dae9]">{film.description[locale]}</p>
                <a
                  href={film.referenceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex min-h-10 items-center gap-2 text-xs font-semibold text-[#8d652f] underline-offset-4 hover:underline dark:text-[#f1c986]"
                >
                  {locale === "zh" ? "查看作品资料" : "Xem tư liệu về vai diễn"} <span aria-hidden="true">↗</span>
                </a>
              </div>
            </motion.article>
          ))}
        </div>

        <div className="mb-10 mt-20 flex flex-col gap-2 border-b border-[#bd9763]/25 pb-7 dark:border-[#e7c990]/20 sm:mt-24">
          <p className="font-editorial text-2xl font-semibold text-[#463323] dark:text-[#ffe6bd] sm:text-3xl">
            {locale === "zh" ? "镜头外的温柔时光" : "Trịnh lão sư của hiện tại"}
          </p>
          <p className="text-sm leading-7 text-[#6e5e51] dark:text-slate-300">
            {locale === "zh" ? "从荧幕到身边，珍藏那些真实而温暖的瞬间。" : "Ngoài những vai diễn, còn có một Trịnh lão sư gần gũi trong những khoảnh khắc đời thường."}
          </p>
        </div>

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


        <div className="mt-7 flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[#bb9b6b]/45 bg-[#fffaf1]/50 px-5 py-10 text-center dark:bg-[#273148]/50">
          <Sparkles size={23} className="text-[#bd9763] dark:text-[#f5cf84]" aria-hidden="true" />
          <p className="font-editorial text-lg text-[#473c36] dark:text-[#ffe8c6]">
            {locale === "zh" ? "还有更多温暖的瞬间，等待珍藏…" : "Vẫn còn những khoảnh khắc đẹp đang chờ được lưu giữ…"}
          </p>
          <p className="text-xs text-[#7f705c] dark:text-slate-300">
            {locale === "zh" ? "更多近期照片即将补充" : "Đang dành chỗ cho những bức ảnh hiện tại tiếp theo"}
          </p>
        </div>

        <div className="relative mt-24 overflow-hidden rounded-[2rem] border border-[#eed29a]/30 bg-[radial-gradient(ellipse_at_75%_20%,#455374_0%,#202d45_45%,#151b30_100%)] p-6 shadow-[0_28px_80px_rgba(21,29,48,.2)] sm:p-10">
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[#eec56f]/15 blur-3xl" />
          <div className="relative z-10 grid items-center gap-7 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
            <div className="flex aspect-[4/5] max-h-[420px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-[#e5b96c]/45 bg-[radial-gradient(circle_at_40%_35%,#5b678b,#20253d_60%,#111725)] text-center shadow-[0_16px_60px_rgba(0,0,0,.22)]">
              {birthdayConfig.media.videoPath ? (
                <video
                  src={birthdayConfig.media.videoPath}
                  poster={birthdayConfig.media.heroImage}
                  preload="none"
                  controls
                  playsInline
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-5 p-5" aria-label={locale === "zh" ? "视频待添加" : "Chưa có video"}>
                  <Film size={48} className="text-[#f2d58a]" aria-hidden="true" />
                  <span className="font-editorial text-3xl italic text-[#fff1d4]">A Journey<br />Through Time</span>
                  <span className="text-2xl text-[#f2d58a]" aria-hidden="true">✧ ✦ ✧</span>
                  <span className="rounded-full border border-[#e9c78c]/45 px-4 py-2 text-[.66rem] font-bold uppercase tracking-[.16em] text-[#eacb99]">
                    {locale === "zh" ? "纪念视频即将上线" : "VIDEO ĐANG CHỜ BỔ SUNG"}
                  </span>
                </div>
              )}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[.22em] text-[#f1ce87]">A LITTLE FILM, FOR YOU</p>
              <h3 className="mt-4 font-editorial text-3xl font-semibold leading-tight text-[#fff7e6] sm:text-4xl">From the Screen,<br /><span className="italic text-[#f0ca82]">With Love.</span></h3>
              <p className="mt-5 text-sm leading-8 text-[#e7e5e9]">
                {locale === "zh" ? "从荧幕上的角色，到如今一次次温暖的相遇，时光流转，那份喜欢始终如一。" : "Từ những vai diễn năm ấy đến những cuộc gặp gỡ hôm nay, thời gian trôi qua nhưng những kỷ niệm đẹp vẫn luôn ở lại."}
              </p>
              <p className="mt-6 font-chinese text-lg text-[#eed29a]">光影流转，温暖如初。</p>
              <p className="mt-3 text-xs leading-6 text-[#bcc5d5]">
                {birthdayConfig.media.videoPath ? (locale === "zh" ? "点击视频即可观看" : "Bấm phát để xem video kỷ niệm") : (locale === "zh" ? "等待一段特别的粉丝剪辑" : "Dành chỗ cho video fan edit tổng hợp 45–60 giây")}
              </p>
            </div>
          </div>
        </div>

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
