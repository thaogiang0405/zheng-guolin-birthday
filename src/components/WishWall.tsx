import { useEffect, useMemo, useState, type FormEvent } from "react";
import { BookHeart, Check, Heart, LockKeyhole, Mail, MailCheck, PenLine, RefreshCw, Send, ShieldCheck, Sparkles, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { StardustField } from "./StardustField";
import {
  getRecipientLetters, privateLettersConfigured, sendPrivateFanLetter, signInLetterRecipient,
  type FanLetterKind, type FirebaseSession, type PrivateFanLetter,
} from "../services/privateLetters";
import type { Locale } from "../types";

export interface WishWallProps {
  locale: Locale;
  maxLength: number;
  recipientUnlocked?: boolean;
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

function cutUnicode(text: string, count: number) {
  return Array.from(text).slice(0, count).join("");
}

function explainError(error: unknown, zh: boolean): string {
  const code = error instanceof Error ? error.message : "unknown";
  if (code === "firebase-not-configured") return zh
    ? "网站管理员还没有连接 Firebase，暂时不能寄出。"
    : "Chủ trang chưa kết nối Firebase nên hiện chưa thể gửi thư.";
  if (code === "permission-denied") return zh
    ? "权限不足。请确认 Firebase 安全规则和收件人账户。"
    : "Firebase từ chối truy cập. Cần kiểm tra quyền và tài khoản người nhận.";
  if (code === "rate-limited") return zh
    ? "发送太频繁了，请稍后重试。" : "Có quá nhiều yêu cầu, ní thử lại sau nha.";
  return zh
    ? "暂时无法连接 Firebase。信还没有寄出，请重试。"
    : "Chưa kết nối được Firebase. Thư chưa gửi đi, ní thử lại nhé.";
}

export default function WishWall({ locale, maxLength, labels, recipientUnlocked = false }: WishWallProps) {
  const zh = locale === "zh";
  const reduceMotion = useReducedMotion();
  const [kind, setKind] = useState<FanLetterKind>("letter");
  const [senderName, setSenderName] = useState("");
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [session, setSession] = useState<FirebaseSession | null>(null);
  const [letters, setLetters] = useState<PrivateFanLetter[]>([]);
  const [opening, setOpening] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const maxChars = kind === "letter" ? 1500 : maxLength;

  useEffect(() => {
    if (recipientUnlocked) return;
    // Closing the master letter ends the local reading session.
    setSession(null);
    setLetters([]);
    setLoginPassword("");
    setLoginError("");
    setOpening(null);
  }, [recipientUnlocked]);

  const total = useMemo(() => ({
    letter: letters.filter(item => item.kind === "letter").length,
    wish: letters.filter(item => item.kind === "wish").length,
  }), [letters]);

  const sendLetter = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.trim() || submitting || !privateLettersConfigured) return;
    setSubmitting(true);
    setSendError("");
    try {
      await sendPrivateFanLetter({ kind, name: senderName, message: draft });
      setSent(true);
      setDraft("");
    } catch (error) {
      setSendError(explainError(error, zh));
    } finally {
      setSubmitting(false);
    }
  };

  const login = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!recipientUnlocked || !privateLettersConfigured || loginBusy) return;
    setLoginBusy(true);
    setLoginError("");
    try {
      const user = await signInLetterRecipient(loginEmail, loginPassword);
      // Only an approved Firebase UID may query fanLetters (see firestore.rules).
      const messages = await getRecipientLetters(user);
      setSession(user);
      setLetters(messages);
      setLoginPassword("");
    } catch (error) {
      setSession(null);
      setLetters([]);
      setLoginError(explainError(error, zh));
    } finally {
      setLoginBusy(false);
    }
  };

  const refresh = async () => {
    if (!session || refreshing) return;
    setRefreshing(true);
    setLoginError("");
    try {
      setLetters(await getRecipientLetters(session));
    } catch (error) {
      setLoginError(explainError(error, zh));
      setSession(null);
      setLetters([]);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <section id="wishes" className="sealed-mail-section section-shell relative isolate overflow-hidden" lang={zh ? "zh-Hans" : "vi"} aria-labelledby="wish-wall-title">
      <StardustField variant="hero" />
      <div className="relative z-10 mx-auto max-w-6xl">
        <header className="mx-auto max-w-3xl text-center">
          <p className="mb-4 inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[.2em] text-[#f2d39b]">
            <Sparkles size={17} aria-hidden="true" /> {labels.eyebrow} <Sparkles size={17} aria-hidden="true" />
          </p>
          <h2 id="wish-wall-title" className={"text-[clamp(2.5rem,5.5vw,4.7rem)] font-semibold leading-[1.16] text-[#fff0d5] " + (zh ? "font-chinese" : "font-vietnamese")}>{labels.title}</h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#eadfd2]">{labels.body}</p>
          <p className="mx-auto mt-6 inline-flex items-center justify-center gap-2 rounded-full border border-[#e5c289]/30 bg-white/5 px-4 py-2 text-xs leading-6 text-[#f5dca9]">
            <ShieldCheck size={15} aria-hidden="true" />
            {zh ? "私密来信：粉丝之间无法互相阅读" : "Thư riêng tư: các fan không thể đọc thư của nhau"}
          </p>
        </header>

        <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
          <div className="sealed-mail-composer relative min-w-0">
            <AnimatePresence mode="wait" initial={false}>
              {sent ? (
                <motion.div key="sealed" initial={{ opacity: 0, scale: .93, y: 25 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, y: -18 }} transition={{ duration: reduceMotion ? 0 : 0.7 }} className="flex min-h-[470px] flex-col items-center justify-center text-center">
                  <motion.div initial={reduceMotion ? false : { rotateX: -80, scale: .65 }} animate={{ rotateX: 0, scale: 1 }} transition={{ duration: reduceMotion ? 0 : .85, type: "spring", bounce: .18 }} className="sealed-mail-envelope">
                    <MailCheck size={56} strokeWidth={1.3} aria-hidden="true" />
                    <span className="sealed-mail-envelope__wax">✦</span>
                  </motion.div>
                  <h3 className={"mt-9 text-3xl font-semibold text-[#80552c] " + (zh ? "font-chinese" : "font-vietnamese")}>{zh ? "你的来信已被珍藏 ♡" : "Phong thư đã được niêm phong ♡"}</h3>
                  <p className="mt-4 max-w-sm text-sm leading-8 text-[#705740]">
                    {zh ? "这封信已成功寄出并封好。只有获得授权的收件人才能拆阅，其他粉丝看不到内容。" : "Thư đã gửi thành công và được cất kín. Chỉ tài khoản người nhận được cấp quyền mới đọc được; fan khác không xem được nội dung."}
                  </p>
                  <button type="button" onClick={() => { setSent(false); setSenderName(""); setSendError(""); }} className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#946737] px-7 py-3 text-sm font-bold text-white transition hover:bg-[#79532a]">
                    <PenLine size={17} aria-hidden="true" /> {zh ? "再写一封信" : "Viết thêm một lá thư"}
                  </button>
                </motion.div>
              ) : (
                <motion.div key="composer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduceMotion ? 0 : .3 }}>
                  <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[.20em] text-[#9e683b]"><PenLine size={19} aria-hidden="true" /> WRITE FROM THE HEART</div>
                  <h3 className={"mt-4 text-2xl font-semibold text-[#70502d] " + (zh ? "font-chinese" : "font-vietnamese")}>{zh ? "给郑老师写一封小小的信" : "Gửi một lá thư đến Trịnh lão sư"}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#78604b]">{zh ? "写完后，信纸会收起，封成一封只为老师准备的信。" : "Sau khi gửi thành công, lá thư sẽ tự gấp lại và niêm phong, chỉ dành cho thầy đọc."}</p>
                  <form onSubmit={sendLetter}>
                    <div role="group" aria-label={zh ? "留言类型" : "Loại lời nhắn"} className="mt-6 grid grid-cols-2 gap-2 rounded-xl bg-[#ecd7b9] p-1.5">
                      <button type="button" onClick={() => { setKind("letter"); setDraft(""); }} aria-pressed={kind === "letter"} className={"flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-bold " + (kind === "letter" ? "bg-white text-[#81562d] shadow" : "text-[#765f4a] hover:bg-white/50")}>
                        <Mail size={16} aria-hidden="true" /> {zh ? "写信" : "Viết lá thư"}
                      </button>
                      <button type="button" onClick={() => { setKind("wish"); setDraft(""); }} aria-pressed={kind === "wish"} className={"flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-bold " + (kind === "wish" ? "bg-white text-[#81562d] shadow" : "text-[#765f4a] hover:bg-white/50")}>
                        <Heart size={16} aria-hidden="true" /> {zh ? "生日祝福" : "Lời chúc"}
                      </button>
                    </div>
                    <label htmlFor="private-fan-name" className="mt-6 block text-xs font-bold text-[#765538]">{zh ? "署名（可选）" : "Tên người gửi (không bắt buộc)"}</label>
                    <input id="private-fan-name" value={senderName} onChange={event => setSenderName(cutUnicode(event.target.value, 40))} maxLength={80} placeholder={zh ? "一直支持您的粉丝" : "Một người luôn yêu mến thầy"} className="mt-2 w-full rounded-xl border border-[#d4b58b] bg-[#fffdf7] px-4 py-3 text-sm text-[#694d32] outline-none focus:border-[#bb8b53] focus:ring-2 focus:ring-[#cbac76]/25" />
                    <label htmlFor="private-fan-message" className="mt-5 block text-xs font-bold text-[#765538]">{zh ? "心里想说的话" : "Điều muốn gửi đến thầy"}</label>
                    <textarea id="private-fan-message" value={draft} onChange={event => setDraft(cutUnicode(event.target.value, maxChars))} rows={kind === "letter" ? 8 : 5} placeholder={kind === "letter" ? (zh ? "亲爱的郑老师：……" : "Gửi Trịnh lão sư thương mến, ...") : (zh ? "郑老师，生日快乐！……" : "Trịnh lão sư, chúc thầy ...")} className="sealed-mail-textarea mt-2 w-full resize-y rounded-xl border border-[#d4b58b] bg-[#fffdf7] px-4 py-4 text-sm leading-8 text-[#694d32] outline-none focus:border-[#bb8b53] focus:ring-2 focus:ring-[#cbac76]/25" aria-describedby="private-fan-count" />
                    <p id="private-fan-count" className="mt-1 text-right text-xs tabular-nums text-[#876f54]">{Array.from(draft).length}/{maxChars}</p>
                    {!privateLettersConfigured && (
                      <p className="mt-4 rounded-xl border border-[#d4a270] bg-[#fff2d8] px-4 py-3 text-sm leading-7 text-[#855633]" role="status">
                        {zh ? "⚠ Firebase 尚未连接，发送暂时不可用。网站管理员需要先完成设置。" : "⚠ Firebase chưa được nối vào website. Chưa thể gửi thư thật cho đến khi chủ trang hoàn tất thiết lập."}
                      </p>
                    )}
                    {sendError && <p className="mt-3 text-sm leading-7 text-[#9f392d]" role="alert">{sendError}</p>}
                    <button type="submit" disabled={!privateLettersConfigured || !draft.trim() || submitting} className="sealed-mail-submit mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-45">
                      {submitting ? <RefreshCw size={17} className="animate-spin" aria-hidden="true" /> : <Send size={17} aria-hidden="true" />}
                      {submitting ? (zh ? "正在封好信封..." : "Đang gấp và niêm phong thư...") : (zh ? "寄出并封好来信" : "Gửi và niêm phong lá thư")}
                      <Sparkles size={16} aria-hidden="true" />
                    </button>
                    <p className="mt-4 text-center text-xs leading-6 text-[#8b735a]">
                      {zh ? "请不要填写电话号码、住址等私人信息。" : "Đừng ghi số điện thoại, địa chỉ hay thông tin cá nhân nhạy cảm nhé."}
                    </p>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="min-w-0">
            <div className="sealed-mail-vault">
              <div className="flex items-center justify-center gap-2 text-[#f2d6a2]"><BookHeart size={21} aria-hidden="true" /><span className="text-xs font-black uppercase tracking-[.16em]">PRIVATE LETTER VAULT</span></div>
              <h3 className={"mt-4 text-center text-[clamp(1.5rem,3vw,2rem)] font-semibold text-[#fff0da] " + (zh ? "font-chinese" : "font-vietnamese")}>{zh ? "只属于郑老师的秘密信箱" : "Hộp thư bí mật dành riêng cho thầy"}</h3>
              <div className="sealed-mail-vault__preview" aria-hidden="true">
                {Array.from({ length: 7 }, (_, index) => (
                  <div className="sealed-mail-mini" key={index}><Mail size={29} strokeWidth={1.2} /><span className="sealed-mail-mini__wax">✦</span></div>
                ))}
              </div>
              {!recipientUnlocked ? (
                <div className="mt-5 flex flex-col items-center gap-3 text-center">
                  <LockKeyhole size={25} className="text-[#f0d19b]" aria-hidden="true" />
                  <p className="max-w-sm text-sm leading-8 text-[#e8ded0]">{zh ? "每封信都已密封。请先开启上方的主信封，才能进入私人信箱。" : "Mỗi phong thư đều được niêm phong. Hãy mở khóa lá thư chính ở phía trên để vào hộp thư riêng."}</p>
                  <a href="#letter" className="mt-2 inline-flex min-h-11 items-center gap-2 rounded-full border border-[#e8c78e]/50 px-6 py-3 text-sm font-bold text-[#f2d6a2] hover:bg-white/10">
                    <LockKeyhole size={16} aria-hidden="true" /> {zh ? "先开启主信封" : "Mở khóa phong thư chính"}
                  </a>
                </div>
              ) : !session ? (
                <div className="mt-5">
                  <p className="text-center text-sm leading-8 text-[#ece0cd]">{zh ? "主信封已开启。为保护所有粉丝的私信，请收件人验证 Firebase 专属账户。" : "Phong thư chính đã mở. Để bảo vệ thư của tất cả fan, người nhận cần đăng nhập tài khoản Firebase được cấp quyền đọc."}</p>
                  <form onSubmit={login} className="mx-auto mt-6 max-w-sm">
                    <label htmlFor="recipient-email" className="block text-xs font-semibold text-[#f4d9ae]">{zh ? "收件人邮箱" : "Email người nhận"}</label>
                    <input id="recipient-email" type="email" required autoComplete="username" value={loginEmail} onChange={event => setLoginEmail(event.target.value)} className="mt-2 w-full rounded-xl border border-[#f1d09b]/40 bg-[#15192a] px-4 py-3 text-base text-white outline-none focus:ring-2 focus:ring-[#efd49d]" placeholder="name@example.com" />
                    <label htmlFor="recipient-password" className="mt-4 block text-xs font-semibold text-[#f4d9ae]">{zh ? "账户密码" : "Mật khẩu tài khoản Firebase"}</label>
                    <input id="recipient-password" type="password" required autoComplete="current-password" value={loginPassword} onChange={event => setLoginPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-[#f1d09b]/40 bg-[#15192a] px-4 py-3 text-base text-white outline-none focus:ring-2 focus:ring-[#efd49d]" placeholder="••••••••" />
                    {loginError && <p className="mt-3 text-sm leading-6 text-[#ffd2ae]" role="alert">{loginError}</p>}
                    {!privateLettersConfigured && <p className="mt-4 text-sm leading-7 text-[#ffd2ae]">{zh ? "Firebase 尚未连接，无法读取。" : "Firebase chưa kết nối nên không thể đăng nhập đọc thư."}</p>}
                    <button type="submit" disabled={!privateLettersConfigured || loginBusy} className="sealed-mail-login mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-bold disabled:opacity-50">
                      <LockKeyhole size={16} aria-hidden="true" /> {loginBusy ? (zh ? "正在验证..." : "Đang xác thực...") : (zh ? "进入私人信箱" : "Vào hộp thư bí mật")}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="mt-7">
                  <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-[#f5dcaf]">
                    <span>{zh ? "已解锁的信笺" : "Những lá thư đã được mở khóa"} · {letters.length}</span>
                    <button type="button" onClick={() => { void refresh(); }} disabled={refreshing} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#f0d8af]/30 px-3 py-2 text-xs font-bold hover:bg-white/10 disabled:opacity-60">
                      <RefreshCw size={15} aria-hidden="true" /> {zh ? "刷新" : "Tải thư mới"}
                    </button>
                  </div>
                  {loginError && <p className="mt-3 text-sm text-[#ffdab8]">{loginError}</p>}
                  {letters.length === 0 && <p className="mt-5 rounded-xl border border-dashed border-[#e3c28b]/35 p-5 text-center text-sm leading-7 text-[#e9d9bf]">{zh ? "还没有收到新信。第一封来信正在路上 ♡" : "Chưa có thư nào được gửi đến. Những lời thương đầu tiên sẽ xuất hiện ở đây ♡"}</p>}
                  <div className="mt-5 grid gap-3">
                    {letters.map(entry => (
                      <article key={entry.id} className="sealed-mail-reader">
                        <button type="button" onClick={() => setOpening(id => id === entry.id ? null : entry.id)} aria-expanded={opening === entry.id} className="flex min-h-16 w-full items-center gap-3 text-left">
                          <span className="sealed-mail-reader__icon"><Mail size={23} aria-hidden="true" /></span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-bold text-[#73512d]">{entry.kind === "letter" ? (zh ? "一封来信" : "Một lá thư") : (zh ? "生日祝福" : "Lời chúc sinh nhật")}</span>
                            <span className="mt-1 block truncate text-xs text-[#947450]">{entry.name || (zh ? "一位粉丝" : "Một người yêu mến thầy")} · {new Date(entry.createdAt).toLocaleDateString(zh ? "zh-CN" : "vi-VN")}</span>
                          </span>
                          <span className="text-xs font-bold text-[#9b693a]">{opening === entry.id ? (zh ? "合上" : "Gấp lại") : (zh ? "拆封" : "Mở thư")}</span>
                        </button>
                        <AnimatePresence>
                          {opening === entry.id && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                              <div className="border-t border-[#e2caa5] pb-4 pt-4">
                                <p className="whitespace-pre-wrap break-words text-sm leading-8 text-[#634b36]">{entry.message}</p>
                                <p className="mt-4 text-right text-xs font-bold text-[#9d724b]">— {entry.name || (zh ? "一位粉丝" : "Một người yêu mến thầy")} ♡</p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </article>
                    ))}
                  </div>
                  <button type="button" onClick={() => { setSession(null); setLetters([]); setOpening(null); setLoginPassword(""); }} className="mt-5 flex min-h-10 items-center gap-2 text-xs text-[#f5d9a7] underline underline-offset-4">
                    <X size={15} aria-hidden="true" /> {zh ? "退出私人信箱" : "Đăng xuất hộp thư"}
                  </button>
                </div>
              )}
            </div>
            <p className="mt-5 text-center text-xs leading-7 text-[#d9cbb8]">
              {zh ? "私密来信只存储在 Firebase 中，不会发布到 GitHub 或公开祝福墙。" : "Nội dung thư chỉ lưu trong Firebase, không công khai lên GitHub hay bảng lời chúc."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
