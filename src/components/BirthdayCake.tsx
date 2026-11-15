import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Flame, Gift, Heart, RotateCcw, Sparkles, Star, Wind } from "lucide-react";
import { StardustField } from "./StardustField";
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

type CakePhase = "idle" | "lighting" | "wish" | "blowing" | "celebrate";

const candleOrder = [2, 0, 4, 1, 3];
const glowColors = ["#f7d48c", "#fff0b3", "#a9dcf4", "#f1b89c", "#fdf5e7"];

function fireworks(reducedMotion: boolean) {
  if (reducedMotion) return;
  const options = { colors: glowColors, gravity: 0.85, ticks: 220, scalar: 0.95, disableForReducedMotion: true };
  confetti({ ...options, particleCount: 108, origin: { x: 0.5, y: 0.56 }, spread: 108, startVelocity: 32 });
  confetti({ ...options, particleCount: 55, origin: { x: 0.18, y: 0.67 }, angle: 65, spread: 70, startVelocity: 29 });
  confetti({ ...options, particleCount: 55, origin: { x: 0.82, y: 0.67 }, angle: 115, spread: 70, startVelocity: 29 });
}

export default function BirthdayCake({ locale, labels, onWishEffect }: BirthdayCakeProps) {
  const [phase, setPhase] = useState<CakePhase>("idle");
  const [litCandles, setLitCandles] = useState<number[]>([]);
  const [showSecret, setShowSecret] = useState(false);
  const [cycle, setCycle] = useState(0);
  const timeoutIds = useRef<number[]>([]);
  const reduceMotion = useReducedMotion();
  const zh = locale === "zh";
  const isLit = phase === "lighting" || phase === "wish";
  const isCelebrating = phase === "celebrate";

  const clearTimers = () => {
    timeoutIds.current.forEach(id => window.clearTimeout(id));
    timeoutIds.current = [];
  };

  useEffect(() => () => {
    timeoutIds.current.forEach(id => window.clearTimeout(id));
  }, []);

  const schedule = (fn: () => void, delay: number) => {
    timeoutIds.current.push(window.setTimeout(fn, delay));
  };

  const lightCandles = () => {
    if (phase !== "idle") return;
    setPhase("lighting");
    setShowSecret(false);
    if (reduceMotion) {
      setLitCandles([0, 1, 2, 3, 4]);
      setPhase("wish");
      return;
    }
    setLitCandles([]);
    candleOrder.forEach((index, order) => {
      schedule(() => setLitCandles(current => [...current, index]), 260 + order * 300);
    });
    schedule(() => setPhase("wish"), 260 + candleOrder.length * 300 + 250);
  };

  const blowCandles = () => {
    if (phase !== "wish") return;
    clearTimers();
    setPhase("blowing");
    setLitCandles([]);
    onWishEffect?.();
    if (reduceMotion) {
      setPhase("celebrate");
      return;
    }
    schedule(() => {
      setPhase("celebrate");
      fireworks(false);
    }, 720);
  };

  const restart = () => {
    clearTimers();
    setPhase("idle");
    setLitCandles([]);
    setShowSecret(false);
    setCycle(n => n + 1);
  };

  const stageClick = () => {
    if (phase === "idle") lightCandles();
    else if (phase === "wish") blowCandles();
  };

  const progress = phase === "idle" ? 0 : phase === "lighting" ? 1 : phase === "wish" ? 2 : 3;
  const status = phase === "idle"
    ? (zh ? "点亮五颗小小的星光吧。" : "Thắp sáng từng ngọn nến cho thầy nhé.")
    : phase === "lighting"
      ? (zh ? "一盏、两盏……星光正在依次点亮。" : "Một ngọn, hai ngọn... ánh nến đang dần sáng lên.")
      : phase === "wish"
        ? (zh ? "闭上眼睛，为郑老师许一个温柔的愿望。" : "Nhắm mắt một chút, gửi đến Trịnh lão sư một điều ước thật đẹp.")
        : phase === "blowing"
          ? (zh ? "呼——让心愿飞向星空。" : "Phùuu... điều ước đang bay đến những vì sao.")
          : (zh ? "愿郑老师岁岁平安，所愿皆成。" : "Mong Trịnh lão sư luôn bình an, mọi điều ước đều thành hiện thực.");

  return (
    <section
      id="cake"
      className={"cake-cosmos section-shell relative isolate overflow-hidden cake-cosmos--" + phase}
      lang={zh ? "zh-Hans" : "vi"}
      aria-labelledby="cake-title"
    >
      <StardustField variant="hero" />
      <div className="cake-cosmos__nebula cake-cosmos__nebula--left" aria-hidden="true" />
      <div className="cake-cosmos__nebula cake-cosmos__nebula--right" aria-hidden="true" />
      <div className="cake-cosmos__moon" aria-hidden="true">☾</div>

      <div className="relative z-10 mx-auto max-w-6xl">
        <motion.header
          className="mx-auto max-w-3xl text-center"
          initial={{ opacity: 0, y: reduceMotion ? 0 : 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.65 }}
          viewport={{ once: true, amount: 0.25 }}
        >
          <div className="cake-cosmos__eyebrow"><Star size={15} aria-hidden="true" /> {labels.eyebrow} <Star size={15} aria-hidden="true" /></div>
          <h2 id="cake-title" className={"cake-cosmos__title mt-5 " + (zh ? "font-chinese" : "font-vietnamese")}>{labels.title}</h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-8 text-[#e8dfd4] sm:text-base">
            {zh ? "今夜的星光与烛光，都在为郑老师闪耀。" : "Đêm nay, những vì sao và ánh nến đều đang chúc mừng Trịnh lão sư."}
          </p>
        </motion.header>

        <div className="cake-cosmos__experience mt-10 sm:mt-14">
          <div className="cake-cosmos__scene">
            <div className={"cake-cosmos__aura " + (isLit ? "cake-cosmos__aura--lit" : "")} aria-hidden="true" />
            <div className="cake-cosmos__orbit cake-cosmos__orbit--outer" aria-hidden="true" />
            <div className="cake-cosmos__orbit cake-cosmos__orbit--inner" aria-hidden="true" />
            <div className="cake-cosmos__small-star cake-cosmos__small-star--a" aria-hidden="true">✧</div>
            <div className="cake-cosmos__small-star cake-cosmos__small-star--b" aria-hidden="true">✦</div>
            <div className="cake-cosmos__small-star cake-cosmos__small-star--c" aria-hidden="true">✧</div>
            <div className="cake-cosmos__small-star cake-cosmos__small-star--d" aria-hidden="true">✦</div>
            <div className="cake-cosmos__pedestal" aria-hidden="true" />
            <button
              type="button"
              onClick={stageClick}
              disabled={phase === "lighting" || phase === "blowing" || phase === "celebrate"}
              aria-label={phase === "idle" ? (zh ? "点击蛋糕点亮蜡烛" : "Chạm vào bánh để thắp nến") : phase === "wish" ? (zh ? "点击蛋糕吹灭蜡烛" : "Chạm vào bánh để thổi nến") : (zh ? "生日蛋糕" : "Bánh sinh nhật")}
              className="cake-cosmos__cake-button relative z-10 block disabled:cursor-default"
            >
              <div className="cake-cosmos__cake" key={cycle} aria-hidden="true">
                <div className="cake-cosmos__plate" />
                <div className="cake-cosmos__tier cake-cosmos__tier--bottom">
                  <div className="cake-cosmos__icing" />
                  <span className="cake-cosmos__pearl cake-cosmos__pearl--one" />
                  <span className="cake-cosmos__pearl cake-cosmos__pearl--two" />
                  <span className="cake-cosmos__pearl cake-cosmos__pearl--three" />
                  <span className="cake-cosmos__pearl cake-cosmos__pearl--four" />
                  <span className="cake-cosmos__tier-name">郑老师</span>
                </div>
                <div className="cake-cosmos__tier cake-cosmos__tier--middle">
                  <div className="cake-cosmos__icing" />
                  <span className="cake-cosmos__tier-moon">☾</span>
                  <span className="cake-cosmos__tier-star cake-cosmos__tier-star--one">✧</span>
                  <span className="cake-cosmos__tier-star cake-cosmos__tier-star--two">✧</span>
                </div>
                <div className="cake-cosmos__tier cake-cosmos__tier--top">
                  <div className="cake-cosmos__icing" />
                  <div className="cake-cosmos__crown">✦</div>
                </div>
                <div className="cake-cosmos__candles">
                  {[0, 1, 2, 3, 4].map(index => (
                    <span
                      className={"cake-cosmos__candle " + (litCandles.includes(index) ? "cake-cosmos__candle--lit" : "")}
                      key={index}
                    >
                      <span className="cake-cosmos__flame" />
                    </span>
                  ))}
                </div>
                {(phase === "blowing" || phase === "celebrate") && (
                  <div className="cake-cosmos__smoke" key={"smoke-" + cycle}>
                    {[0, 1, 2, 3, 4].map(index => <i key={index} />)}
                  </div>
                )}
              </div>
            </button>
            <div className="cake-cosmos__ground-glow" aria-hidden="true" />
            <p className="cake-cosmos__scene-caption">
              {zh ? "✧ 许一个愿，点亮一片星空 ✧" : "✧ Một điều ước, một bầu trời sao ✧"}
            </p>
          </div>

          <div className="cake-cosmos__panel">
            <p className="text-[11px] font-bold uppercase tracking-[.26em] text-[#efd2a1]">THE BIRTHDAY WISH RITUAL</p>
            <h3 className={"mt-4 text-2xl font-semibold leading-snug text-[#fff2d8] sm:text-3xl " + (zh ? "font-chinese" : "font-vietnamese")}>
              {zh ? "把祝福交给烛光" : "Gửi điều ước vào ánh nến"}
            </h3>
            <p className="mt-4 text-sm leading-7 text-[#dfd5d1]">{labels.body}</p>
            <div className="cake-cosmos__steps mt-7">
              {[
                { number: 1, title: zh ? "点亮蜡烛" : "Thắp nến", symbol: "✦" },
                { number: 2, title: zh ? "悄悄许愿" : "Ước nguyện", symbol: "☾" },
                { number: 3, title: zh ? "吹灭蜡烛" : "Thổi nến", symbol: "♡" },
              ].map(step => (
                <div key={step.number} className={"cake-cosmos__step " + (progress === step.number ? "cake-cosmos__step--active" : "") + (progress > step.number ? " cake-cosmos__step--done" : "")}>
                  <div className="cake-cosmos__step-number">{step.symbol}</div>
                  <span>{step.title}</span>
                  <span className="ml-auto text-xs opacity-60">0{step.number}</span>
                </div>
              ))}
            </div>

            <p className="cake-cosmos__status mt-6" role="status" aria-live="polite">{status}</p>
            {phase === "idle" && (
              <button type="button" onClick={lightCandles} className="cake-cosmos__cta mt-5 w-full">
                <Flame size={19} aria-hidden="true" /> {zh ? "点亮五盏烛光" : "Thắp sáng những ngọn nến"} <Sparkles size={17} aria-hidden="true" />
              </button>
            )}
            {phase === "lighting" && (
              <div className="cake-cosmos__wait mt-5 text-center" aria-live="polite">
                <Sparkles size={18} className="inline-block" aria-hidden="true" /> {zh ? "星光正在亮起..." : "Đang thắp nến..."} ({litCandles.length}/5)
              </div>
            )}
            {phase === "wish" && (
              <motion.div initial={{ opacity: 0, y: reduceMotion ? 0 : 14 }} animate={{ opacity: 1, y: 0 }}>
                <p className="mt-5 text-center text-sm italic leading-7 text-[#f8deb3]">
                  {zh ? "闭上眼睛，想一个心愿吧 ✨" : "Nhắm mắt một chút và ước nhé ✨"}
                </p>
                <button type="button" onClick={blowCandles} className="cake-cosmos__cta mt-3 w-full">
                  <Wind size={19} aria-hidden="true" /> {labels.makeWish} <Sparkles size={17} aria-hidden="true" />
                </button>
              </motion.div>
            )}
            {phase === "blowing" && <div className="cake-cosmos__wait mt-5 text-center">{zh ? "心愿正在飞向星空..." : "Điều ước đang bay lên..."}</div>}
            <AnimatePresence>
              {isCelebrating && (
                <motion.div
                  initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.91, y: reduceMotion ? 0 : 24 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.75, ease: [0.22, 1, 0.36, 1] }}
                  className="cake-cosmos__result mt-6"
                >
                  <div className="mb-3 flex justify-center gap-3 text-[#f9daa0]" aria-hidden="true">✧ &nbsp; ✦ &nbsp; ✧</div>
                  <p className="font-chinese text-[clamp(1.7rem,3vw,2.5rem)] font-extrabold leading-snug text-[#fce5b6]">
                    郑老师，生日快乐！
                  </p>
                  <p className="mt-3 font-chinese text-lg text-[#fff3d9]">愿岁岁平安，所愿皆成。</p>
                  <p className="mt-3 text-sm leading-7 text-[#e5dcd4]">
                    {zh ? "愿往后的日子里，笑容常在，温柔常伴。" : "Mong thầy luôn bình an, và mỗi ngày đều có thật nhiều điều để mỉm cười."}
                  </p>
                  <button type="button" onClick={() => setShowSecret(value => !value)} className="cake-cosmos__secret-button mt-6 w-full" aria-expanded={showSecret}>
                    <Gift size={17} aria-hidden="true" />
                    {showSecret ? (zh ? "收起隐藏的祝福" : "Gấp điều ước bí mật") : (zh ? "打开一份秘密祝福" : "Mở điều ước bí mật")}
                  </button>
                  <AnimatePresence>
                    {showSecret && (
                      <motion.p
                        key="secret-wish"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="cake-cosmos__secret-note overflow-hidden"
                      >
                        <Heart size={16} className="mx-auto mb-3 text-[#b7774b]" aria-hidden="true" />
                        {zh ? "愿新的一岁，平安喜乐，自在随心。每天都能做喜欢的事，也被真诚的爱意包围。♡" : "Mong tuổi mới của thầy thật nhiều niềm vui dịu dàng, được làm điều mình thích và luôn có những người chân thành ở bên. ♡"}
                      </motion.p>
                    )}
                  </AnimatePresence>
                  <button type="button" onClick={restart} className="cake-cosmos__restart mt-5 w-full">
                    <RotateCcw size={17} aria-hidden="true" /> {labels.replay}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {isCelebrating && (
          <motion.div
            initial={{ opacity: 0, y: reduceMotion ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto mt-12 max-w-4xl text-center"
          >
            <p className="font-chinese text-2xl font-semibold tracking-wider text-[#ffe4aa] sm:text-3xl">✦ &nbsp; 郑老师，生日快乐！ &nbsp; ✦</p>
            <p className="mt-3 text-sm leading-7 text-[#ece1d2]">
              {zh ? "下一站：去看看大家写给您的生日来信吧。" : "Và vẫn còn những lá thư khác đang chờ thầy đọc nữa đó."}
            </p>
            <a href="#wishes" className="cake-cosmos__to-letters mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-7 py-3 text-sm font-bold">
              <Heart size={16} aria-hidden="true" /> {zh ? "读来自大家的信与祝福" : "Đọc thư và lời chúc của mọi người"}
            </a>
          </motion.div>
        )}
      </div>
    </section>
  );
}
