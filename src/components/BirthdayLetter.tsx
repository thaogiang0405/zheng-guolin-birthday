import { useState } from "react";
import confetti from "canvas-confetti";
import { MailOpen, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type { Locale } from "../types";

interface BirthdayLetterProps {
  locale: Locale;
  letter: string[];
  labels: {
    eyebrow: string;
    title: string;
    envelopeTo: string;
    envelopeFrom: string;
    open: string;
  };
}

export function BirthdayLetter({ locale, letter, labels }: BirthdayLetterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  const openLetter = () => {
    if (isOpen) return;
    setIsOpen(true);
    if (!reduceMotion) {
      confetti({
        particleCount: 42,
        spread: 72,
        startVelocity: 24,
        origin: { y: 0.64 },
        colors: ["#F6CE4B", "#D7AC64", "#A9DDF1", "#FFF5E4"],
        scalar: 0.82,
      });
    }
  };

  return (
    <section className="section-shell relative overflow-hidden bg-[#FFFCF6] transition-colors duration-500 dark:bg-[#171a22]" id="letter">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-center lg:gap-16">
        <motion.header
          initial={{ opacity: 0, y: reduceMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: reduceMotion ? 0.01 : 0.65 }}
        >
          <p className="section-kicker">{labels.eyebrow}</p>
          <h2 className={`font-editorial mt-7 text-[clamp(3rem,6vw,5.6rem)] font-semibold leading-[0.9] tracking-[-0.055em] text-[#29282C] dark:text-[#FFF5E4] ${locale === "zh" ? "font-chinese tracking-[-0.035em]" : ""}`}>{labels.title}</h2>
          <p className="mt-7 max-w-sm text-base leading-8 text-[#29282C]/65 dark:text-[#FFF5E4]/70">{isOpen ? "✦" : "✉"}</p>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: reduceMotion ? 0 : 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: reduceMotion ? 0.01 : 0.75, delay: 0.1 }}
          className="letter-stage relative"
        >
          <div id="birthday-letter" className={`envelope ${isOpen ? "open" : ""}`}>
            <div className="letter-sheet overflow-y-auto">
              <div className={`font-editorial text-[clamp(1rem,2vw,1.25rem)] italic leading-[1.92] text-[#4b3515] ${locale === "zh" ? "font-chinese not-italic" : ""}`}>
                {letter.map((paragraph, index) => <p key={`${paragraph}-${index}`} className={index === 0 ? "font-semibold" : "mt-4"}>{paragraph}</p>)}
              </div>
            </div>
            <div className="envelope-flap" />
            <div className="wax-seal"><Sparkles className="h-5 w-5" aria-hidden="true" /></div>
            <div className="absolute left-7 top-7 z-[6] whitespace-pre-line text-[0.68rem] font-bold uppercase leading-5 tracking-[0.16em] text-[#7d5620]">{labels.envelopeTo}<br />{labels.envelopeFrom}</div>
          </div>

          {!isOpen && (
            <button type="button" onClick={openLetter} className="golden-button absolute bottom-5 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap" aria-expanded="false" aria-controls="birthday-letter">
              <MailOpen className="h-4 w-4" aria-hidden="true" />{labels.open}
            </button>
          )}
        </motion.div>
      </div>
    </section>
  );
}
