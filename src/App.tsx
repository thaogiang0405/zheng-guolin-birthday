import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { AnimatePresence } from "framer-motion";
import { Globe2, Moon, Sun } from "lucide-react";
import BirthdayCake from "./components/BirthdayCake";
import { BirthdayFinale } from "./components/BirthdayFinale";
import { BirthdayIntro } from "./components/BirthdayIntro";
import { BirthdayLetter } from "./components/BirthdayLetter";
import { FloatingDecorations } from "./components/FloatingDecorations";
import { HeroSection } from "./components/HeroSection";
import MemoryGallery from "./components/MemoryGallery";
import { MusicPlayer } from "./components/MusicPlayer";
import WishWall from "./components/WishWall";
import { birthdayConfig } from "./data/birthdayConfig";
import { copy } from "./data/copy";
import type { Locale } from "./types";

const languageStorageKey = "sunshine-for-guolin-language";
const themeStorageKey = "sunshine-for-guolin-theme";

function getStoredLocale(): Locale {
  try {
    return localStorage.getItem(languageStorageKey) === "zh" ? "zh" : birthdayConfig.defaultLocale;
  } catch {
    return birthdayConfig.defaultLocale;
  }
}

function getStoredTheme(): boolean {
  try {
    const saved = localStorage.getItem(themeStorageKey);
    if (saved) return saved === "dark";
  } catch {
    // System preference remains a useful fallback when storage is unavailable.
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
}

export default function App() {
  const [locale, setLocale] = useState<Locale>(getStoredLocale);
  const [dark, setDark] = useState(getStoredTheme);
  const [introOpen, setIntroOpen] = useState(true);
  const t = copy[locale];

  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-Hans" : "vi";
    document.title = `SUNSHINE FOR GUOLIN — ${birthdayConfig.person.names[locale]}`;
    document.querySelector('meta[name="description"]')?.setAttribute(
      "content",
      locale === "zh"
        ? "SUNSHINE FOR GUOLIN — 献给郑国霖的生日礼物。"
        : "SUNSHINE FOR GUOLIN — món quà sinh nhật dành tặng Trịnh Quốc Lâm.",
    );
    try { localStorage.setItem(languageStorageKey, locale); } catch { /* optional */ }
  }, [locale]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    try { localStorage.setItem(themeStorageKey, dark ? "dark" : "light"); } catch { /* optional */ }
  }, [dark]);

  const openGift = () => {
    setIntroOpen(false);
    if (!window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) {
      confetti({
        particleCount: 78,
        spread: 86,
        startVelocity: 28,
        origin: { y: 0.66 },
        colors: ["#F6CE4B", "#D7AC64", "#A9DDF1", "#FFF5E4"],
        scalar: 0.9,
      });
    }
    window.setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 70);
  };

  const toggleLocale = () => setLocale((value) => value === "vi" ? "zh" : "vi");

  return (
    <div className="page-shell min-h-screen bg-[#FFF5E4] text-[#29282C] transition-colors duration-500 dark:bg-[#1d2028] dark:text-[#FFF5E4]">
      <a href="#main-content" className="sr-only z-[120] rounded-full bg-[#29282C] px-5 py-3 text-sm font-bold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        {t.a11y.skipToContent}
      </a>

      {!introOpen && (
        <div className="fixed right-[max(1rem,env(safe-area-inset-right))] top-[max(1rem,env(safe-area-inset-top))] z-40 flex items-center gap-2">
          <button type="button" onClick={toggleLocale} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#D7AC64]/35 bg-[#FFFCF6]/90 px-4 text-xs font-extrabold tracking-[0.1em] text-[#4b3515] shadow-lg backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F6CE4B] focus-visible:ring-offset-2 dark:bg-[#29282C]/90 dark:text-[#FFF5E4] dark:hover:bg-[#343741] dark:focus-visible:ring-offset-[#1d2028]" aria-label={t.controls.switchLanguage} title={t.controls.switchLanguage}>
            <Globe2 className="h-4 w-4 text-[#D7AC64]" aria-hidden="true" />
            <span>{locale === "vi" ? "VN" : "中文"}</span><span className="text-[#D7AC64]">/</span><span>{locale === "vi" ? "中文" : "VN"}</span>
          </button>

          <button type="button" onClick={() => setDark((value) => !value)} className="grid min-h-11 min-w-11 place-items-center rounded-full border border-[#D7AC64]/35 bg-[#FFFCF6]/90 text-[#4b3515] shadow-lg backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F6CE4B] focus-visible:ring-offset-2 dark:bg-[#29282C]/90 dark:text-[#FFF5E4] dark:hover:bg-[#343741] dark:focus-visible:ring-offset-[#1d2028]" aria-label={dark ? t.controls.switchToLight : t.controls.switchToDark} title={dark ? t.controls.switchToLight : t.controls.switchToDark} aria-pressed={dark}>
            {dark ? <Sun className="h-4 w-4 text-[#F6CE4B]" /> : <Moon className="h-4 w-4 text-[#8e682c]" />}
          </button>
        </div>
      )}

      <AnimatePresence>
        {introOpen && (
          <BirthdayIntro
            locale={locale}
            image={birthdayConfig.media.invitationImage}
            labels={{
              eyebrow: t.intro.eyebrow,
              specialDay: t.intro.specialDay,
              headline: t.intro.birthdayHeadline,
              chineseName: birthdayConfig.person.names[locale],
              description: t.intro.dearSubheading,
              openGift: t.intro.enter,
            }}
            onOpen={openGift}
          />
        )}
      </AnimatePresence>

      <main id="main-content" aria-hidden={introOpen}>
        <HeroSection
          locale={locale}
          image={birthdayConfig.media.heroImage}
          labels={{
            eyebrow: t.hero.eyebrow,
            titleLineOne: t.hero.titleLineOne,
            titleLineTwo: t.hero.titleLineTwo,
            body: t.hero.editorialBody,
            chineseAccent: t.hero.chineseAccent,
            warmWords: t.hero.warmWords,
            scroll: t.hero.explore,
          }}
        />

        <MemoryGallery
          items={birthdayConfig.media.gallery}
          locale={locale}
          labels={{
            sectionEyebrow: t.gallery.eyebrow,
            title: t.gallery.title,
            intro: t.gallery.description,
            close: t.gallery.closeLightbox,
            previous: t.gallery.previous,
            next: t.gallery.next,
            replaceHint: t.gallery.videoUnavailable,
          }}
        />

        <BirthdayLetter
          locale={locale}
          letter={birthdayConfig.letter.localized[locale]}
          labels={{
            eyebrow: t.letter.eyebrow,
            title: t.letter.title,
            envelopeTo: t.letter.envelopeTo,
            envelopeFrom: t.letter.envelopeFrom,
            open: t.letter.open,
          }}
        />

        <BirthdayCake
          locale={locale}
          labels={{
            eyebrow: t.cake.eyebrow,
            title: t.cake.title,
            body: t.cake.description,
            makeWish: t.cake.blowCandles,
            replay: t.cake.reset,
            wishResult: "May all your wishes come true, Guolin.",
            wishResultZh: "愿你岁岁平安，所愿皆成。",
          }}
        />

        <WishWall
          locale={locale}
          maxLength={birthdayConfig.wishes.maxLength}
          labels={{
            eyebrow: t.wishes.eyebrow,
            title: t.wishes.title,
            body: t.wishes.description,
            placeholder: t.wishes.inputPlaceholder,
            submit: t.wishes.submit,
            empty: t.wishes.empty,
            note: `${t.wishes.limit.replace("{max}", String(birthdayConfig.wishes.maxLength))} · ${locale === "zh" ? "仅保存在当前浏览器" : "Chỉ lưu trên trình duyệt của bạn"}`,
          }}
        />

        <BirthdayFinale
          locale={locale}
          image={birthdayConfig.media.finaleImage}
          labels={{
            eyebrow: t.finale.eyebrow,
            title: t.finale.title,
            chineseTitle: t.finale.chineseTitle,
            body: t.finale.description,
            celebrateAgain: t.finale.replay,
          }}
        />
      </main>

      <footer className="relative overflow-hidden bg-[#29282C] px-5 py-12 text-center text-[#FFF5E4] sm:px-8">
        <FloatingDecorations />
        <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-2 text-sm">
          <p className="font-editorial text-xl italic text-[#F6CE4B]">SUNSHINE FOR GUOLIN</p>
          <p>{t.footer.madeWithLove}</p>
          <p className="text-[#FFF5E4]/65">{t.footer.dedication}</p>
        </div>
      </footer>

      <MusicPlayer src={birthdayConfig.media.musicPath} label={t.a11y.musicOn} />
    </div>
  );
}
