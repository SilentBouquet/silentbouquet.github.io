/** 从 PDF / Word 文件中提取纯文本（浏览器端解析，不经任何服务器） */

export async function extractPdf(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

  const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  let out = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const tc = await page.getTextContent();
    let lastY: number | null = null;
    let line = "";
    for (const item of tc.items) {
      if (!("str" in item)) continue;
      const y = item.transform[5];
      if (lastY !== null && Math.abs(y - lastY) > 2) {
        out += line.trim() + "\n";
        line = "";
      }
      // 中英文之间补一个空格，避免粘连
      line += (line && /[\u4e00-\u9fa5]/.test(line.slice(-1)) && /[a-zA-Z0-9]/.test(item.str[0] || "") ? " " : "") + item.str;
      lastY = y;
    }
    out += line.trim() + "\n\n";
  }
  return out.trim();
}

export async function extractDocx(file: File): Promise<string> {
  const JSZip = (await import("jszip")).default;
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const entry = zip.file("word/document.xml");
  if (!entry) throw new Error("无法识别的 Word 文件（缺少 document.xml）");
  const xml = await entry.async("text");
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  const paragraphs = Array.from(doc.getElementsByTagNameNS("*", "p"));
  return paragraphs
    .map((p) =>
      Array.from(p.getElementsByTagNameNS("*", "t"))
        .map((t) => t.textContent ?? "")
        .join("")
    )
    .filter((s) => s.trim())
    .join("\n\n");
}

/** 按扩展名分发解析 */
export async function extractFileText(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf")) return extractPdf(file);
  if (name.endsWith(".docx")) return extractDocx(file);
  return file.text();
}
