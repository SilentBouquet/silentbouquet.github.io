/**
 * 站内发布通道：通过 GitHub REST API 把 Markdown 文件直接提交进仓库，
 * 触发 Actions 自动构建，约 1 分钟后线上生效。
 *
 * 令牌使用细粒度 Personal Access Token（仅本仓库 Contents 读写权限），
 * 只保存在访问者浏览器的 localStorage 中，不经任何第三方服务器。
 */

export const REPO = "SilentBouquet/SilentBouquet.github.io";

const TOKEN_KEY = "silentbouquet:gh-pat";
const USER_KEY = "silentbouquet:gh-user";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): string | null {
  return localStorage.getItem(USER_KEY);
}

export function disconnect() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/** 验证令牌并返回登录名；失败抛错 */
export async function validateToken(token: string): Promise<string> {
  const u = await ghApi("/user", { token });
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, u.login);
  return u.login;
}

async function ghApi(
  pathname: string,
  opts: { method?: string; body?: unknown; token?: string } = {}
): Promise<any> {
  const token = opts.token ?? getToken();
  const res = await fetch(`https://api.github.com${pathname}`, {
    method: opts.method ?? "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    let msg = `GitHub API ${res.status}`;
    try {
      msg = JSON.parse(text).message ?? msg;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  return res.status === 204 ? null : res.json();
}

function utf8ToB64(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin);
}

export interface CommitResult {
  path: string;
  commitSha: string;
}

/** 新建或更新仓库中的一个文本文件 */
export async function commitFile(
  path: string,
  content: string,
  message: string
): Promise<CommitResult> {
  let sha: string | undefined;
  try {
    const existing = await ghApi(`/repos/${REPO}/contents/${path}`);
    sha = existing.sha;
  } catch {
    /* 文件不存在，创建即可 */
  }
  const r = await ghApi(`/repos/${REPO}/contents/${path}`, {
    method: "PUT",
    body: {
      message,
      content: utf8ToB64(content),
      ...(sha ? { sha } : {}),
    },
  });
  return { path, commitSha: r.commit.sha.slice(0, 7) };
}

/** 顺序提交多个文件（避免并发触发竞态） */
export async function commitFiles(
  items: { path: string; content: string }[],
  message: string
): Promise<CommitResult[]> {
  const out: CommitResult[] = [];
  for (const it of items) {
    out.push(await commitFile(it.path, it.content, message));
  }
  return out;
}
