import { Pin, Star } from "lucide-react";
import { useEssays } from "@/hooks/useEssays";

interface Props {
  slug: string;
  /** 深色底（如夜航场景）时使用 */
  dark?: boolean;
}

/** 文章偏好操作：收藏 / 置顶（本机生效；发布与修改请编辑 Markdown 源文件） */
export default function EssayActions({ slug, dark }: Props) {
  const { toggleFavorite, togglePin, isFavorite, isPinned } = useEssays();
  const fav = isFavorite(slug);
  const pin = isPinned(slug);

  const base = `rounded p-1.5 transition-colors ${
    dark
      ? "text-paper/50 hover:bg-paper/10 hover:text-paper"
      : "text-muted-foreground/60 hover:bg-accent hover:text-primary"
  }`;

  return (
    <span className="inline-flex items-center gap-1" onClick={(e) => e.preventDefault()}>
      <button
        className={`${base} ${fav ? "text-starlight" : ""} ${!dark && fav ? "!text-primary" : ""}`}
        title={fav ? "取消收藏" : "收藏"}
        onClick={() => toggleFavorite(slug)}
      >
        <Star size={14} fill={fav ? "currentColor" : "none"} />
      </button>
      <button
        className={`${base} ${pin ? "text-starlight" : ""} ${!dark && pin ? "!text-primary" : ""}`}
        title={pin ? "取消置顶" : "置顶"}
        onClick={() => togglePin(slug)}
      >
        <Pin size={14} fill={pin ? "currentColor" : "none"} />
      </button>
    </span>
  );
}
