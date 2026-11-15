import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { BookHeart, Check, Copy, ExternalLink, Heart, Mail, PenLine, RefreshCw, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { StardustField } from "./StardustField";
import type { Locale, Wish } from "../types";

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

type Kind = "letter" | "wish";
type Filter = "all" | Kind;
type FetchState = "loading" | "ready" | "error";
type FanPost = {
  id: number;
  kind: Kind;
  body: string;
  author: string;
  createdAt: string;
  url: string;
};

type GitHubComment = {
  id: number;
  body: string | null;
  created_at: string;
  html_url: string;
  user: { login: string } | null;
};

const ISSUE_URL = "https://github.com/thaogiang0405/zheng-guolin-birthday/issues/2";
const COMMENTS_URL = "https://api.github.com/repos/thaogiang0405/zheng-guolin-birthday/issues/2/comments?per_page=100";
const LEGACY_KEY = "zheng-guolin-birthday-wishes";

function parseComment(comment: GitHubComment): FanPost | null {
  if (typeof comment.body !== "string" || typeof comment.id !== "number") return null;
  const raw = comment.body.trim();
  const match = raw.match(/^\[(THU|LETTER|来信|CHUC|祝福)\]\s*/i);
  if (!match) return null;
  const kind: Kind = /^(THU|LETTER|来信)$/i.test(match[1]) ? "letter" : "wish";
  const body = raw.slice(match[0].length).trim().slice(0, 3500);
  if (!body) return null;
  return {
    id: comment.id,
    kind,
    body,
    author: comment.user?.login || "Fan",
    createdAt: comment.created_at,
    url: comment.html_url,
  };
}

function cutText(value: string, max: number) {
  return Array.from(value).slice(0, max).join("");
}

function archiveWish(value: unknown): value is Wish {
  if (!value || typeof value !== "object") return false;
  const item = value as Wish;
  return typeof item.id === "string" &&
    typeof item.message === "string" &&
    typeof item.createdAt === "number" &&
    Number.isFinite(item.createdAt);
}

export default function WishWall({ locale, maxLength, labels }: WishWallProps) {
  const zh = locale === "zh";
  const reduceMotion = useReducedMotion();
  const [posts, setPosts] = useState<FanPost[]>([]);
  const [fetchState, setFetchState] = useState<FetchState>("loading");
  const [reload, setReload] = useState(0);
  const [filter, setFilter] = useState<Filter>("all");
  const [expanded, setExpanded] = useState<number[]>([]);
  const [kind, setKind] = useState<Kind>("letter");
  const [name, setName] = useState("");
  const [draft, setDraft] = useState("");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");
  const [legacyWishes, setLegacyWishes] = useState<Wish[]>([]);
  const maxDraftLength = kind === "letter" ? 1500 : maxLength;

  useEffect(() => {
    const controller = new AbortController();
    setFetchState("loading");
    fetch(COMMENTS_URL, {
      method: "GET",
      headers: { Accept: "application/vnd.github+json" },
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Fan letters unavailable");
        const data: unknown = await response.json();
        if (!Array.isArray(data)) throw new Error("Unexpected fan letters response");
        return data as GitHubComment[];
      })
      .then((data) => {
        if (controller.signal.aborted) return;
        setPosts(data.map(parseComment).filter((post): post is FanPost => post !== null).reverse());
        setFetchState("ready");
      })
      .catch(() => {
        if (!controller.signal.aborted) setFetchState("error");
      });
    return () => controller.abort();
  }, [reload]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(LEGACY_KEY);
      if (!saved) return;
      const values: unknown = JSON.parse(saved);
      if (Array.isArray(values)) setLegacyWishes(values.filter(archiveWish).slice(0, 48));
    } catch {
      // Old device-only wishes are optional; never publish them without consent.
    }
  }, []);

  const shown = useMemo(() => posts.filter((post) => filter === "all" || filter === post.kind), [posts, filter]);
  const counts = useMemo(() => ({
    all: posts.length,
    letter: posts.filter(post => post.kind === "letter").length,
    wish: posts.filter(post => post.kind === "wish").length,
  }), [posts]);
  const dateFormatter = useMemo(() => new Intl.DateTimeFormat(zh ? "zh-CN" : "vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
  }), [zh]);

  const preparedText = (kind === "letter" ? "[THU]" : "[CHUC]") + "\n" +
    draft.trim() + (name.trim() ? "\n\n— " + name.trim() : "");

  const copyPreparedText = async (content = preparedText) => {
    if (!content.trim()) return;
    try {
      await navigator.clipboard.writeText(content);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
  };

  const toggleExpanded = (id: number) => {
    setExpanded(current => current.includes(id) ? current.filter(value => value !== id) : [...current, id]);
  };

  return (
    <section
      id="wishes"
      lang={zh ? "zh-Hans" : "vi"}
      aria-labelledby="wish-wall-title"
      className="fan-letters-section section-shell relative isolate overflow-hidden"
    >
      <StardustField variant="hero" />
      <div className="pointer-events-none absolute -left-28 top-[12%] h-96 w-96 rounded-full bg-[#cfa55e]/15 blur-[90px]" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-24 bottom-[15%] h-96 w-96 rounded-full bg-[#96a9da]/15 blur-[90px]" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <motion.header
          initial={{ opacity: 0, y: reduceMotion ? 0 : 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: reduceMotion ? 0 : 0.7 }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="mb-4 inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[.22em] text-[#f2d39b]">
            <Sparkles size={16} aria-hidden="true" /> {labels.eyebrow} <Sparkles size={16} aria-hidden="true" />
          </p>
          <h2 id="wish-wall-title" className={"text-[clamp(2.5rem,5vw,4.4rem)] font-semibold leading-[1.14] text-[#fff0d6] " + (zh ? "font-chinese" : "font-vietnamese")}>
            {labels.title}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#e8e1db]/85">{labels.body}</p>
          <div className="mx-auto mt-7 flex w-fit items-center gap-2 rounded-full border border-[#f2d39b]/25 bg-[#fbf1da]/10 px-5 py-2 text-xs tracking-[.07em] text-[#f6dfb8]">
            <Heart size={15} aria-hidden="true" />
            {zh ? "一封信是一颗星星，汇成送给郑老师的银河。" : "Mỗi lá thư là một vì sao, cùng tạo nên dải ngân hà dành cho thầy."}
          </div>
        </motion.header>

        <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,.87fr)_minmax(0,1.13fr)] lg:items-start">
          <div className="fan-letters-composer min-w-0">
            <div className="flex items-center gap-3 text-[#9c673c]">
              <PenLine size={20} aria-hidden="true" />
              <span className="text-xs font-black uppercase tracking-[.2em]">WRITE FROM YOUR HEART</span>
            </div>
            <h3 className={"mt-4 text-2xl font-semibold text-[#69462a] " + (zh ? "font-chinese" : "font-vietnamese")}>
              {zh ? "给郑老师留一份心意" : "Gửi lời thương đến Trịnh lão sư"}
            </h3>
            <p className="mt-3 text-sm leading-7 text-[#735b49]">
              {zh ? "可以写一封长信，也可以留下简短的生日祝福。" : "Bạn có thể viết một lá thư dài, hoặc một lời chúc sinh nhật ngắn gọn."}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-2 rounded-xl bg-[#ead5b6]/60 p-1.5" role="group" aria-label={zh ? "留言类型" : "Loại lời nhắn"}>
              <button type="button" onClick={() => { setKind("letter"); setDraft(""); setCopyStatus("idle"); }} aria-pressed={kind === "letter"} className={"flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-bold transition " + (kind === "letter" ? "bg-white text-[#76502d] shadow" : "text-[#715d49] hover:bg-white/55")}>
                <Mail size={16} aria-hidden="true" /> {zh ? "写一封信" : "Viết lá thư"}
              </button>
              <button type="button" onClick={() => { setKind("wish"); setDraft(""); setCopyStatus("idle"); }} aria-pressed={kind === "wish"} className={"flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-bold transition " + (kind === "wish" ? "bg-white text-[#76502d] shadow" : "text-[#715d49] hover:bg-white/55")}>
                <Heart size={16} aria-hidden="true" /> {zh ? "生日祝福" : "Lời chúc"}
              </button>
            </div>

            <label htmlFor="fan-letter-writer" className="mt-5 block text-xs font-bold text-[#77553b]">{zh ? "署名（可选）" : "Tên người gửi (không bắt buộc)"}</label>
            <input
              id="fan-letter-writer"
              value={name}
              onChange={event => { setName(cutText(event.target.value, 40)); setCopyStatus("idle"); }}
              maxLength={80}
              placeholder={zh ? "一位默默支持您的粉丝" : "Một người luôn yêu mến thầy"}
              className="mt-2 w-full rounded-xl border border-[#d5b88c] bg-[#fffdf6] px-4 py-3 text-sm text-[#61472e] outline-none placeholder:text-[#a18b70] focus:border-[#b8874b] focus:ring-2 focus:ring-[#c99b5d]/20"
            />
            <label htmlFor="fan-letter-draft" className="mt-5 block text-xs font-bold text-[#77553b]">{zh ? "想说的话" : "Điều bạn muốn nhắn gửi"}</label>
            <textarea
              id="fan-letter-draft"
              value={draft}
              onChange={event => { setDraft(cutText(event.target.value, maxDraftLength)); setCopyStatus("idle"); }}
              placeholder={kind === "letter" ? (zh ? "亲爱的郑老师，我想对您说……" : "Gửi Trịnh lão sư thương mến, ...") : (zh ? "郑老师，生日快乐！……" : "Trịnh lão sư, chúc thầy ...")}
              rows={kind === "letter" ? 9 : 5}
              className="fan-letters-textarea mt-2 w-full resize-y rounded-xl border border-[#d5b88c] bg-[#fffdf6] px-4 py-4 text-sm leading-8 text-[#61472e] outline-none placeholder:text-[#a18b70] focus:border-[#b8874b] focus:ring-2 focus:ring-[#c99b5d]/20"
              aria-describedby="fan-letter-count fan-letter-instructions"
            />
            <div className="mt-1 flex justify-end text-xs text-[#846e57]" id="fan-letter-count">
              {Array.from(draft).length}/{maxDraftLength}
            </div>

            <div id="fan-letter-instructions" className="mt-5 rounded-xl border border-[#e1c9a8] bg-[#f6ecd9] p-4 text-sm leading-7 text-[#66513b]">
              <p className="font-semibold">{zh ? "如何让郑老师与大家都能看到？" : "Làm sao để thầy và mọi người đều đọc được?"}</p>
              <p className="mt-1">{zh ? "先复制文字，然后在公开留言页粘贴并发布。需要登录 GitHub。" : "Sao chép lời nhắn, sau đó dán vào trang gửi thư công khai và đăng bình luận. Cần đăng nhập GitHub."}</p>
              <p className="mt-2 text-xs text-[#846e57]">{zh ? "公开留言会显示在本站；请勿填写私人联系方式。" : "Lời nhắn sau khi đăng sẽ hiển thị công khai trên website; đừng ghi thông tin liên hệ riêng tư."}</p>
            </div>
            <button
              type="button"
              disabled={!draft.trim()}
              onClick={() => { void copyPreparedText(); }}
              className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#93642f] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#704820] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#93642f] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {copyStatus === "copied" ? <Check size={17} aria-hidden="true" /> : <Copy size={17} aria-hidden="true" />}
              {copyStatus === "copied" ? (zh ? "已复制 · 下一步去发布" : "Đã sao chép · Tiếp theo là đăng thư") : (zh ? "① 复制我的留言" : "① Sao chép lời nhắn")}
            </button>
            {copyStatus === "error" && <p role="status" className="mt-2 text-sm text-[#a7462b]">{zh ? "无法自动复制，请手动选中文字复制。" : "Không sao chép tự động được; hãy chọn nội dung và sao chép thủ công nha."}</p>}
            <a
              href={ISSUE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#956f41] px-5 py-3 text-sm font-bold text-[#7d502d] transition hover:bg-[#f9e7c7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#93642f]"
            >
              <ExternalLink size={17} aria-hidden="true" /> {zh ? "② 打开公开留言页（GitHub）" : "② Mở nơi gửi thư công khai (GitHub)"}
            </a>
            <p className="mt-4 text-center text-xs leading-6 text-[#89735b]">
              {zh ? "复制不等于已发布。发布后，返回此页点击刷新。" : "Sao chép chưa phải gửi thành công. Đăng trên GitHub xong thì quay lại bấm tải thư mới."}
            </p>
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-[#f4d5a5]">
                  <BookHeart size={21} aria-hidden="true" />
                  <h3 className={"text-xl font-semibold " + (zh ? "font-chinese" : "font-vietnamese")}>{zh ? "来自大家的星光信笺" : "Những lá thư trong dải ngân hà"}</h3>
                </div>
                <p className="mt-2 text-xs text-[#e8decd]/75">
                  {zh ? "所有公开留言，越新越靠前" : "Những lời nhắn công khai, mới nhất được đặt trước"}
                </p>
              </div>
              <button type="button" onClick={() => setReload(n => n + 1)} className="flex min-h-11 items-center gap-2 rounded-full border border-[#e7c58f]/40 px-4 py-2 text-xs font-bold text-[#f4d5a5] transition hover:bg-white/10">
                <RefreshCw size={15} aria-hidden="true" /> {zh ? "刷新" : "Tải thư mới"}
              </button>
            </div>

            <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label={zh ? "筛选留言" : "Lọc lời nhắn"}>
              {([
                ["all", zh ? "Tất cả" : "Tất cả"],
                ["letter", zh ? "来信" : "Lá thư"],
                ["wish", zh ? "祝福" : "Lời chúc"],
              ] as [Filter, string][]).map(([key, title]) => (
                <button key={key} type="button" aria-pressed={filter === key} onClick={() => setFilter(key)} className={"min-h-10 rounded-full border px-4 py-2 text-xs font-bold transition " + (filter === key ? "border-[#f2d39b] bg-[#f0d39d] text-[#352918]" : "border-[#e4c38d]/25 bg-white/5 text-[#f4e7d0] hover:bg-white/10")}>
                  {key === "all" && zh ? "全部" : title} <span className="opacity-65">{counts[key]}</span>
                </button>
              ))}
            </div>

            {fetchState === "loading" && (
              <div className="mt-5 rounded-2xl border border-dashed border-[#ead2a5]/30 bg-white/5 px-6 py-12 text-center text-sm leading-7 text-[#e9dfd0]">{zh ? "正在收集大家的星光来信……" : "Đang gom những lá thư giữa các vì sao..."}</div>
            )}
            {fetchState === "error" && (
              <div className="mt-5 rounded-2xl border border-[#ead2a5]/30 bg-white/5 px-6 py-9 text-center text-sm leading-7 text-[#e9dfd0]">
                {zh ? "暂时无法加载公开留言。可以前往留言页查看。" : "Chưa tải được thư công khai lúc này. Ní có thể mở trang gửi thư để đọc trực tiếp."}
                <div className="mt-3"><a href={ISSUE_URL} target="_blank" rel="noopener noreferrer" className="font-bold text-[#f2d39b] underline underline-offset-4">{zh ? "查看公开来信" : "Xem thư trên GitHub"}</a></div>
              </div>
            )}
            {fetchState === "ready" && shown.length === 0 && (
              <div className="mt-5 rounded-2xl border border-dashed border-[#ead2a5]/35 bg-white/5 px-6 py-12 text-center text-sm leading-8 text-[#e9dfd0]">
                <Mail size={35} className="mx-auto mb-4 text-[#f1d49e]" aria-hidden="true" />
                {posts.length === 0
                  ? (zh ? "还没有公开来信。愿第一颗星星从你这里亮起。♡" : "Chưa có lá thư công khai nào. Biết đâu ní sẽ là người thắp lên ngôi sao đầu tiên. ♡")
                  : (zh ? "此分类暂时没有留言。" : "Chưa có lời nhắn thuộc mục này.")}
              </div>
            )}
            {fetchState === "ready" && shown.length > 0 && (
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {shown.map((post, index) => {
                  const isExpanded = expanded.includes(post.id);
                  const needsExpand = Array.from(post.body).length > 215;
                  const content = isExpanded || !needsExpand ? post.body : Array.from(post.body).slice(0, 215).join("") + "…";
                  return (
                    <motion.article
                      key={post.id}
                      initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.1 }}
                      transition={{ duration: reduceMotion ? 0 : 0.42, delay: Math.min(index * 0.04, 0.2) }}
                      className="fan-letters-card group relative min-w-0 overflow-hidden"
                      style={{ "--fan-card-turn": (index % 2 ? "1deg" : "-1deg") } as CSSProperties}
                    >
                      <div className="fan-letters-card__stamp" aria-hidden="true">{post.kind === "letter" ? "✉" : "✦"}</div>
                      <div className="relative z-10 flex items-start justify-between gap-3">
                        <span className="rounded-full bg-[#e8c69b]/50 px-3 py-1 text-[10px] font-bold uppercase tracking-[.14em] text-[#946131]">
                          {post.kind === "letter" ? (zh ? "一封来信" : "Lá thư") : (zh ? "生日祝福" : "Lời chúc")}
                        </span>
                        <span className="text-[10px] font-medium text-[#967f65]">{dateFormatter.format(new Date(post.createdAt))}</span>
                      </div>
                      <p className="relative z-10 mt-5 whitespace-pre-wrap break-words text-[14px] leading-7 text-[#5e4b39]">{content}</p>
                      {needsExpand && (
                        <button type="button" aria-expanded={isExpanded} onClick={() => toggleExpanded(post.id)} className="relative z-10 mt-3 text-xs font-bold text-[#946131] underline underline-offset-4">
                          {isExpanded ? (zh ? "收起信笺" : "Gấp thư lại") : (zh ? "展开阅读全文" : "Mở đọc cả lá thư")}
                        </button>
                      )}
                      <div className="relative z-10 mt-6 flex items-center justify-between gap-2 border-t border-[#d4b890]/50 pt-3 text-xs text-[#8b6b50]">
                        <span className="min-w-0 truncate font-semibold">@{post.author}</span>
                        <a href={post.url} target="_blank" rel="noopener noreferrer" className="flex shrink-0 items-center gap-1 font-medium hover:underline">{zh ? "原文" : "Bản gốc"} <ExternalLink size={12} aria-hidden="true" /></a>
                      </div>
                    </motion.article>
                  );
                })}
              </div>
            )}
            <p className="mt-6 text-xs leading-7 text-[#d8cfc4]/75">
              {zh ? "留言由粉丝自行发布在公开的 GitHub 讨论页面上；这里并非郑国霖先生的官方留言渠道。" : "Lời nhắn được các bạn fan tự đăng công khai trên GitHub; đây không phải kênh liên hệ chính thức của Trịnh lão sư."}
            </p>

            {legacyWishes.length > 0 && (
              <details className="mt-6 rounded-xl border border-[#e1c590]/30 bg-white/5 p-4 text-sm text-[#f2e4d1]">
                <summary className="cursor-pointer font-semibold">
                  {zh ? "查看此设备以前保存的祝福" : "Xem lời chúc cũ lưu trên máy này"} ({legacyWishes.length})
                </summary>
                <p className="mt-3 text-xs leading-6 text-[#e6d6c3]/75">{zh ? "这些祝福未被公开。若想分享，请自行复制并发布。" : "Các lời chúc này chưa được đăng công khai. Muốn chia sẻ thì hãy tự sao chép và đăng nhé."}</p>
                {legacyWishes.map(wish => (
                  <div key={wish.id} className="mt-3 rounded-lg border border-[#e2c592]/20 bg-[#faf1e3]/10 p-3">
                    <p className="whitespace-pre-wrap break-words leading-7">{wish.message}</p>
                    <button type="button" className="mt-2 flex items-center gap-1 text-xs font-bold text-[#f4d5a5] underline" onClick={() => { void copyPreparedText("[CHUC]\n" + wish.message); }}>{zh ? "复制旧祝福" : "Sao chép lời chúc cũ"} <Copy size={13} aria-hidden="true" /></button>
                  </div>
                ))}
              </details>
            )}
          </div>
        </div>
        <div className="mt-14 text-center text-xs tracking-[.20em] text-[#e8c99b]/70">✦ &nbsp; LETTERS FROM EVERY HEART &nbsp; ✦</div>
      </div>
    </section>
  );
}
