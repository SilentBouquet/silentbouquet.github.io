import { useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { FileUp, Github, Link2, Loader2, Send, Unplug } from "lucide-react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import {
  REPO,
  commitFiles,
  disconnect,
  getStoredUser,
  getToken,
  validateToken,
} from "@/lib/publisher";

type Kind = "essay" | "note" | "fiction";

const tabs: { kind: Kind; label: string; hint: string }[] = [
  { kind: "essay", label: "文章", hint: "成篇的写作。首行是标题，空行分段；也可以直接粘贴完整 Markdown（含 frontmatter）。" },
  { kind: "note", label: "笔记", hint: "碎片化的思考。空行分隔的每一段会成为一条独立笔记。" },
  { kind: "fiction", label: "小说", hint: "用「## 」开启新章节；没有章节标记时全文作为一章。" },
];

const inputCls =
  "w-full rounded-sm border border-border bg-card px-4 py-2.5 text-[15px] outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary/60 focus:ring-1 focus:ring-primary/30";

function todayMD(): string {
  const d = new Date();
  return `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function slugify(title: string): string {
  const base =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "untitled";
  return `${base}-${Date.now().toString(36)}`;
}

export default function Write() {
  const [params, setParams] = useSearchParams();
  const kind = (params.get("type") as Kind) || "essay";

  // —— GitHub 连接 ——
  const [user, setUser] = useState<string | null>(getStoredUser());
  const [pat, setPat] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [connError, setConnError] = useState("");

  // —— 内容 ——
  const [text, setText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // —— 文章元信息 ——
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [category, setCategory] = useState("随笔");
  const [excerpt, setExcerpt] = useState("");
  const [pinned, setPinned] = useState(false);

  // —— 笔记元信息 ——
  const [tags, setTags] = useState("");

  // —— 小说元信息 ——
  const [fGenre, setFGenre] = useState("短篇");
  const [fStatus, setFStatus] = useState<"连载中" | "已完成">("连载中");
  const [fIntro, setFIntro] = useState("");

  // —— 发布 ——
  const [publishing, setPublishing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState("");

  const parsed = useMemo(() => buildFiles(kind, {
    text, title, subtitle, category, excerpt, pinned, tags,
    fGenre, fStatus, fIntro,
  }), [kind, text, title, subtitle, category, excerpt, pinned, tags, fGenre, fStatus, fIntro]);

  const connect = async () => {
    if (!pat.trim()) return;
    setConnecting(true);
    setConnError("");
    try {
      const login = await validateToken(pat.trim());
      setUser(login);
      setPat("");
    } catch (e) {
      setConnError(e instanceof Error ? e.message : "验证失败");
    } finally {
      setConnecting(false);
    }
  };

  const upload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setText(String(reader.result ?? ""));
    reader.readAsText(file, "utf-8");
  };

  const publish = async () => {
    if (!getToken()) {
      setError("请先连接 GitHub。");
      return;
    }
    if (parsed.error) {
      setError(parsed.error);
      return;
    }
    setPublishing(true);
    setError("");
    setResult(null);
    try {
      const res = await commitFiles(parsed.files, `publish via 写作间: ${parsed.files.map((f) => f.path.split("/").pop()).join(", ")}`);
      setResult(
        `已提交 ${res.length} 个文件（${res.map((r) => r.commitSha).join(", ")}）。` +
          `Actions 正在构建，约 1 分钟后线上生效。`
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "发布失败");
    } finally {
      setPublishing(false);
    }
  };

  const tab = tabs.find((t) => t.kind === kind)!;

  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-3xl px-6 pb-10 pt-32">
        <p className="font-mono-meta text-xs tracking-[0.5em] text-muted-foreground">WRITE</p>
        <h1 className="mt-4 font-serif text-4xl font-black tracking-[0.15em]">写作间</h1>

        {/* 类型切换 */}
        <div className="mt-8 flex gap-2">
          {tabs.map((t) => (
            <button
              key={t.kind}
              onClick={() => setParams({ type: t.kind })}
              className={`rounded-sm border px-5 py-2 text-sm tracking-[0.25em] transition-colors ${
                kind === t.kind
                  ? "border-primary/60 bg-accent text-primary"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{tab.hint}</p>

        {/* GitHub 连接 */}
        <section className="mt-8 rounded-sm border border-border bg-card p-6">
          <div className="flex items-center gap-2 text-sm tracking-[0.2em]">
            <Github size={15} className="text-primary" />
            GitHub 发布通道
          </div>
          {user ? (
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Link2 size={14} className="text-primary" />
                已连接 <b className="text-foreground">{user}</b> · 令牌仅保存在本浏览器
              </span>
              <button
                onClick={() => {
                  disconnect();
                  setUser(null);
                }}
                className="flex items-center gap-1.5 rounded-sm border border-border px-3 py-1.5 text-xs tracking-[0.2em] text-muted-foreground transition-colors hover:border-destructive/50 hover:text-destructive"
              >
                <Unplug size={12} /> 断开
              </button>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="password"
                  className={`${inputCls} flex-1 font-mono-meta text-xs`}
                  placeholder="粘贴细粒度 Personal Access Token"
                  value={pat}
                  onChange={(e) => setPat(e.target.value)}
                />
                <button
                  onClick={connect}
                  disabled={connecting || !pat.trim()}
                  className="flex items-center justify-center gap-2 rounded-sm bg-primary px-5 py-2.5 text-sm tracking-[0.2em] text-primary-foreground transition-opacity hover:opacity-85 disabled:opacity-50"
                >
                  {connecting && <Loader2 size={14} className="animate-spin" />} 验证并连接
                </button>
              </div>
              <details className="text-xs leading-relaxed text-muted-foreground">
                <summary className="cursor-pointer tracking-[0.2em] hover:text-foreground">
                  如何获取令牌？（一次性，约 2 分钟）
                </summary>
                <ol className="mt-2 list-decimal space-y-1 pl-5">
                  <li>
                    打开{" "}
                    <a className="text-primary underline underline-offset-2" href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noreferrer">
                      github.com/settings/personal-access-tokens/new
                    </a>
                  </li>
                  <li>Token name 随意（如 silentbouquet-publish）；Expiration 按需；Repository access 选 Only select repositories，勾选 <b>{REPO}</b></li>
                  <li>Permissions → Repository permissions → <b>Contents</b> 选 <b>Read and write</b>，其余保持 No access</li>
                  <li>点 Generate token，立即复制（只显示一次），粘贴到上方输入框</li>
                </ol>
              </details>
              {connError && <p className="text-xs text-destructive">验证失败：{connError}</p>}
            </div>
          )}
        </section>

        {/* 元信息 */}
        <div className="mt-8 space-y-5">
          {kind === "essay" && (
            <>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs tracking-[0.3em] text-muted-foreground">标题 *</label>
                  <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="文章标题" />
                </div>
                <div>
                  <label className="mb-2 block text-xs tracking-[0.3em] text-muted-foreground">分类</label>
                  <input className={inputCls} value={category} onChange={(e) => setCategory(e.target.value)} />
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs tracking-[0.3em] text-muted-foreground">副标题</label>
                  <input className={inputCls} value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="可留空" />
                </div>
                <div>
                  <label className="mb-2 block text-xs tracking-[0.3em] text-muted-foreground">摘要</label>
                  <input className={inputCls} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="留空自动截取" />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} className="accent-[hsl(210_65%_26%)]" />
                置顶此文章
              </label>
            </>
          )}
          {kind === "note" && (
            <div>
              <label className="mb-2 block text-xs tracking-[0.3em] text-muted-foreground">标签（逗号分隔）</label>
              <input className={inputCls} value={tags} onChange={(e) => setTags(e.target.value)} placeholder="阿多诺, 哲学" />
            </div>
          )}
          {kind === "fiction" && (
            <>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs tracking-[0.3em] text-muted-foreground">作品标题 *</label>
                  <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="书名" />
                </div>
                <div>
                  <label className="mb-2 block text-xs tracking-[0.3em] text-muted-foreground">体裁</label>
                  <input className={inputCls} value={fGenre} onChange={(e) => setFGenre(e.target.value)} />
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs tracking-[0.3em] text-muted-foreground">状态</label>
                  <select className={inputCls} value={fStatus} onChange={(e) => setFStatus(e.target.value as "连载中" | "已完成")}>
                    <option>连载中</option>
                    <option>已完成</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-xs tracking-[0.3em] text-muted-foreground">一句话简介</label>
                  <input className={inputCls} value={fIntro} onChange={(e) => setFIntro(e.target.value)} />
                </div>
              </div>
            </>
          )}
        </div>

        {/* 正文 + 上传 */}
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <label className="text-xs tracking-[0.3em] text-muted-foreground">
              正文 *{parsed.count ? `（将发布 ${parsed.count} 个文件）` : ""}
            </label>
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1.5 rounded-sm border border-border px-3 py-1.5 text-xs tracking-[0.2em] text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
            >
              <FileUp size={13} /> 上传 .md / .txt
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".md,.markdown,.txt,.text"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) upload(f);
                e.target.value = "";
              }}
            />
          </div>
          <textarea
            className={`${inputCls} min-h-[360px] resize-y leading-[1.9]`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={
              kind === "essay"
                ? "第一行将作为标题（若未填上方标题），空行分段……\n\n也可以直接粘贴完整的 Markdown（--- 开头）。"
                : kind === "note"
                  ? "每一段（空行分隔）成为一条笔记……\n\n第二条笔记……"
                  : "## 一、开篇\n\n正文……\n\n## 二、第二章\n\n正文……"
            }
          />
        </div>

        {/* 发布 */}
        <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-border pt-8">
          <button
            onClick={publish}
            disabled={publishing}
            className="flex items-center gap-2 rounded-sm bg-primary px-8 py-3 text-sm tracking-[0.3em] text-primary-foreground transition-opacity hover:opacity-85 disabled:opacity-50"
          >
            {publishing ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            {publishing ? "正在提交…" : "发布"}
          </button>
          <Link to={kind === "essay" ? "/essays" : kind === "note" ? "/notes" : "/fiction"} className="text-sm tracking-[0.2em] text-muted-foreground hover:text-foreground">
            返回{tab.label}页
          </Link>
        </div>

        {error && (
          <p className="mt-6 rounded-sm border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}
        {result && (
          <div className="mt-6 rounded-sm border border-primary/40 bg-accent px-4 py-3 text-sm leading-relaxed text-primary">
            <p>{result}</p>
            <p className="mt-2 flex gap-4 text-xs">
              <a className="underline underline-offset-2" href={`https://github.com/${REPO}/actions`} target="_blank" rel="noreferrer">
                查看构建进度 →
              </a>
              <a className="underline underline-offset-2" href="https://silentbouquet.github.io/" target="_blank" rel="noreferrer">
                打开线上站点 →
              </a>
            </p>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

// —— 组装待发布的 Markdown 文件 ——
interface Meta {
  text: string;
  title: string; subtitle: string; category: string; excerpt: string; pinned: boolean;
  tags: string;
  fGenre: string; fStatus: string; fIntro: string;
}

function buildFiles(kind: Kind, m: Meta): { files: { path: string; content: string }[]; count: number; error?: string } {
  const date = todayMD();

  if (kind === "essay") {
    const raw = m.text.trim();
    if (!raw) return { files: [], count: 0, error: "正文不能为空。" };
    let content = raw;
    // 未含 frontmatter：首行作标题
    if (!raw.startsWith("---")) {
      const nl = raw.indexOf("\n");
      const firstLine = (nl === -1 ? raw : raw.slice(0, nl)).trim();
      const body = nl === -1 ? "" : raw.slice(nl + 1).trim();
      if (!m.title.trim() && !firstLine) return { files: [], count: 0, error: "缺少标题。" };
      const t = m.title.trim() || firstLine;
      content = [
        "---",
        `title: ${t}`,
        m.subtitle.trim() ? `subtitle: ${m.subtitle.trim()}` : null,
        `category: ${m.category.trim() || "随笔"}`,
        `date: ${date}`,
        m.excerpt.trim() ? `excerpt: ${m.excerpt.trim()}` : null,
        m.pinned ? "pinned: true" : null,
        "---",
        "",
        body || raw,
      ]
        .filter((l) => l !== null)
        .join("\n");
    }
    const slug = slugify(m.title.trim() || "essay");
    return { files: [{ path: `src/content/essays/${slug}.md`, content }], count: 1 };
  }

  if (kind === "note") {
    const parts = m.text.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean);
    if (!parts.length) return { files: [], count: 0, error: "正文不能为空。" };
    const ts = Date.now().toString(36);
    const tagList = m.tags
      .split(/[,，]/)
      .map((t) => t.trim())
      .filter(Boolean);
    const files = parts.map((p, i) => ({
      path: `src/content/notes/note-${ts}-${i + 1}.md`,
      content: ["---", `date: ${date}`, `tags: [${tagList.join(", ")}]`, "---", "", p].join("\n"),
    }));
    return { files, count: files.length };
  }

  // fiction
  if (!m.title.trim()) return { files: [], count: 0, error: "请填写作品标题。" };
  if (!m.text.trim()) return { files: [], count: 0, error: "正文不能为空。" };
  const chapters = m.text
    .split(/^##\s+/m)
    .map((s) => s.trim())
    .filter(Boolean);
  const body = chapters.length > 1 || m.text.includes("\n## ")
    ? m.text.trim()
    : `## 全文\n\n${m.text.trim()}`;
  const content = [
    "---",
    `title: ${m.title.trim()}`,
    `genre: ${m.fGenre.trim() || "短篇"}`,
    `status: ${m.fStatus}`,
    `date: ${date}`,
    m.fIntro.trim() ? `intro: ${m.fIntro.trim()}` : null,
    "---",
    "",
    body,
  ]
    .filter((l) => l !== null)
    .join("\n");
  const slug = slugify(m.title.trim());
  return { files: [{ path: `src/content/fiction/${slug}.md`, content }], count: 1 };
}
