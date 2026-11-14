import confetti from "canvas-confetti";
import { PartyPopper, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type { Locale } from "../types";
import { StardustField } from "./StardustField";

interface BirthdayFinaleProps {
  locale: Locale;
  image: string;
  onCelebrateEffect?: () => void;
  labels: {
    eyebrow: string;
    title: string;
    chineseTitle: string;
    body: string;
    celebrateAgain: string;
  };
}

export function BirthdayFinale({ locale, image, labels, onCelebrateEffect }: BirthdayFinaleProps) {
  const reduceMotion = useReducedMotion();

  const celebrate = () => {
    onCelebrateEffect?.();
    if (reduceMotion) return;
    const colors = ["#F6CE4B", "#D7AC64", "#A9DDF1", "#FFF5E4"];
    confetti({ particleCount: 84, spread: 110, startVelocity: 35, origin: { y: 0.7 }, colors, scalar: 1.02 });
    window.setTimeout(() => confetti({ particleCount: 52, spread: 82, origin: { x: 0.14, y: 0.54 }, colors, scalar: 0.85 }), 170);
    window.setTimeout(() => confetti({ particleCount: 52, spread: 82, origin: { x: 0.86, y: 0.54 }, colors, scalar: 0.85 }), 260);
  };

  return (
    <section className="section-shell relative isolate min-h-[90svh] overflow-hidden bg-[linear-gradient(135deg,#F6CE4B_0%,#FFF0B8_44%,#A9DDF1_130%)]" id="finale">
      <div className="finale-sun pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />
      <StardustField variant="finale" />
      <Balloons />
      <div className="relative z-10 mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-20">
        <motion.div
          initial={{ opacity: 0, y: reduceMotion ? 0 : 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: reduceMotion ? 0.01 : 0.7 }}
          className="mx-auto w-full max-w-[28rem] lg:order-2"
        >
          <div className="relative overflow-hidden rounded-[2.2rem] border-[10px] border-[#FFFCF6] bg-[#FFF5E4] shadow-[0_35px_70px_rgba(101,74,20,0.25)]">
            <img src={image} alt="Trịnh Quốc Lâm celebrating a birthday surrounded by golden balloons" className="aspect-[2/2.45] w-full object-cover object-[50%_48%]" loading="lazy" decoding="async" />
            <span className="absolute bottom-5 left-5 rounded-full bg-[#29282C]/75 px-4 py-2 text-[0.62rem] font-bold uppercase tracking-[0.17em] text-[#FFF5E4] backdrop-blur-md">SUNSHINE FOR GUOLIN</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: reduceMotion ? 0 : 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: reduceMotion ? 0.01 : 0.75, delay: 0.08 }}
          className="text-center lg:order-1 lg:text-left"
        >
          <p className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.18em] text-[#725113]"><Sparkles className="h-4 w-4" />{labels.eyebrow}</p>
          <h2 className="font-editorial mt-6 text-[clamp(3.1rem,7vw,6.5rem)] font-semibold leading-[0.88] tracking-[-0.065em] text-[#29282C]">{labels.title}</h2>
          <p className={`mt-5 text-2xl font-semibold text-[#725113] ${locale === "zh" ? "font-chinese" : "font-vietnamese"}`}>{labels.chineseTitle}</p>
          <p className={`mx-auto mt-7 max-w-lg text-base leading-8 text-[#29282C]/75 lg:mx-0 ${locale === "zh" ? "font-chinese" : "font-vietnamese"}`}>{labels.body}</p>
          <button type="button" onClick={celebrate} className="golden-button mt-9 border-[#29282C]/15 bg-[#FFFCF6] hover:bg-white">
            <PartyPopper className="h-4 w-4" aria-hidden="true" />{labels.celebrateAgain}
          </button>
        </motion.div>
      </div>
    </section>
  );
}

function Balloons() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-0 overflow-hidden" aria-hidden="true">
      <span className="balloon left-[6%] top-[74%] bg-[#A9DDF1] opacity-75 [--balloon-speed:17s]" />
      <span className="balloon left-[21%] top-[91%] bg-[#F6CE4B] opacity-75 [--balloon-speed:13s] [animation-delay:-5s]" />
      <span className="balloon right-[7%] top-[72%] bg-[#D7AC64] opacity-75 [--balloon-speed:15s] [animation-delay:-3s]" />
      <span className="balloon right-[24%] top-[100%] bg-[#FFF5E4] opacity-85 [--balloon-speed:19s] [animation-delay:-9s]" />
    </div>
  );
}
