import { useCallback, useEffect, useState } from "react";
import type { Essay } from "@/content/types";
import { loadEssays } from "@/lib/essays";

const PREFS_KEY = "silentbouquet:essay-prefs:v1";

interface Prefs {
  favorites: string[];
  pins: string[];
}

function loadPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) return JSON.parse(raw) as Prefs;
  } catch {
    /* 忽略损坏数据 */
  }
  return { favorites: [], pins: [] };
}

/**
 * 文章阅读偏好（仅本机）：收藏 / 置顶。
 * 文章内容来自 Markdown 源（src/content/essays/*.md）；
 * 线上发布的唯一入口是向仓库提交 Markdown 文件。
 */
export function useEssays() {
  const [prefs, setPrefs] = useState<Prefs>(loadPrefs);

  useEffect(() => {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  }, [prefs]);

  /** 列表：置顶优先（frontmatter pinned 或本机置顶），其余按日期倒序 */
  const list = useCallback((): Essay[] => {
    const pinSet = new Set(prefs.pins);
    return loadEssays().sort((a, b) => {
      const pa = a.pinned || pinSet.has(a.slug) ? 0 : 1;
      const pb = b.pinned || pinSet.has(b.slug) ? 0 : 1;
      if (pa !== pb) return pa - pb;
      return b.date.localeCompare(a.date);
    });
  }, [prefs.pins]);

  const get = useCallback(
    (slug: string) => loadEssays().find((e) => e.slug === slug),
    []
  );

  const toggleFavorite = useCallback((slug: string) => {
    setPrefs((p) => ({
      ...p,
      favorites: p.favorites.includes(slug)
        ? p.favorites.filter((f) => f !== slug)
        : [...p.favorites, slug],
    }));
  }, []);

  const togglePin = useCallback((slug: string) => {
    setPrefs((p) => ({
      ...p,
      pins: p.pins.includes(slug) ? p.pins.filter((x) => x !== slug) : [...p.pins, slug],
    }));
  }, []);

  const isFavorite = useCallback((slug: string) => prefs.favorites.includes(slug), [prefs]);
  const isPinned = useCallback(
    (slug: string) => prefs.pins.includes(slug),
    [prefs]
  );

  return { list, get, toggleFavorite, togglePin, isFavorite, isPinned };
}
