import { ArrowDown, ArrowUpRight, Gift, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { StardustField } from "./StardustField";
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
      className="sd-intro"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: reduceMotion ? 1 : 1.015 }}
      transition={{ duration: reduceMotion ? 0.01 : 0.55 }}
      aria-label={labels.specialDay}
    >
      <StardustField variant="intro" />
      <div className="sd-intro__shell">
        <motion.div
          className="sd-intro__copy"
          initial={{ opacity: 0, y: reduceMotion ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduceMotion ? 0 : 0.13, duration: 0.68 }}
        >
          <div className="sd-intro__eyebrow"><Sparkles size={15} aria-hidden="true" /> {labels.eyebrow}</div>
          <p className="sd-intro__overline">{labels.specialDay}</p>
          <h1 className="sd-intro__headline">{labels.headline}</h1>
          <div className="sd-intro__name">
            <span className={locale === "zh" ? "font-chinese" : "font-vietnamese"}>{labels.chineseName}</span>
            <span className="sd-intro__name-star" aria-hidden="true">✧</span>
          </div>
          <p className={`sd-intro__description ${locale === "zh" ? "font-chinese" : "font-vietnamese"}`}>{labels.description}</p>
          <button type="button" onClick={onOpen} className="sd-intro__cta" aria-label={labels.openGift}>
            <Gift size={19} aria-hidden="true" />
            <span>{labels.openGift}</span>
            <ArrowUpRight size={17} aria-hidden="true" />
          </button>
          <p className="sd-intro__scroll"><ArrowDown size={14} aria-hidden="true" /> Scroll to discover the magic</p>
        </motion.div>

        <motion.div
          className="sd-intro__visual"
          initial={{ opacity: 0, y: reduceMotion ? 0 : 25, scale: reduceMotion ? 1 : 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: reduceMotion ? 0 : 0.18, duration: 0.85 }}
        >
          <div className="sd-intro__halo" aria-hidden="true" />
          <div className="sd-orbit sd-orbit--outer" aria-hidden="true" />
          <div className="sd-orbit sd-orbit--inner" aria-hidden="true" />
          <span className="sd-visual-star sd-visual-star--top" aria-hidden="true">✦</span>
          <span className="sd-visual-star sd-visual-star--left" aria-hidden="true">✧</span>
          <span className="sd-visual-star sd-visual-star--right" aria-hidden="true">✦</span>
          <div className="sd-intro__frame">
            <div className="sd-intro__photo">
              <img src={image} alt="Trịnh Quốc Lâm trong buổi sinh nhật, mặc áo vàng và cầm bánh kem" fetchPriority="high" />
              <div className="sd-intro__photo-shade" aria-hidden="true" />
              <div className="sd-intro__photo-label">sunshine <i>for</i> Guolin <span>✧</span></div>
            </div>
          </div>
          <div className="sd-intro__seal" aria-hidden="true">HAPPY<br />DAY <span>✦</span></div>
        </motion.div>
      </div>
      <span className="sd-intro__corner sd-intro__corner--tl" aria-hidden="true">✧</span>
      <span className="sd-intro__corner sd-intro__corner--br" aria-hidden="true">✧</span>
    </motion.section>
  );
}
