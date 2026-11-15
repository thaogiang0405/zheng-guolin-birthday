import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Heart, LockKeyhole, Mail, MailOpen, RefreshCw, Sparkles } from "lucide-react";
import {
  getRecipientLetters, privateReaderConfigured, type PrivateFanLetter,
} from "../services/privateLetters";
import type { Locale } from "../types";

function readerError(error: unknown, zh: boolean) {
  const code = error instanceof Error ? error.message : "";
  if (code === "private-reader-not-configured") {
    return zh ? "寄信系统还在连接，暂时无法读取这些小信件。" : "Hệ thống đọc thư chưa kết nối xong, chưa thể tải các lá thư nhỏ.";
  }
  if (code === "permission-denied") {
    return zh ? "无法验证打开信封的口令。" : "Chưa xác thực được mã mở thư.";
  }
  return zh ? "暂时无法获取来信，请稍后再试。" : "Chưa tải được những lá thư, thử lại sau nhé.";
}

/** Rendered only inside the big parchment AFTER the visitor enters the letter code. */
export default function RecipientLetters({ locale, passcode }: { locale: Locale; passcode: string }) {
  const zh = locale === "zh";
  const reduceMotion = useReducedMotion();
  const [letters, setLetters] = useState<PrivateFanLetter[]>([]);
  const [openedId, setOpenedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    if (!privateReaderConfigured) {
      setError(readerError(new Error("private-reader-not-configured"), zh));
      return;
    }
    setLoading(true);
    setError("");
    getRecipientLetters(passcode)
      .then(items => { if (alive) setLetters(items); })
      .catch(cause => { if (alive) setError(readerError(cause, zh)); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [passcode, zh]);

  const refresh = async () => {
    if (!privateReaderConfigured || loading) return;
    setLoading(true);
    setError("");
    try {
      setLetters(await getRecipientLetters(passcode));
    } catch (cause) {
      setError(readerError(cause, zh));
    } finally {
      setLoading(false);
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

      <div className="mt-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 text-xs text-[#8b6442]">
          <span className="font-bold">{zh ? "来自大家的祝福" : "Những lời chúc được gửi đến"} · {letters.length}</span>
          {privateReaderConfigured && (
            <button type="button" onClick={() => { void refresh(); }} disabled={loading} className="flex min-h-10 items-center gap-2 rounded-full border border-[#d9b88e] bg-white/40 px-3 py-2 font-semibold hover:bg-white/70 disabled:opacity-50">
              <RefreshCw size={15} aria-hidden="true" /> {zh ? "刷新" : "Tải thư mới"}
            </button>
          )}
        </div>
        {loading && <div className="letter-inset__auth text-center text-sm text-[#805d39]" role="status">{zh ? "正在寻找大家的小信封…" : "Đang tìm những phong thư nhỏ..."}</div>}
        {error && (
          <div className="letter-inset__auth mx-auto my-5 max-w-lg text-center">
            <div className="letter-inset__preview" aria-hidden="true">
              {[0, 1, 2, 3, 4].map(index => <span className="letter-inset__mini-envelope" key={index}><Mail size={25} /><i>✦</i></span>)}
            </div>
            <p className="mt-5 text-sm leading-8 text-[#78583a]" role="status">{error}</p>
            <p className="mt-2 flex items-center justify-center gap-2 text-xs font-semibold text-[#a1774a]">
              <LockKeyhole size={15} aria-hidden="true" />
              {zh ? "无需登录 Firebase" : "Không cần đăng nhập Firebase"}
            </p>
          </div>
        )}
        {!loading && !error && letters.length === 0 && (
          <p className="rounded-xl border border-dashed border-[#d2aa7d] p-7 text-center text-sm leading-8 text-[#806043]">
            {zh ? "还没有收到新的祝福。第一颗小星星正在路上♡" : "Chưa có lời chúc nào được gửi đến. Ngôi sao đầu tiên đang trên đường tới đây ♡"}
          </p>
        )}
        {!error && letters.length > 0 && (
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
      </div>
      <div className="letter-inset__separator letter-inset__separator--bottom" aria-hidden="true"><Sparkles size={18} className="mx-auto" /></div>
    </section>
  );
}
