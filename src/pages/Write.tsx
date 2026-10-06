import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";
import {
  Bold, Check, Eye, FileUp, Github, Italic, Link as LinkIcon,
  ListOrdered, Loader2, Minus, PenLine, Quote, RefreshCw, Send,
} from "lucide-react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import {
  REPO, commitFiles, disconnect, getStoredUser, getToken, refreshStoredUser, validateToken,
} from "@/lib/publisher";
import { countWords } from "@/lib/format";
import { extractFileText } from "@/lib/extract";

type Kind = "essay" | "note" | "fiction";

const tabs: { kind: Kind; label: string; hint: string }[] = [
  { kind: "essay", label: "文章", hint: "空行分段；未填标题时首行自动作为标题。支持粘贴 Markdown，或上传 PDF / Word / 文本文件自动提取正文。" },
  { kind: "note", label: "笔记", hint: "空行分隔的每一段会成为一条独立笔记，一次可发布多条。" },
  { kind: "fiction", label: "小说", hint: "用「## 」开启新章节；无章节标记时全文作为一章。" },
];

const inputCls =
  "w-full rounded-lg border border-border bg-card px-4 py-2.5 text-[15px] outline-none transition-all placeholder:text-muted-foreground/50 focus:border-primary/60 focus:ring-4 focus:ring-primary/10";

function todayMD(): string {
  const d = new Date();
  return `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function slugify(title: string): string {
  const base =
    title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "untitled";
  return `${base}-${Date.now().toString(36)}`;
}

// —— 草稿（localStorage 自动保存） ——
interface Draft {
  text: string;
  title: string; subtitle: string; category: string; excerpt: string; pinned: boolean;
  tags: string; fGenre: string; fStatus: string; fIntro: string;
  savedAt: number;
}
const draftKey = (k: Kind) => `silentbouquet:draft:${k}`;

export default function Write() {
  const [params, setParams] = useSearchParams();
  const kind = (params.get("type") as Kind) || "essay";

  // —— GitHub ——
  const [user, setUser] = useState<string | null>(getStoredUser());
  const [pat, setPat] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [connError, setConnError] = useState("");

  // —— 内容 ——
  const [text, setText] = useState("");
  const [view, setView] = useState<"edit" | "preview">("edit");
  const [dragOver, setDragOver] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [draftNotice, setDraftNotice] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [category, setCategory] = useState("随笔");
  const [excerpt, setExcerpt] = useState("");
  const [pinned, setPinned] = useState(false);
  const [tags, setTags] = useState("");
  const [fGenre, setFGenre] = useState("短篇");
  const [fStatus, setFStatus] = useState<"连载中" | "已完成">("连载中");
  const [fIntro, setFIntro] = useState("");

  // —— 发布 ——
  const [phase, setPhase] = useState<"idle" | "publishing" | "checking" | "live" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [liveUrl, setLiveUrl] = useState("");

  const meta = { text, title, subtitle, category, excerpt, pinned, tags, fGenre, fStatus, fIntro };
  const parsed = useMemo(() => buildFiles(kind, meta), [kind, text, title, subtitle, category, excerpt, pinned, tags, fGenre, fStatus, fIntro]);
  const words = useMemo(() => countWords(text), [text]);

  // 切换体裁时恢复该体裁草稿
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey(kind));
      if (raw) {
        const d = JSON.parse(raw) as Draft;
        setText(d.text); setTitle(d.title); setSubtitle(d.subtitle); setCategory(d.category);
        setExcerpt(d.excerpt); setPinned(d.pinned); setTags(d.tags);
        setFGenre(d.fGenre); setFStatus(d.fStatus as "连载中"); setFIntro(d.fIntro);
        setDraftNotice(true);
        return;
      }
    } catch { /* 忽略 */ }
    setText(""); setTitle(""); setSubtitle(""); setExcerpt(""); setPinned(false);
    setTags(""); setFIntro(""); setDraftNotice(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind]);

  // 自动保存草稿
  useEffect(() => {
    const t = setTimeout(() => {
      const d: Draft = { ...meta, savedAt: Date.now() };
      localStorage.setItem(draftKey(kind), JSON.stringify(d));
    }, 800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, text, title, subtitle, category, excerpt, pinned, tags, fGenre, fStatus, fIntro]);

  const clearDraft = () => {
    localStorage.removeItem(draftKey(kind));
    setDraftNotice(false);
  };

  // 启动时静默确认已记住的令牌仍然有效（失效则自动清除）
  useEffect(() => {
    if (getToken()) {
      refreshStoredUser().then((login) => setUser(login));
    }
  }, []);

  const connect = async () => {
    if (!pat.trim()) return;
    setConnecting(true); setConnError("");
    try {
      const login = await validateToken(pat.trim());
      setUser(login); setPat("");
    } catch (e) {
      setConnError(e instanceof Error ? e.message : "验证失败");
    } finally { setConnecting(false); }
  };

  const upload = async (file: File) => {
    setParsing(true);
    setErrorMsg(""); setPhase("idle");
    try {
      const content = await extractFileText(file);
      if (!content.trim()) {
        setPhase("error");
        setErrorMsg(`「${file.name}」中没有提取到文字——扫描版 PDF 或纯图片文档暂不支持。`);
      } else {
        setText(content);
        setView("edit");
      }
    } catch (e) {
      setPhase("error");
      setErrorMsg(`解析 ${file.name} 失败：${e instanceof Error ? e.message : "未知错误"}`);
    } finally {
      setParsing(false);
    }
  };

  /** 在光标处插入 Markdown 片段 */
  const insert = (before: string, after = "", placeholder = "") => {
    const ta = taRef.current;
    if (!ta) return;
    const s = ta.selectionStart, e = ta.selectionEnd;
    const sel = text.slice(s, e) || placeholder;
    const next = text.slice(0, s) + before + sel + after + text.slice(e);
    setText(next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(s + before.length, s + before.length + sel.length);
    });
  };

  const publish = async () => {
    if (!getToken()) { setPhase("error"); setErrorMsg("请先连接 GitHub。"); return; }
    if (parsed.error) { setPhase("error"); setErrorMsg(parsed.error); return; }
    setPhase("publishing"); setErrorMsg(""); setLiveUrl("");
    try {
      await commitFiles(parsed.files, `publish via 写作间: ${parsed.files.map((f) => f.path.split("/").pop()).join(", ")}`);
      setLiveUrl(parsed.liveUrl || "https://silentbouquet.github.io/");
      setPhase("checking");
      checkLive(parsed.liveUrl || "https://silentbouquet.github.io/");
    } catch (e) {
      setPhase("error");
      setErrorMsg(e instanceof Error ? e.message : "发布失败");
    }
  };

  /** 轮询线上页面，直到构建上线 */
  const checkLive = async (url: string) => {
    for (let i = 0; i < 15; i++) {
      await new Promise((r) => setTimeout(r, i === 0 ? 8000 : 12000));
      try {
        const res = await fetch(url, { cache: "no-store" });
        if (res.ok) { setPhase("live"); return; }
      } catch { /* 继续等待 */ }
    }
  };

  const tab = tabs.find((t) => t.kind === kind)!;

  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-5xl px-6 pb-10 pt-28">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="kicker">WRITE</p>
            <h1 className="mt-3 font-serif text-4xl font-black tracking-[0.12em]">写作间</h1>
          </div>
          <div className="flex gap-1 rounded-full border border-border bg-card p-1">
            {tabs.map((t) => (
              <button
                key={t.kind}
                onClick={() => setParams({ type: t.kind })}
                className={`rounded-full px-4 py-1.5 text-sm tracking-[0.2em] transition-all ${
                  kind === t.kind ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">{tab.hint}</p>

        {draftNotice && (
          <div className="mt-5 flex items-center justify-between rounded-lg border border-primary/30 bg-accent/60 px-4 py-2.5 text-sm text-primary">
            <span className="flex items-center gap-2"><PenLine size={14} /> 已恢复此体裁的本地草稿（编辑时自动保存）</span>
            <button onClick={clearDraft} className="text-xs tracking-widest opacity-70 hover:opacity-100">清除草稿</button>
          </div>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* ── 左：编辑器 ── */}
          <div className="lg:col-span-2">
            {/* 工具栏 */}
            <div className="flex items-center justify-between rounded-t-lg border border-border bg-card px-3 py-2">
              <div className="flex items-center gap-0.5 text-muted-foreground">
                <ToolBtn title="加粗" onClick={() => insert("**", "**", "加粗")}><Bold size={15} /></ToolBtn>
                <ToolBtn title="斜体" onClick={() => insert("*", "*", "斜体")}><Italic size={15} /></ToolBtn>
                <ToolBtn title="引用" onClick={() => insert("> ", "", "引文")}><Quote size={15} /></ToolBtn>
                <ToolBtn title="章节标题" onClick={() => insert("\n## ", "", "章节标题")}><ListOrdered size={15} /></ToolBtn>
                <ToolBtn title="链接" onClick={() => insert("[", "](https://)", "链接文字")}><LinkIcon size={15} /></ToolBtn>
                <ToolBtn title="分割线" onClick={() => insert("\n\n——\n\n")}><Minus size={15} /></ToolBtn>
                <span className="mx-2 h-4 w-px bg-border" />
                <ToolBtn title="上传 Markdown / PDF / Word / 文本" onClick={() => fileRef.current?.click()}><FileUp size={15} /></ToolBtn>
                <input ref={fileRef} type="file" accept=".md,.markdown,.txt,.text,.pdf,.docx" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }} />
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono-meta text-[11px] text-muted-foreground">{words} 字</span>
                <div className="flex rounded-full border border-border p-0.5 text-xs">
                  <button onClick={() => setView("edit")} className={`rounded-full px-3 py-1 tracking-widest transition-colors ${view === "edit" ? "bg-accent text-primary" : "text-muted-foreground"}`}>撰写</button>
                  <button onClick={() => setView("preview")} className={`flex items-center gap-1 rounded-full px-3 py-1 tracking-widest transition-colors ${view === "preview" ? "bg-accent text-primary" : "text-muted-foreground"}`}><Eye size={11} /> 预览</button>
                </div>
              </div>
            </div>

            {/* 编辑 / 预览 */}
            <div
              className={`relative rounded-b-lg border border-t-0 border-border bg-card transition-shadow ${dragOver ? "ring-4 ring-primary/20" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault(); setDragOver(false);
                const f = e.dataTransfer.files?.[0];
                if (f) upload(f);
              }}
            >
              {view === "edit" ? (
                <textarea
                  ref={taRef}
                  className="min-h-[460px] w-full resize-y bg-transparent px-5 py-4 text-[15px] leading-[2] outline-none placeholder:text-muted-foreground/40"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={
                    kind === "essay" ? "第一行将作为标题（若未填上方标题），空行分段……\n\n也可以直接粘贴完整的 Markdown。"
                      : kind === "note" ? "每一段（空行分隔）成为一条笔记……\n\n第二条笔记……"
                      : "## 一、开篇\n\n正文……\n\n## 二、第二章\n\n正文……"
                  }
                />
              ) : (
                <Preview kind={kind} text={text} meta={meta} />
              )}
              {dragOver && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-b-lg bg-primary/5 text-sm tracking-[0.3em] text-primary">
                  松开以提取文字（Markdown / PDF / Word / 文本）
                </div>
              )}
              {parsing && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 rounded-b-lg bg-card/80 text-sm text-muted-foreground backdrop-blur-sm">
                  <Loader2 size={15} className="animate-spin" /> 正在解析文件…
                </div>
              )}
            </div>
          </div>

          {/* ── 右：元信息 + 发布 ── */}
          <div className="space-y-5">
            <section className="rounded-xl border border-border bg-card p-5">
              <h2 className="text-xs tracking-[0.3em] text-muted-foreground">
                {kind === "essay" ? "文章信息" : kind === "note" ? "标签" : "作品信息"}
              </h2>
              <div className="mt-4 space-y-4">
                {kind === "essay" && (
                  <>
                    <Field label="标题 *"><input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="首行亦可" /></Field>
                    <Field label="分类"><input className={inputCls} value={category} onChange={(e) => setCategory(e.target.value)} /></Field>
                    <Field label="副标题"><input className={inputCls} value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="可留空" /></Field>
                    <Field label="摘要"><input className={inputCls} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="留空自动截取" /></Field>
                    <Field label="标签（逗号分隔）"><input className={inputCls} value={tags} onChange={(e) => setTags(e.target.value)} placeholder="阿多诺, 哲学" /></Field>
                    <label className="flex items-center gap-2 text-sm text-muted-foreground">
                      <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} className="accent-[hsl(209_62%_30%)]" />
                      置顶
                    </label>
                  </>
                )}
                {kind === "note" && (
                  <Field label="标签（逗号分隔，应用于本批全部）">
                    <input className={inputCls} value={tags} onChange={(e) => setTags(e.target.value)} placeholder="读书, 夜" />
                  </Field>
                )}
                {kind === "fiction" && (
                  <>
                    <Field label="作品标题 *"><input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
                    <Field label="体裁"><input className={inputCls} value={fGenre} onChange={(e) => setFGenre(e.target.value)} /></Field>
                    <Field label="状态">
                      <select className={inputCls} value={fStatus} onChange={(e) => setFStatus(e.target.value as "连载中" | "已完成")}>
                        <option>连载中</option><option>已完成</option>
                      </select>
                    </Field>
                    <Field label="一句话简介"><input className={inputCls} value={fIntro} onChange={(e) => setFIntro(e.target.value)} /></Field>
                  </>
                )}
              </div>
            </section>

            {/* 发布 */}
            <section className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-xs tracking-[0.3em] text-muted-foreground">发布</h2>
                {parsed.count > 0 && <span className="font-mono-meta text-[11px] text-muted-foreground">{parsed.count} 个文件</span>}
              </div>

              {user ? (
                <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <LinkIcon size={12} className="text-primary" /> 已记住令牌 <b className="text-foreground">{user}</b> · 发布免粘贴
                  <button onClick={() => { disconnect(); setUser(null); }} className="ml-auto tracking-widest hover:text-destructive">断开</button>
                </p>
              ) : (
                <div className="mt-3 space-y-2">
                  <input type="password" className={`${inputCls} font-mono-meta text-xs`} placeholder="细粒度 Personal Access Token"
                    value={pat} onChange={(e) => setPat(e.target.value)} />
                  <button onClick={connect} disabled={connecting || !pat.trim()}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-secondary py-2 text-xs tracking-[0.25em] text-secondary-foreground transition-opacity hover:opacity-80 disabled:opacity-50">
                    {connecting ? <Loader2 size={12} className="animate-spin" /> : <Github size={12} />} 验证并连接
                  </button>
                  <details className="text-[11px] leading-relaxed text-muted-foreground">
                    <summary className="cursor-pointer tracking-[0.2em] hover:text-foreground">如何获取令牌？</summary>
                    <ol className="mt-1.5 list-decimal space-y-1 pl-4">
                      <li><a className="text-primary underline" href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noreferrer">创建细粒度令牌</a></li>
                      <li>只勾选仓库 <b>{REPO}</b></li>
                      <li>Permissions → Contents → <b>Read and write</b></li>
                      <li>生成后复制，粘贴到上方</li>
                    </ol>
                  </details>
                  {connError && <p className="text-[11px] text-destructive">验证失败：{connError}</p>}
                </div>
              )}

              <button onClick={publish}
                disabled={phase === "publishing" || phase === "checking" || !parsed.count}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm tracking-[0.3em] text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:opacity-90 disabled:opacity-50">
                {phase === "publishing" ? <Loader2 size={15} className="animate-spin" />
                  : phase === "checking" ? <RefreshCw size={15} className="animate-spin" />
                  : <Send size={15} />}
                {phase === "publishing" ? "正在提交…" : phase === "checking" ? "构建中，检测上线…" : "发布"}
              </button>

              {phase === "error" && (
                <p className="mt-3 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">{errorMsg}</p>
              )}
              {phase === "checking" && (
                <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 size={12} className="animate-spin" /> 已提交仓库，Actions 构建中（约 1 分钟），正在自动检测…
                  <a className="text-primary underline" href={`https://github.com/${REPO}/actions`} target="_blank" rel="noreferrer">进度</a>
                </p>
              )}
              {phase === "live" && (
                <div className="mt-3 rounded-md border border-primary/40 bg-accent px-3 py-2.5 text-xs leading-relaxed text-primary">
                  <p className="flex items-center gap-1.5 font-medium"><Check size={13} /> 已上线 ✦</p>
                  <a className="mt-1 block underline underline-offset-2" href={liveUrl} target="_blank" rel="noreferrer">{liveUrl}</a>
                  <Link className="mt-1 block underline underline-offset-2" to={liveUrl.replace("https://silentbouquet.github.io", "") || "/"}>在站内打开 →</Link>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function ToolBtn({ title, onClick, children }: { title: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button title={title} onClick={onClick} className="rounded-md p-1.5 transition-colors hover:bg-accent hover:text-primary">
      {children}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] tracking-[0.25em] text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

/** 预览：按体裁渲染 */
function Preview({ kind, text, meta }: { kind: Kind; text: string; meta: Record<string, string | boolean> }) {
  if (!text.trim()) {
    return <p className="flex h-[460px] items-center justify-center text-sm text-muted-foreground/50">预览将在这里呈现</p>;
  }
  if (kind === "note") {
    const parts = text.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean);
    return (
      <div className="max-h-[520px] space-y-5 overflow-y-auto px-5 py-4">
        {parts.map((p, i) => (
          <div key={i} className="border-l-2 border-border pl-4">
            <p className="font-mono-meta text-[10px] text-muted-foreground">笔记 {i + 1}</p>
            <p className="mt-1 text-[15px] leading-[1.9]">{p}</p>
          </div>
        ))}
      </div>
    );
  }
  if (kind === "fiction") {
    const chapters = text.split(/^##\s+/m).map((s) => s.trim()).filter(Boolean);
    return (
      <div className="max-h-[520px] overflow-y-auto px-5 py-4">
        <p className="text-center font-serif text-xl font-bold">《{String(meta.title) || "未命名"}》</p>
        {chapters.map((c, i) => {
          const nl = c.indexOf("\n");
          const t = nl === -1 ? c : c.slice(0, nl);
          return (
            <div key={i} className="mt-6">
              <p className="text-center font-serif text-base font-bold text-primary">## {t}</p>
              <p className="mt-2 text-sm leading-[1.9] text-muted-foreground">
                {(nl === -1 ? "" : c.slice(nl + 1)).trim().slice(0, 120) || "（空章节）"}…
              </p>
            </div>
          );
        })}
      </div>
    );
  }
  const paragraphs = text.replace(/^---[\s\S]*?---\n?/, "").split(/\n{2,}/).map((s) => s.trim()).filter(Boolean);
  return (
    <div className="measure max-h-[520px] overflow-y-auto px-5 py-4">
      {paragraphs.map((p, i) => (
        <p key={i} className={`mb-6 text-justify text-[15px] leading-[2] ${i === 0 ? "dropcap" : ""}`}>{p}</p>
      ))}
    </div>
  );
}

// —— 组装待发布的 Markdown ——
interface Built {
  files: { path: string; content: string }[];
  count: number;
  error?: string;
  liveUrl?: string;
}

function buildFiles(kind: Kind, m: Record<string, string | boolean>): Built {
  const date = todayMD();
  const str = (v: unknown) => String(v ?? "").trim();

  if (kind === "essay") {
    const raw = str(m.text);
    if (!raw) return { files: [], count: 0, error: "正文不能为空。" };
    let content = raw;
    if (!raw.startsWith("---")) {
      const nl = raw.indexOf("\n");
      const firstLine = (nl === -1 ? raw : raw.slice(0, nl)).trim();
      const body = nl === -1 ? "" : raw.slice(nl + 1).trim();
      const t = str(m.title) || firstLine;
      if (!t) return { files: [], count: 0, error: "缺少标题。" };
      content = [
        "---", `title: ${t}`,
        str(m.subtitle) ? `subtitle: ${str(m.subtitle)}` : null,
        `category: ${str(m.category) || "随笔"}`,
        `date: ${date}`,
        str(m.excerpt) ? `excerpt: ${str(m.excerpt)}` : null,
        str(m.tags) ? `tags: [${str(m.tags)}]` : null,
        m.pinned ? "pinned: true" : null,
        "---", "",
        body || raw,
      ].filter((l) => l !== null).join("\n");
    }
    const slug = slugify(str(m.title) || "essay");
    return { files: [{ path: `src/content/essays/${slug}.md`, content }], count: 1, liveUrl: `https://silentbouquet.github.io/essays/${slug}` };
  }

  if (kind === "note") {
    const parts = str(m.text).split(/\n{2,}/).map((s) => s.trim()).filter(Boolean);
    if (!parts.length) return { files: [], count: 0, error: "正文不能为空。" };
    const ts = Date.now().toString(36);
    const tagList = str(m.tags).split(/[,，]/).map((t) => t.trim()).filter(Boolean);
    const files = parts.map((p, i) => ({
      path: `src/content/notes/note-${ts}-${i + 1}.md`,
      content: ["---", `date: ${date}`, `tags: [${tagList.join(", ")}]`, "---", "", p].join("\n"),
    }));
    return { files, count: files.length, liveUrl: "https://silentbouquet.github.io/notes" };
  }

  if (!str(m.title)) return { files: [], count: 0, error: "请填写作品标题。" };
  if (!str(m.text)) return { files: [], count: 0, error: "正文不能为空。" };
  const body = str(m.text).includes("\n## ")
    ? str(m.text)
    : `## 全文\n\n${str(m.text)}`;
  const content = [
    "---", `title: ${str(m.title)}`,
    `genre: ${str(m.fGenre) || "短篇"}`,
    `status: ${str(m.fStatus)}`,
    `date: ${date}`,
    str(m.fIntro) ? `intro: ${str(m.fIntro)}` : null,
    "---", "", body,
  ].filter((l) => l !== null).join("\n");
  const slug = slugify(str(m.title));
  return { files: [{ path: `src/content/fiction/${slug}.md`, content }], count: 1, liveUrl: `https://silentbouquet.github.io/fiction/${slug}` };
}
