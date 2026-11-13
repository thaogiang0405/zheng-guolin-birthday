import { useLayoutEffect, useRef } from "react";
import { ArrowDown, Sparkles, Star } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Locale } from "../types";

gsap.registerPlugin(ScrollTrigger);

interface HeroSectionProps {
  locale: Locale;
  image: string;
  labels: {
    eyebrow: string;
    titleLineOne: string;
    titleLineTwo: string;
    body: string;
    chineseAccent: string;
    warmWords: string[];
    scroll: string;
  };
}

export function HeroSection({ locale, image, labels }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();

  useLayoutEffect(() => {
    if (reduceMotion || !sectionRef.current) return;
    const context = gsap.context(() => {
      gsap.to(".hero-parallax-image", {
        yPercent: 13,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }, sectionRef);
    return () => context.revert();
  }, [reduceMotion]);

  return (
    <section ref={sectionRef} className="section-shell paper-grain relative overflow-hidden bg-[#FFF5E4] transition-colors duration-500 dark:bg-[#1d2028]" id="sunshine">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.94fr_1.06fr] lg:items-center lg:gap-20">
        <motion.div
          initial={{ opacity: 0, y: reduceMotion ? 0 : 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: reduceMotion ? 0.01 : 0.75 }}
          className="relative z-10 order-2 lg:order-1"
        >
          <p className="section-kicker">{labels.eyebrow}</p>
          <h2 className={`font-editorial mt-7 text-[clamp(3.45rem,8vw,7.2rem)] font-semibold leading-[0.86] tracking-[-0.06em] text-[#29282C] dark:text-[#FFF5E4] ${locale === "zh" ? "font-chinese tracking-[-0.04em]" : ""}`}>
            <span className="block">{labels.titleLineOne}</span>
            <span className="block text-[#D7AC64]">{labels.titleLineTwo}</span>
          </h2>
          <p className={`mt-8 max-w-md text-base leading-8 text-[#29282C]/70 dark:text-[#FFF5E4]/72 ${locale === "zh" ? "font-chinese" : "font-vietnamese"}`}>{labels.body}</p>

          <div className="mt-9 flex flex-wrap gap-x-5 gap-y-3">
            {labels.warmWords.map((word, index) => (
              <span key={word} className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#8e682c] dark:text-[#FFF0B8]">
                {index % 2 === 0 ? <Star className="h-3.5 w-3.5 fill-[#F6CE4B] text-[#F6CE4B]" /> : <Sparkles className="h-3.5 w-3.5 text-[#7DB9D5]" />}
                {word}
              </span>
            ))}
          </div>

          <a href="#moments" className="outline-button mt-10 w-fit border-[#29282C]/35 text-[#29282C] dark:border-[#FFF5E4]/40 dark:text-[#FFF5E4]">
            {labels.scroll}<ArrowDown className="h-4 w-4" aria-hidden="true" />
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: reduceMotion ? 0 : 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: reduceMotion ? 0.01 : 0.8, delay: 0.08 }}
          className="relative order-1 mx-auto w-full max-w-[38rem] lg:order-2 lg:ml-auto"
        >
          <span className="absolute -left-8 top-[8%] h-28 w-28 rounded-full border border-[#F6CE4B]/80" aria-hidden="true" />
          <span className="absolute -right-5 bottom-[9%] h-24 w-24 rounded-full bg-[#A9DDF1]/70" aria-hidden="true" />
          <div className="hero-parallax-image relative aspect-[4/5] overflow-hidden rounded-[2.25rem] bg-[#F6CE4B] shadow-soft">
            <img src={image} alt="Trịnh Quốc Lâm wearing a yellow shirt and holding a birthday cake" className="h-[112%] w-full -translate-y-[4%] object-cover object-[50%_40%]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#29282C]/35 via-transparent to-transparent" />
            <span className="absolute bottom-7 left-7 font-editorial text-4xl italic text-[#FFFCF6] sm:text-5xl">our<br />sunshine</span>
            <span className="hero-vertical-text absolute right-5 top-7 text-sm font-semibold tracking-[0.45em] text-[#FFFCF6] [writing-mode:vertical-rl]">{labels.chineseAccent}</span>
          </div>
          <span className="floating-star absolute -right-4 top-[18%] grid h-10 w-10 place-items-center rounded-full bg-[#F6CE4B] text-[#29282C] shadow-lg" aria-hidden="true"><Sparkles className="h-4 w-4" /></span>
        </motion.div>
      </div>
    </section>
  );
}
