// —— 站点元信息 ——
export const site = {
  name: "SilentBouquet",
  title: "深海与星空之间",
  tagline: "在深海与星空之间，写下笔记、文章与小说。",
  // 首页卷首语
  manifesto:
    "奥斯维辛之后，写诗是野蛮的——但沉默同样是。我选择在两者之间写作：以否定为方法，以星空为坐标。",
};

// —— 类型定义 ——
export interface Note {
  id: string;
  date: string; // YYYY-MM-DD
  tags: string[];
  text: string;
}

export interface Essay {
  slug: string;
  title: string;
  subtitle?: string;
  date: string;
  category: string; // 哲学 / 文学 / 随笔 …
  excerpt: string;
  /** 正文段落，以空行分隔 */
  body: string;
  /** 置顶（来自 Markdown frontmatter） */
  pinned?: boolean;
  featured?: boolean;
}

export interface FictionChapter {
  title: string;
  body: string;
}

export interface Fiction {
  slug: string;
  title: string;
  genre: string; // 中篇 / 短篇 …
  status: "连载中" | "已完成";
  date: string;
  intro: string;
  chapters: FictionChapter[];
}
