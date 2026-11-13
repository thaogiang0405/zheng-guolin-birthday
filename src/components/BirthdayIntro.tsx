import { ArrowUpRight, Gift, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type { Locale } from "../types";

interface BirthdayIntroProps {
  locale: Locale;
  image: string;
  labels: {
    eyebrow: string;
    specialDay: string;
    headline: string;
    chineseName: string;
    description: string;
    openGift: string;
  };
  onOpen: () => void;
}

export function BirthdayIntro({ locale, image, labels, onOpen }: BirthdayIntroProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      className="intro-overlay paper-grain fixed inset-0 z-[100] min-h-[100svh] touch-pan-y overflow-x-hidden overflow-y-auto overscroll-contain bg-[#FFF5E4] pb-[max(1.5rem,env(safe-area-inset-bottom))] pl-[max(1.25rem,env(safe-area-inset-left))] pr-[max(1.25rem,env(safe-area-inset-right))] pt-[max(1.25rem,env(safe-area-inset-top))] text-[#29282C] dark:bg-[#1d2028] dark:text-[#FFF5E4]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: reduceMotion ? 1 : 1.03 }}
      transition={{ duration: reduceMotion ? 0.01 : 0.65 }}
      aria-label={labels.specialDay}
    >
      <FloatingPaperConfetti />
      <div className="relative z-10 mx-auto flex min-h-full w-full max-w-6xl flex-col justify-start py-4 sm:py-8 lg:grid lg:min-h-[calc(100svh-2.5rem)] lg:grid-cols-[1.04fr_0.96fr] lg:items-center lg:gap-14 lg:py-8">
        <motion.div
          initial={{ opacity: 0, y: reduceMotion ? 0 : 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduceMotion ? 0 : 0.1, duration: 0.7 }}
          className="intro-copy order-2 mt-6 max-w-xl lg:order-1 lg:mt-0"
        >
          <p className="section-kicker text-[#8e682c] dark:text-[#F6CE4B]">{labels.eyebrow}</p>
          <p className="mt-5 max-w-sm text-xs font-bold uppercase tracking-[0.16em] text-[#8e682c]/70 dark:text-[#FFF0B8]/70 sm:mt-8">{labels.specialDay}</p>
          <h1 className="font-editorial mt-3 text-[clamp(2.8rem,11vw,7.9rem)] font-semibold leading-[0.84] tracking-[-0.065em]">
            {labels.headline}
          </h1>
          <p className={`mt-4 text-xl font-semibold text-[#b27826] dark:text-[#F6CE4B] sm:mt-5 sm:text-2xl ${locale === "zh" ? "font-chinese" : "font-vietnamese"}`}>{labels.chineseName}</p>
          <p className={`mt-5 max-w-md text-base leading-8 text-[#29282C]/70 dark:text-[#FFF5E4]/75 sm:mt-7 ${locale === "zh" ? "font-chinese" : "font-vietnamese"}`}>{labels.description}</p>

          <button type="button" onClick={onOpen} className="golden-button intro-gift-button mt-7 max-w-full min-h-[3.25rem] sm:mt-9" aria-label={labels.openGift}>
            <Gift className="h-4 w-4" aria-hidden="true" />
            <span className="min-w-0 text-center">{labels.openGift}</span>
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, rotate: reduceMotion ? 0 : 4, scale: reduceMotion ? 1 : 0.96 }}
          animate={{ opacity: 1, rotate: -2, scale: 1 }}
          transition={{ delay: reduceMotion ? 0 : 0.18, duration: 0.85, type: "spring", stiffness: 110, damping: 17 }}
          className="intro-card relative order-1 mx-auto w-[min(72vw,17.5rem)] max-w-full rounded-[1.75rem] border-[11px] border-[#FFFCF6] bg-[#FFFCF6] p-2 sm:w-full sm:max-w-[26rem] lg:order-2 lg:ml-auto lg:mr-0"
        >
          <div className="intro-portrait relative aspect-[2/2.38] overflow-hidden rounded-[1.15rem] bg-[#F6CE4B]">
            <img src={image} alt="Trịnh Quốc Lâm celebrating his birthday with cake" className="h-full w-full object-cover object-[50%_40%]" fetchPriority="high" />
            <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between p-5 text-[#FFFCF6]">
              <span className="font-editorial text-2xl italic">Sunshine<br />for Guolin</span>
              <Sparkles className="h-6 w-6" aria-hidden="true" />
            </div>
          </div>
          <span className="absolute -left-6 -top-5 h-12 w-12 rounded-full border border-[#A9DDF1] bg-[#FFFCF6]/80" aria-hidden="true" />
          <span className="absolute -bottom-3 -right-3 h-16 w-16 rounded-full bg-[#A9DDF1]" aria-hidden="true" />
        </motion.div>
      </div>
    </motion.section>
  );
}

function FloatingPaperConfetti() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <span className="floating-star absolute left-[13%] top-[13%] h-3 w-3 rotate-45 bg-[#F6CE4B]" />
      <span className="floating-star floating-star--slow absolute right-[15%] top-[12%] h-3 w-3 rounded-full bg-[#A9DDF1]" />
      <span className="floating-star floating-star--fast absolute bottom-[18%] left-[7%] h-4 w-2 rotate-[25deg] rounded-full bg-[#D7AC64]" />
      <span className="floating-star absolute bottom-[17%] right-[8%] h-3 w-6 rotate-[-35deg] rounded-full bg-[#F6CE4B]" />
    </div>
  );
}
