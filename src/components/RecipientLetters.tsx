import { useState, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Eye, EyeOff, Heart, LockKeyhole, Mail, MailOpen, RefreshCw, ShieldCheck, Sparkles } from "lucide-react";
import {
  getRecipientLetters, privateLettersConfigured, signInLetterRecipient,
  type FirebaseSession, type PrivateFanLetter,
} from "../services/privateLetters";
import type { Locale } from "../types";

function issueMessage(error: unknown, zh: boolean) {
  const code = error instanceof Error ? error.message : "";
  if (code === "firebase-not-configured") return zh ? "Firebase 尚未配置。" : "Firebase chưa được kết nối.";
  if (code === "permission-denied") return zh
    ? "尚未取得读取权限。请检查收件人的 Firebase UID 和安全规则。"
    : "Tài khoản này chưa được phép đọc thư. Hãy kiểm tra UID và Firebase Rules.";
  return zh ? "无法验证账户或加载信件，请检查信息后重试。" : "Chưa đăng nhập hoặc tải thư được. Hãy kiểm tra tài khoản và thử lại nhé.";
}

/** Only mounted after the main birthday letter has been unlocked. */
export default function RecipientLetters({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  const reduceMotion = useReducedMotion();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [session, setSession] = useState<FirebaseSession | null>(null);
  const [letters, setLetters] = useState<PrivateFanLetter[]>([]);
  const [openedId, setOpenedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const login = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!privateLettersConfigured || busy) return;
    setBusy(true);
    setError("");
    try {
      const recipient = await signInLetterRecipient(email, password);
      const wishes = await getRecipientLetters(recipient);
      setSession(recipient);
      setLetters(wishes);
      setPassword("");
    } catch (cause) {
      setSession(null);
      setLetters([]);
      setError(issueMessage(cause, zh));
    } finally {
      setBusy(false);
    }
  };

  const refresh = async () => {
    if (!session || busy) return;
    setBusy(true);
    setError("");
    try {
      setLetters(await getRecipientLetters(session));
    } catch (cause) {
      setError(issueMessage(cause, zh));
      setSession(null);
      setLetters([]);
      setOpenedId(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="letter-inset" aria-labelledby="inner-envelopes-title">
      <div className="letter-inset__separator" aria-hidden="true">✦ &nbsp; ✧ &nbsp; ♡ &nbsp; ✧ &nbsp; ✦</div>
      <div className="mx-auto max-w-xl text-center">
        <p className="text-xs font-bold uppercase tracking-[.19em] text-[#aa7d4b]">LETTERS FROM EVERY HEART</p>
        <h4 id="inner-envelopes-title" className={"mt-3 text-2xl font-bold leading-snug text-[#825732] sm:text-3xl " + (zh ? "font-chinese" : "font-vietnamese")}>
          {zh ? "还有一些写给您的小小来信" : "Còn những phong thư nhỏ gửi riêng thầy"}
        </h4>
        <p className="mt-3 text-sm leading-8 text-[#786149]">
          {zh ? "每个名字背后，都是一份藏在信中的祝福。轻点信封，就能读一读。" : "Mỗi cái tên là một lời thương được cất trong phong bì. Chạm vào từng lá thư nhỏ để mở đọc nhé."}
        </p>
      </div>

      {!session ? (
        <div className="letter-inset__auth mx-auto mt-7 max-w-xl">
          <div className="letter-inset__preview" aria-hidden="true">
            {[0, 1, 2, 3, 4].map(index => <span className="letter-inset__mini-envelope" key={index}><Mail size={25} /><i>✦</i></span>)}
          </div>
          <div className="mt-5 flex items-center justify-center gap-2 text-xs font-bold text-[#895b35]">
            <ShieldCheck size={16} aria-hidden="true" /> {zh ? "只允许收件人查看" : "Chỉ người nhận được cấp quyền mới đọc được"}
          </div>
          <p className="mt-3 text-center text-sm leading-7 text-[#71553b]">
            {zh ? "主信封已经打开。为了保护粉丝的私密留言，请收件人验证 Firebase 账户一次。" : "Thư lớn đã mở rồi. Để bảo vệ lời chúc riêng tư của các fan, thầy cần xác thực tài khoản Firebase người nhận một lần."}
          </p>
          {!privateLettersConfigured ? (
            <p className="mt-4 rounded-xl border border-[#d6b78a] bg-[#fff2d9] p-4 text-center text-sm leading-7 text-[#845b34]" role="status">
              {zh ? "网站尚未连接 Firebase，暂时不能读取小信封。" : "Website chưa nối Firebase nên hiện chưa tải được những lá thư nhỏ."}
            </p>
          ) : (
            <form onSubmit={login} className="mx-auto mt-5 max-w-sm">
              <label htmlFor="inset-recipient-email" className="block text-xs font-bold text-[#795437]">{zh ? "收件人邮箱" : "Email của người nhận"}</label>
              <input id="inset-recipient-email" type="email" required autoComplete="username" value={email} onChange={event => setEmail(event.target.value)} className="mt-2 w-full rounded-xl border border-[#d2ad81] bg-white/80 px-4 py-3 text-base text-[#644a33] outline-none focus:ring-2 focus:ring-[#caa574]" placeholder="name@example.com" />
              <label htmlFor="inset-recipient-password" className="mt-4 block text-xs font-bold text-[#795437]">{zh ? "Firebase 账户密码" : "Mật khẩu tài khoản Firebase"}</label>
              <div className="mt-2 flex items-center gap-2 rounded-xl border border-[#d2ad81] bg-white/80 px-3 focus-within:ring-2 focus-within:ring-[#caa574]">
                <input id="inset-recipient-password" type={showPassword ? "text" : "password"} required autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} className="min-w-0 flex-1 bg-transparent py-3 text-base text-[#644a33] outline-none" />
                <button type="button" onClick={() => setShowPassword(value => !value)} className="grid h-10 w-10 place-items-center rounded-full text-[#895f38] hover:bg-[#efddc4]" aria-label={showPassword ? (zh ? "隐藏密码" : "Ẩn mật khẩu") : (zh ? "显示密码" : "Hiện mật khẩu")}>{showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}</button>
              </div>
              {error && <p role="alert" className="mt-3 text-sm text-[#a14236]">{error}</p>}
              <button type="submit" disabled={busy} className="letter-inset__auth-submit mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold disabled:opacity-60">
                <LockKeyhole size={17} aria-hidden="true" />
                {busy ? (zh ? "正在开启小信箱..." : "Đang mở những lá thư nhỏ...") : (zh ? "查看属于您的来信" : "Xem những lá thư gửi thầy")}
              </button>
            </form>
          )}
        </div>
      ) : (
        <div className="mt-8">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 text-xs text-[#8b6442]">
            <span className="font-bold">{zh ? "收到的来信" : "Những lá thư đã nhận"} · {letters.length}</span>
            <button type="button" onClick={() => { void refresh(); }} disabled={busy} className="flex min-h-10 items-center gap-2 rounded-full border border-[#d9b88e] bg-white/40 px-3 py-2 font-semibold hover:bg-white/70">
              <RefreshCw size={15} aria-hidden="true" /> {zh ? "刷新" : "Tải thư mới"}
            </button>
          </div>
          {error && <p className="mb-4 text-sm text-[#a14236]" role="alert">{error}</p>}
          {letters.length === 0 ? (
            <p className="rounded-xl border border-dashed border-[#d2aa7d] p-7 text-center text-sm leading-8 text-[#806043]">
              {zh ? "还没有收到新的祝福。第一颗小星星正在路上♡" : "Chưa có lời chúc nào được gửi đến. Ngôi sao đầu tiên đang trên đường tới đây ♡"}
            </p>
          ) : (
            <div className="letter-inset__grid">
              {letters.map((entry, index) => (
                <motion.article key={entry.id} initial={reduceMotion ? false : { opacity: 0, y: 13 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduceMotion ? 0 : .35, delay: Math.min(index * .04, .28) }} className="letter-inset__card">
                  <button
                    type="button"
                    className="letter-inset__card-button"
                    onClick={() => setOpenedId(current => current === entry.id ? null : entry.id)}
                    aria-expanded={openedId === entry.id}
                  >
                    <span className="letter-inset__card-icon"><Mail size={27} aria-hidden="true" /><span>✦</span></span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-[#80562f]">{entry.name || (zh ? "一位粉丝" : "Một người yêu mến thầy")}</span>
                      <span className="mt-1 block text-[11px] text-[#a08060]">{new Date(entry.createdAt).toLocaleDateString(zh ? "zh-CN" : "vi-VN")}</span>
                    </span>
                    <span className="text-[11px] font-bold text-[#ab7946]">{openedId === entry.id ? (zh ? "合上" : "Gấp") : (zh ? "拆封" : "Mở")}</span>
                  </button>
                  <AnimatePresence initial={false}>
                    {openedId === entry.id && (
                      <motion.div key="opened-note" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: reduceMotion ? 0 : .32 }} className="overflow-hidden">
                        <div className="letter-inset__note">
                          <MailOpen size={22} className="mx-auto mb-3 text-[#bc8a51]" aria-hidden="true" />
                          <p className="whitespace-pre-wrap break-words text-sm leading-8 text-[#674e37]">{entry.message}</p>
                          <p className="mt-4 text-right text-xs font-bold text-[#966b42]">— {entry.name || (zh ? "一位粉丝" : "Một người yêu mến thầy")} <Heart size={12} className="inline-block" aria-hidden="true" /></p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.article>
              ))}
            </div>
          )}
          <button type="button" onClick={() => { setSession(null); setLetters([]); setOpenedId(null); setEmail(""); setPassword(""); }} className="mx-auto mt-7 flex min-h-10 items-center gap-2 text-xs font-bold text-[#94704c] underline underline-offset-4">
            <LockKeyhole size={14} aria-hidden="true" /> {zh ? "重新封好所有信笺" : "Niêm phong lại những lá thư nhỏ"}
          </button>
        </div>
      )}
      <div className="letter-inset__separator letter-inset__separator--bottom" aria-hidden="true"><Sparkles size={18} className="mx-auto" /></div>
    </section>
  );
}
