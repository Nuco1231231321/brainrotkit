const maxPdfBytes = 25 * 1024 * 1024;
const maxPdfPages = 80;
const maxOcrPages = 12;
const pdfWorkerUrl = "https://cdn.jsdelivr.net/npm/pdfjs-dist@6.1.200/build/pdf.worker.min.mjs";

export type PdfExtractionProgress = {
  stage: "reading" | "ocr";
  current: number;
  total: number;
};

function normalizeExtractedText(value: string) {
  return value
    .replace(/\u0000/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, 50_000);
}

export async function extractPdfText(
  file: File,
  onProgress?: (progress: PdfExtractionProgress) => void,
) {
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    throw new Error("Choose a PDF file.");
  }
  if (!file.size || file.size > maxPdfBytes) throw new Error("The PDF must be 25 MB or smaller.");

  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) });
  const document = await loadingTask.promise;
  if (document.numPages > maxPdfPages) {
    await loadingTask.destroy();
    throw new Error(`This PDF has ${document.numPages} pages. Use a file with ${maxPdfPages} pages or fewer.`);
  }

  try {
    const pageTexts: Array<{ pageNumber: number; text: string }> = [];
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      onProgress?.({ stage: "reading", current: pageNumber, total: document.numPages });
      const page = await document.getPage(pageNumber);
      const content = await page.getTextContent();
      pageTexts.push({ pageNumber, text: content.items
        .filter((item): item is typeof item & { str: string } => "str" in item && typeof item.str === "string")
        .map((item) => item.str)
        .join(" ") });
      page.cleanup();
    }

    const readableDirectText = normalizeExtractedText(pageTexts.map((page) => page.text).join("\n\n"));
    const pagesNeedingOcr = pageTexts.filter((page) => normalizeExtractedText(page.text).length < 24);
    if (!pagesNeedingOcr.length) {
      if (readableDirectText.length < 8) throw new Error("No readable text was found in this PDF.");
      return normalizeExtractedText(pageTexts.map((page) => `[Page ${page.pageNumber}]\n${page.text}`).join("\n\n"));
    }
    if (pagesNeedingOcr.length > maxOcrPages) {
      throw new Error(`This PDF has ${pagesNeedingOcr.length} scanned or unreadable pages. Split it so each file has no more than ${maxOcrPages} pages that need OCR.`);
    }

    const { createWorker } = await import("tesseract.js");
    const pagesToScan = pagesNeedingOcr.length;
    const worker = await createWorker("eng");
    const ocrTextByPage = new Map<number, string>();
    try {
      for (let index = 0; index < pagesNeedingOcr.length; index += 1) {
        const pageNumber = pagesNeedingOcr[index].pageNumber;
        onProgress?.({ stage: "ocr", current: index + 1, total: pagesToScan });
        const page = await document.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1.6 });
        const canvas = window.document.createElement("canvas");
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        await page.render({ canvas, viewport }).promise;
        const result = await worker.recognize(canvas);
        ocrTextByPage.set(pageNumber, result.data.text);
        canvas.width = 1;
        canvas.height = 1;
        page.cleanup();
      }
    } finally {
      await worker.terminate();
    }

    const combinedText = normalizeExtractedText(pageTexts.map((page) => `[Page ${page.pageNumber}]\n${ocrTextByPage.get(page.pageNumber) || page.text}`).join("\n\n"));
    const readableCombinedText = normalizeExtractedText(pageTexts.map((page) => ocrTextByPage.get(page.pageNumber) || page.text).join("\n\n"));
    if (readableCombinedText.length < 8) throw new Error("No readable text was found in this PDF.");
    return combinedText;
  } finally {
    await loadingTask.destroy();
  }
}
