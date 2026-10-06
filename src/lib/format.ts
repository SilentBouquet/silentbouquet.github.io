/** 文本统计工具：中文字符按字计，西文按词计 */

export function countWords(text: string): number {
  const cjk = (text.match(/[\u4e00-\u9fa5\u3040-\u30ff\uac00-\ud7af]/g) || []).length;
  const latin = (text.match(/[a-zA-Z0-9]+/g) || []).length;
  return cjk + latin;
}

export function readingTime(text: string): string {
  const w = countWords(text);
  const min = Math.max(1, Math.round(w / 350));
  return `${min} 分钟`;
}

export function formatCount(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(1)} 万`;
  return String(n);
}
