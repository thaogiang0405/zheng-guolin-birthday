import { useState, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Heart, Mail, MailCheck, PenLine, RefreshCw, Send, ShieldCheck, Sparkles } from "lucide-react";
import { StardustField } from "./StardustField";
import { privateLettersConfigured, sendPrivateFanLetter } from "../services/privateLetters";
import type { Locale } from "../types";

export interface WishWallProps {
  locale: Locale;
  maxLength: number;
  labels: {
    eyebrow: string;
    title: string;
    body: string;
    placeholder: string;
    submit: string;
    empty: string;
    note: string;
  };
}

function limitText(text: string, count: number) {
  return Array.from(text).slice(0, count).join("");
}

function messageFor(error: unknown, zh: boolean) {
  const key = error instanceof Error ? error.message : "";
  if (key === "firebase-not-configured") return zh
    ? "Firebase 尚未配置，暂时无法发送。" : "Firebase chưa được nối nên hiện chưa gửi thư được.";
  if (key === "permission-denied") return zh
    ? "无法寄出。请检查 Firebase 权限设置。" : "Firebase từ chối lưu thư. Cần kiểm tra quyền gửi.";
  if (key === "rate-limited") return zh
    ? "请求太频繁了，请稍后再试。" : "Có quá nhiều lời gửi cùng lúc. Ní thử lại sau nhé.";
  return zh ? "寄信失败，请稍后再试。" : "Chưa gửi được thư, ní thử lại nhé.";
}

export default function WishWall({ locale, maxLength, labels }: WishWallProps) {
  const zh = locale === "zh";
  const reduceMotion = useReducedMotion();
  const [name, setName] = useState("");
  const [wish, setWish] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!wish.trim() || sending || !privateLettersConfigured) return;
    setSending(true);
    setError("");
    try {
      await sendPrivateFanLetter({ name, message: wish });
      setWish("");
      setSent(true);
    } catch (cause) {
      setError(messageFor(cause, zh));
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="wishes" className="sealed-mail-section section-shell relative isolate overflow-hidden" lang={zh ? "zh-Hans" : "vi"} aria-labelledby="wish-wall-title">
      <StardustField variant="hero" />
      <div className="relative z-10 mx-auto max-w-6xl">
        <motion.header
          initial={{ opacity: 0, y: reduceMotion ? 0 : 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: .25 }}
          transition={{ duration: reduceMotion ? 0 : .7 }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="mb-4 inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[.2em] text-[#f2d39b]">
            <Sparkles size={17} aria-hidden="true" /> {labels.eyebrow} <Sparkles size={17} aria-hidden="true" />
          </p>
          <h2 id="wish-wall-title" className={"text-[clamp(2.5rem,5.4vw,4.7rem)] font-semibold leading-[1.16] text-[#fff0d5] " + (zh ? "font-chinese" : "font-vietnamese")}>
            {labels.title}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#eadfd2]">{labels.body}</p>
          <p className="mx-auto mt-6 inline-flex items-center justify-center gap-2 rounded-full border border-[#e5c289]/30 bg-white/5 px-4 py-2 text-xs leading-6 text-[#f5dca9]">
            <ShieldCheck size={15} aria-hidden="true" />
            {zh ? "您的祝福不会公开显示给其他粉丝" : "Lời chúc của bạn sẽ không hiển thị cho fan khác"}
          </p>
        </motion.header>

        <div className="mx-auto mt-12 grid max-w-5xl gap-9 lg:grid-cols-[minmax(0,1.03fr)_minmax(0,.97fr)] lg:items-center">
          <div className="sealed-mail-composer relative min-w-0">
            <AnimatePresence mode="wait" initial={false}>
              {sent ? (
                <motion.div key="sealed" initial={{ opacity: 0, scale: .9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: reduceMotion ? 0 : .65 }} className="flex min-h-[390px] flex-col items-center justify-center text-center">
                  <motion.div initial={reduceMotion ? false : { rotateX: -70, scale: .7 }} animate={{ rotateX: 0, scale: 1 }} transition={{ duration: reduceMotion ? 0 : .85, type: "spring", bounce: .18 }} className="sealed-mail-envelope">
                    <MailCheck size={54} strokeWidth={1.3} aria-hidden="true" />
                    <span className="sealed-mail-envelope__wax">✦</span>
                  </motion.div>
                  <h3 className={"mt-9 text-3xl font-semibold text-[#80552c] " + (zh ? "font-chinese" : "font-vietnamese")}>
                    {zh ? "祝福已寄出并封好 ♡" : "Lời chúc đã được niêm phong ♡"}
                  </h3>
                  <p className="mt-4 max-w-sm text-sm leading-8 text-[#705740]">
                    {zh ? "您的心意已经成功保存到秘密信箱。只有经过授权的收件人能拆开阅读，其他粉丝看不到。" : "Lời chúc đã được lưu trong hộp thư bí mật. Chỉ người nhận được cấp quyền mới mở đọc; fan khác sẽ không nhìn thấy."}
                  </p>
                  <button type="button" onClick={() => { setSent(false); setName(""); setError(""); }} className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#946737] px-7 py-3 text-sm font-bold text-white transition hover:bg-[#79532a]">
                    <PenLine size={17} aria-hidden="true" /> {zh ? "再送上一份祝福" : "Gửi thêm một lời chúc"}
                  </button>
                </motion.div>
              ) : (
                <motion.div key="composer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduceMotion ? 0 : .3 }}>
                  <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[.19em] text-[#9e683b]">
                    <PenLine size={18} aria-hidden="true" /> WRITE FROM THE HEART
                  </div>
                  <h3 className={"mt-4 text-2xl font-semibold text-[#70502d] " + (zh ? "font-chinese" : "font-vietnamese")}>
                    {zh ? "给郑老师留下祝福" : "Gửi lời chúc đến Trịnh lão sư"}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[#78604b]">
                    {zh ? "只需写下名字和祝福。寄出之后，它就会化作一封属于郑老师的小信。" : "Chỉ cần để lại tên và lời chúc. Sau khi gửi, những lời thương sẽ thành một phong thư nhỏ dành riêng cho thầy."}
                  </p>
                  <form onSubmit={submit} className="mt-6">
                    <label htmlFor="private-wish-name" className="block text-xs font-bold text-[#765538]">{zh ? "您的名字 / 昵称" : "Tên hoặc biệt danh của bạn"}</label>
                    <input
                      id="private-wish-name"
                      value={name}
                      onChange={event => setName(limitText(event.target.value, 40))}
                      maxLength={80}
                      placeholder={zh ? "例如：小雨" : "Ví dụ: Tiểu Vũ"}
                      className="mt-2 w-full rounded-xl border border-[#d4b58b] bg-[#fffdf7] px-4 py-3 text-base text-[#694d32] outline-none placeholder:text-[#a4917b] focus:border-[#bb8b53] focus:ring-2 focus:ring-[#cbac76]/25"
                    />
                    <label htmlFor="private-wish-message" className="mt-5 block text-xs font-bold text-[#765538]">{zh ? "给老师的生日祝福" : "Lời chúc muốn gửi đến thầy"}</label>
                    <textarea
                      id="private-wish-message"
                      required
                      value={wish}
                      onChange={event => setWish(limitText(event.target.value, maxLength))}
                      rows={7}
                      placeholder={zh ? "亲爱的郑老师，生日快乐！愿您……" : "Trịnh lão sư thân mến, chúc thầy..."}
                      className="sealed-mail-textarea mt-2 w-full resize-y rounded-xl border border-[#d4b58b] bg-[#fffdf7] px-4 py-4 text-sm leading-8 text-[#694d32] outline-none placeholder:text-[#a4917b] focus:border-[#bb8b53] focus:ring-2 focus:ring-[#cbac76]/25"
                      aria-describedby="private-wish-count"
                    />
                    <p id="private-wish-count" className="mt-1 text-right text-xs tabular-nums text-[#876f54]">{Array.from(wish).length}/{maxLength}</p>
                    {!privateLettersConfigured && (
                      <p role="status" className="mt-4 rounded-xl border border-[#d4a270] bg-[#fff2d8] px-4 py-3 text-sm leading-7 text-[#855633]">
                        {zh ? "⚠ 网站尚未连接 Firebase，暂时无法真正寄出祝福。" : "⚠ Website chưa kết nối Firebase nên hiện chưa gửi thư thật được."}
                      </p>
                    )}
                    {error && <p role="alert" className="mt-3 text-sm text-[#9f392d]">{error}</p>}
                    <button type="submit" disabled={!privateLettersConfigured || !wish.trim() || sending} className="sealed-mail-submit mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-45">
                      {sending ? <RefreshCw size={17} className="animate-spin" aria-hidden="true" /> : <Send size={17} aria-hidden="true" />}
                      {sending ? (zh ? "正在寄出祝福..." : "Đang gửi lời chúc...") : (zh ? "寄出并封好祝福" : "Gửi và niêm phong lời chúc")}
                      <Sparkles size={16} aria-hidden="true" />
                    </button>
                    <p className="mt-4 text-center text-xs leading-6 text-[#8b735a]">{zh ? "请勿填写电话号码或住址等私人信息。" : "Không ghi số điện thoại, địa chỉ hay thông tin nhạy cảm nha."}</p>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="min-w-0 text-center">
            <div className="sealed-mail-vault">
              <div className="flex items-center justify-center gap-2 text-[#f2d6a2]">
                <Mail size={21} aria-hidden="true" />
                <span className="text-xs font-black uppercase tracking-[.16em]">SEALED WITH LOVE</span>
              </div>
              <h3 className={"mt-4 text-[clamp(1.6rem,3vw,2.1rem)] font-semibold text-[#fff0da] " + (zh ? "font-chinese" : "font-vietnamese")}>
                {zh ? "一封封来自大家的心意" : "Những lời thương được cất giữ"}
              </h3>
              <div className="sealed-mail-vault__preview" aria-hidden="true">
                {Array.from({ length: 7 }, (_, index) => (
                  <div className="sealed-mail-mini" key={index}><Mail size={29} strokeWidth={1.2} /><span className="sealed-mail-mini__wax">✦</span></div>
                ))}
              </div>
              <p className="mx-auto max-w-sm text-sm leading-8 text-[#e7d9c9]">
                {zh ? "每一份祝福都将化作一封密封的小信，藏在上方的主信件里，只留给郑老师拆阅。" : "Mỗi lời chúc sẽ hóa thành một phong thư nhỏ, cất bên trong bức thư lớn phía trên, chờ Trịnh lão sư mở đọc."}
              </p>
              <p className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-[#f6deb0]"><ShieldCheck size={16} aria-hidden="true" /> {zh ? "不公开展示留言" : "Không công khai lời chúc"}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
