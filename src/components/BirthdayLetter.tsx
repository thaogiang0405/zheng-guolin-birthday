import { useState, type FormEvent } from "react";
import confetti from "canvas-confetti";
import { Eye, EyeOff, Heart, KeyRound, LockKeyhole, MailOpen, RotateCcw, Sparkles, Star } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { StardustField } from "./StardustField";
import type { Locale } from "../types";

interface BirthdayLetterProps {
  locale: Locale;
  letter: string[];
  onOpenEffect?: () => void;
  onUnlockChange?: (unlocked: boolean) => void;
  labels: {
    eyebrow: string;
    title: string;
    envelopeTo: string;
    envelopeFrom: string;
    open: string;
  };
}

/**
 * Playful fan-gift lock, NOT an authentication boundary. Both the passphrase
 * and the letter text ship to the browser as part of this public Vite app.
 * Real privacy requires server-side authentication and protected content.
 */
const LETTER_PASSPHRASE = "2705520";

export function BirthdayLetter({ locale, letter, labels, onOpenEffect, onUnlockChange }: BirthdayLetterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [showPasscode, setShowPasscode] = useState(false);
  const [hasError, setHasError] = useState(false);
  const reduceMotion = useReducedMotion();
  const zh = locale === "zh";

  const unlockLetter = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (passcode.trim().normalize("NFKC") !== LETTER_PASSPHRASE) {
      setHasError(true);
      return;
    }
    setHasError(false);
    setIsOpen(true);
    onUnlockChange?.(true);
    onOpenEffect?.();
    if (!reduceMotion) {
      confetti({
        particleCount: 95,
        spread: 95,
        startVelocity: 30,
        origin: { y: 0.55 },
        colors: ["#e7b969", "#fff4cd", "#b5dcfc", "#fff7ea", "#d99f66"],
        scalar: 0.9,
      });
    }
  };

  const sealAgain = () => {
    setIsOpen(false);
    onUnlockChange?.(false);
    setPasscode("");
    setHasError(false);
    setShowPasscode(false);
  };

  return (
    <section id="letter" className="letter-cosmos section-shell relative isolate overflow-hidden" aria-labelledby="secret-letter-title">
      <StardustField variant="hero" />
      <div className="letter-cosmos__halo letter-cosmos__halo--one" aria-hidden="true" />
      <div className="letter-cosmos__halo letter-cosmos__halo--two" aria-hidden="true" />
      <div className="letter-cosmos__orbit letter-cosmos__orbit--one" aria-hidden="true" />
      <div className="letter-cosmos__orbit letter-cosmos__orbit--two" aria-hidden="true" />
      <div className="letter-cosmos__floater letter-cosmos__floater--one" aria-hidden="true">✧</div>
      <div className="letter-cosmos__floater letter-cosmos__floater--two" aria-hidden="true">✦</div>

      <div className="relative z-10 mx-auto max-w-6xl">
        <motion.header
          initial={{ opacity: 0, y: reduceMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: reduceMotion ? 0 : 0.7 }}
          className="mx-auto mb-10 max-w-3xl text-center sm:mb-14"
        >
          <p className="letter-cosmos__kicker"><Star size={14} aria-hidden="true" /> {zh ? "STARDUST · 一封秘密来信" : "STARDUST · A SECRET LETTER"} <Star size={14} aria-hidden="true" /></p>
          <h2
            id="secret-letter-title"
            className={`letter-cosmos__title mt-6 ${zh ? "font-chinese" : "font-vietnamese"}`}
          >
            {labels.title}
          </h2>
          <p className={`mx-auto mt-5 max-w-xl text-sm leading-8 text-[#e9e0ce]/85 sm:text-base ${zh ? "font-chinese" : "font-vietnamese"}`}>
            {zh
              ? "星光之间，藏着一封只为特别之人准备的信。"
              : "Giữa những vì sao, có một lá thư chỉ chờ đúng người mở ra."}
          </p>
        </motion.header>

        <AnimatePresence mode="wait" initial={false}>
          {!isOpen ? (
            <motion.div
              key="sealed"
              initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: reduceMotion ? 1 : 0.97, y: reduceMotion ? 0 : -20 }}
              transition={{ duration: reduceMotion ? 0 : 0.48 }}
              className="letter-cosmos__locked"
            >
              <div className="letter-cosmos__envelope-scene" aria-label={zh ? "一封金色的密封信" : "Một phong thư vàng đang được niêm phong"}>
                <div className="letter-cosmos__envelope-aura" aria-hidden="true" />
                <div className="letter-cosmos__envelope" aria-hidden="true">
                  <div className="letter-cosmos__envelope-pattern">✦ &nbsp; ✧ &nbsp; ✦</div>
                  <div className="letter-cosmos__envelope-top" />
                  <div className="letter-cosmos__envelope-bottom" />
                  <div className="letter-cosmos__envelope-label">
                    <span>{labels.envelopeTo}</span>
                    <span>{labels.envelopeFrom}</span>
                  </div>
                  <div className="letter-cosmos__wax"><Sparkles size={28} strokeWidth={1.5} /></div>
                </div>
                <div className="letter-cosmos__envelope-stars" aria-hidden="true">✦ <span>✧</span> ✦</div>
              </div>

              <div className="letter-cosmos__unlock-panel">
                <div className="letter-cosmos__unlock-icon"><LockKeyhole size={23} aria-hidden="true" /></div>
                <p className="text-[0.68rem] font-bold uppercase tracking-[.24em] text-[#f2d49b]">FOR YOUR EYES ONLY</p>
                <h3 className={`mt-3 text-2xl font-semibold leading-snug text-[#fff8ec] sm:text-3xl ${zh ? "font-chinese" : "font-vietnamese"}`}>
                  {zh ? "不是晓晓？那可不能偷看哦！" : "Không phải 晓晓? Đừng hòng đọc trộm nha!"}
                </h3>
                <p className={`mt-4 text-sm leading-7 text-[#e0d9d0]/85 ${zh ? "font-chinese" : "font-vietnamese"}`}>
                  {zh ? "想开启这封特别的信？先说出属于你的秘密口令。" : "Muốn mở phong thư bí mật này thì phải biết mật khẩu chứ! ♡"}
                </p>
                <form onSubmit={unlockLetter} className="mt-7" noValidate>
                  <label htmlFor="secret-letter-passcode" className={`mb-3 block text-xs font-bold tracking-[.08em] text-[#f6dbac] ${zh ? "font-chinese" : "font-vietnamese"}`}>
                    {zh ? "秘密口令" : "Mật khẩu mở thư"}
                  </label>
                  <div className={`letter-cosmos__input-wrap ${hasError ? "letter-cosmos__input-wrap--error" : ""}`}>
                    <KeyRound size={19} className="shrink-0 text-[#f3d59d]" aria-hidden="true" />
                    <input
                      id="secret-letter-passcode"
                      type={showPasscode ? "text" : "password"}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={12}
                      autoComplete="off"
                      spellCheck={false}
                      value={passcode}
                      onChange={event => { setPasscode(event.target.value); if (hasError) setHasError(false); }}
                      className="min-w-0 flex-1 bg-transparent py-3 text-base text-white outline-none placeholder:text-[#c7bec0]/65"
                      placeholder={zh ? "输入口令..." : "Nhập mật khẩu..."}
                      aria-invalid={hasError}
                      aria-describedby={hasError ? "secret-letter-error" : undefined}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasscode(value => !value)}
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-[#f2d49b] transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2d49b]"
                      aria-label={zh ? (showPasscode ? "隐藏口令" : "显示口令") : (showPasscode ? "Ẩn mật khẩu" : "Hiện mật khẩu")}
                    >
                      {showPasscode ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                    </button>
                  </div>
                  <p id="secret-letter-error" role="status" aria-live="polite" className="mt-2 min-h-6 text-sm font-medium text-[#ffd8bd]">
                    {hasError ? (zh ? "哎呀，口令不对！这封信还不能打开～" : "Sai mật khẩu rồi, lá thư chưa chịu mở đâu ní 😆") : ""}
                  </p>
                  <button type="submit" disabled={!passcode.trim()} className="letter-cosmos__unlock-button mt-4 w-full disabled:cursor-not-allowed disabled:opacity-50">
                    <MailOpen size={19} aria-hidden="true" />
                    <span>{zh ? "解锁这封信" : "Giải mã phong thư"}</span>
                    <Sparkles size={17} aria-hidden="true" />
                  </button>
                </form>
                <p className="mt-5 text-center text-[0.75rem] leading-6 text-[#cfc6c3]">
                  {zh ? "✧ 提示：一个特别的日子，加上一句数字告白 ✧" : "✧ Gợi ý: Một ngày đặc biệt và lời thương bằng số ✧"}
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.article
              key="unsealed"
              id="birthday-letter"
              initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.94, y: reduceMotion ? 0 : 55 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: reduceMotion ? 1 : 0.97 }}
              transition={{ duration: reduceMotion ? 0 : 0.85, ease: [0.22, 1, 0.36, 1] }}
              className="letter-cosmos__paper-wrap mx-auto max-w-4xl"
            >
              <div className="letter-cosmos__paper">
                <div className="letter-cosmos__paper-ornament" aria-hidden="true">✦ &nbsp; ✧ &nbsp; ✦</div>
                <div className="letter-cosmos__paper-meta">
                  <span>TO · 郑老师</span>
                  <Heart size={16} aria-hidden="true" />
                  <span>WITH ALL OUR LOVE</span>
                </div>
                <div className="letter-cosmos__paper-rule" />
                <h3 className="letter-cosmos__paper-heading">A LETTER, ONLY FOR YOU.</h3>
                <div className={`letter-cosmos__letter-text ${zh ? "font-chinese" : "font-vietnamese"}`}>
                  {letter.map((paragraph, index) => {
                    const isWish = paragraph.includes("晓晓，生日快乐！");
                    const isSignature = index === letter.length - 1;
                    return (
                      <p key={index} className={`letter-cosmos__paragraph ${index === 0 ? "letter-cosmos__greeting" : ""} ${isWish ? "letter-cosmos__special-wish" : ""} ${isSignature ? "letter-cosmos__signature" : ""}`}>
                        {isWish && <Sparkles size={22} className="mx-auto mb-4 text-[#c28c4d]" aria-hidden="true" />}
                        {paragraph}
                      </p>
                    );
                  })}
                </div>
                <div className="letter-cosmos__paper-ornament letter-cosmos__paper-ornament--bottom" aria-hidden="true">✧ &nbsp; ♡ &nbsp; ✧</div>
              </div>
              <div className="letter-cosmos__read-more mx-auto mt-8 max-w-lg text-center">
                <p className={`text-sm leading-7 text-[#f3e2c8] ${zh ? "font-chinese" : "font-vietnamese"}`}>
                  {zh ? "还有更多来自大家的信和祝福，在星光的另一端等着您。" : "Ngoài lá thư này, vẫn còn những lời thương của các bạn khác đang chờ thầy đọc nữa."}
                </p>
                <a href="#wishes" className="letter-cosmos__unlock-button mt-4 inline-flex min-h-12 items-center justify-center gap-2 px-7">
                  <Heart size={18} aria-hidden="true" />
                  {zh ? "读一读大家的来信" : "Đọc những lá thư khác"}
                </a>
              </div>
              <button type="button" className="letter-cosmos__relock mx-auto mt-7 flex items-center gap-2" onClick={sealAgain}>
                <RotateCcw size={16} aria-hidden="true" />
                {zh ? "重新封好这封信" : "Niêm phong lá thư lại"}
              </button>
            </motion.article>
          )}
        </AnimatePresence>
        <p className="mt-12 text-center text-xs tracking-[.15em] text-[#e1caa9]/70">✧ &nbsp; SUNSHINE FOR GUOLIN &nbsp; ✧</p>
      </div>
    </section>
  );
}
