import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'sonner';

// A4 dimensions in mm
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const MARGIN_MM = 10;
const CONTENT_WIDTH_MM = A4_WIDTH_MM - MARGIN_MM * 2;
const CONTENT_HEIGHT_MM = A4_HEIGHT_MM - MARGIN_MM * 2;
const SECTION_GAP_MM = 2;

/**
 * Export an HTML element to a well-paginated A4 PDF.
 * 
 * Mark logical sections inside the element with `data-pdf-section`
 * attributes so they are never split across pages.
 * If no sections are marked, the entire element is rendered as one block.
 */
export async function exportSectionBasedPDF(
  container: HTMLElement,
  filename: string,
) {
  const SCALE = 3; // higher scale = sharper output

  const sections = Array.from(
    container.querySelectorAll('[data-pdf-section]'),
  ) as HTMLElement[];

  // Fallback: if no sections are marked, treat the whole container as one section
  const targets = sections.length > 0 ? sections : [container];

  // Use the container's offsetWidth (layout width) as the consistent render
  // width. scrollWidth can include overflow that skews the capture.
  const containerWidth = container.offsetWidth;

  const captured: { canvas: HTMLCanvasElement; heightMM: number }[] = [];

  for (const section of targets) {
    // Temporarily ensure the section is fully visible for capture
    const prevOverflow = section.style.overflow;
    section.style.overflow = 'visible';

    const canvas = await html2canvas(section, {
      scale: SCALE,
      useCORS: true,
      backgroundColor: '#ffffff',
      width: containerWidth,
      windowWidth: containerWidth,
      scrollX: 0,
      scrollY: -window.scrollY,
      height: section.scrollHeight + 10, // extra buffer to prevent clipping
      imageTimeout: 15000,
      logging: false,
    });

    section.style.overflow = prevOverflow;

    const widthPx = canvas.width / SCALE;
    const heightPx = canvas.height / SCALE;
    const scaleFactor = CONTENT_WIDTH_MM / widthPx;
    const heightMM = heightPx * scaleFactor;

    captured.push({ canvas, heightMM });
  }

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  let currentY = MARGIN_MM;

  for (let i = 0; i < captured.length; i++) {
    const { canvas, heightMM } = captured[i];
    const remaining = CONTENT_HEIGHT_MM - (currentY - MARGIN_MM);

    // If section doesn't fit and we're not at the top, start a new page
    if (heightMM > remaining && currentY > MARGIN_MM) {
      pdf.addPage();
      currentY = MARGIN_MM;
    }

    // If a single section is taller than a full page, it will overflow —
    // but at least it starts at the top of a fresh page.
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    pdf.addImage(
      imgData,
      'JPEG',
      MARGIN_MM,
      currentY,
      CONTENT_WIDTH_MM,
      heightMM,
      undefined,
      'NONE', // no additional compression — keeps sharpness
    );

    currentY += heightMM + SECTION_GAP_MM;
  }

  triggerBlobDownload(pdf, filename);
}

/** Strip characters that browsers/OSes reject in file names. */
function sanitizeFilename(name: string) {
  const cleaned = name.replace(/[\\/:*?"<>|\n\r\t]+/g, '-').replace(/\s+/g, ' ').trim();
  const base = cleaned || 'document';
  return base.toLowerCase().endsWith('.pdf') ? base : `${base}.pdf`;
}

function isEmbeddedFrame() {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

/**
 * Reliably deliver a PDF to the user.
 *
 * Browsers silently drop programmatic downloads when the app runs inside an
 * embedded frame (e.g. the editor preview) or when the click gesture has
 * expired after a long async render. So we attempt the direct download AND
 * always offer an "Open PDF" toast action — a fresh user click that opens the
 * file in a new tab, from where it can be saved.
 */
function triggerBlobDownload(pdf: jsPDF, filename: string) {
  const safeName = sanitizeFilename(filename);
  let url: string | null = null;

  try {
    const blob = pdf.output('blob');
    const file = new File([blob], safeName, { type: 'application/pdf' });
    url = URL.createObjectURL(file);

    const link = document.createElement('a');
    link.href = url;
    link.download = safeName;
    link.rel = 'noopener';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => link.remove(), 0);
  } catch {
    try {
      pdf.save(safeName);
    } catch { /* fall through to toast */ }
  }

  const openUrl = url ?? (pdf.output('bloburl') as unknown as string);
  const embedded = isEmbeddedFrame();

  toast.success(embedded ? 'PDF ready' : `Downloaded ${safeName}`, {
    description: embedded
      ? 'Downloads are blocked inside this preview window. Click "Open PDF" to view and save it.'
      : "Not in your Downloads folder? Click \"Open PDF\" to view and save it.",
    duration: 20000,
    action: {
      label: 'Open PDF',
      onClick: () => {
        const win = window.open(openUrl, '_blank', 'noopener');
        if (!win) {
          // Popup blocked — navigate the top window as a last resort
          window.location.href = openUrl;
        }
      },
    },
  });

  // Keep the blob alive long enough for the "Open PDF" action.
  setTimeout(() => { if (url) URL.revokeObjectURL(url); }, 5 * 60 * 1000);
}

/**
 * High-quality admin invoice PDF download — "screenshot mode".
 *
 * Captures the **live** source element (not a clone) after freezing all
 * image geometries to their current rendered pixel boxes. This ensures
 * the PDF matches the on-screen preview exactly, preventing logo skewing.
 */
export async function exportHighQualityPDF(
  sourceElement: HTMLElement,
  filename: string,
) {
  const SCALE = 2;

  // 1. Collect all images and freeze their geometry to current rendered size
  const images = Array.from(sourceElement.querySelectorAll('img')) as HTMLImageElement[];
  const savedStyles: { el: HTMLImageElement; width: string; height: string; objectFit: string; objectPosition: string; transform: string }[] = [];

  for (const img of images) {
    // Save original inline styles so we can restore later
    savedStyles.push({
      el: img,
      width: img.style.width,
      height: img.style.height,
      objectFit: img.style.objectFit,
      objectPosition: img.style.objectPosition,
      transform: img.style.transform,
    });

    // Wait for decode
    try {
      if (img.decode) await img.decode();
    } catch { /* safe to ignore */ }

    // Skip images that already have explicit pixel widths (e.g. the 140px logo)
    const hasExplicitWidth = img.style.width && img.style.width.endsWith('px') && img.style.width !== '0px';
    if (hasExplicitWidth) continue;

    // Freeze to exact rendered pixel box
    const rect = img.getBoundingClientRect();
    img.style.width = `${rect.width}px`;
    img.style.height = `${rect.height}px`;
    img.style.objectFit = 'contain';
    img.style.objectPosition = 'center';
    img.style.transform = 'none';
  }

  // Small wait for layout to settle
  await new Promise((r) => setTimeout(r, 100));

  try {
    // 2. Capture the live element
    const fixedWidth = sourceElement.offsetWidth;
    const canvas = await html2canvas(sourceElement, {
      scale: SCALE,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      width: fixedWidth,
      windowWidth: fixedWidth,
      height: sourceElement.scrollHeight,
      scrollX: 0,
      scrollY: -window.scrollY,
      imageTimeout: 20000,
      logging: false,
    });

    // 3. Build PDF
    const imgData = canvas.toDataURL('image/png');
    const pxW = canvas.width / SCALE;
    const pxH = canvas.height / SCALE;
    const scaleFactor = CONTENT_WIDTH_MM / pxW;
    const contentH = pxH * scaleFactor;

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    if (contentH <= CONTENT_HEIGHT_MM) {
      pdf.addImage(imgData, 'PNG', MARGIN_MM, MARGIN_MM, CONTENT_WIDTH_MM, contentH, undefined, 'NONE');
    } else {
      const pageCanvasHeight = Math.floor((CONTENT_HEIGHT_MM / scaleFactor) * SCALE);
      let srcY = 0;
      let isFirstPage = true;

      while (srcY < canvas.height) {
        if (!isFirstPage) pdf.addPage();
        isFirstPage = false;

        const sliceHeight = Math.min(pageCanvasHeight, canvas.height - srcY);
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = sliceHeight;

        const ctx = pageCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(canvas, 0, srcY, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);
        }

        const pageImg = pageCanvas.toDataURL('image/png');
        const sliceMMHeight = (sliceHeight / SCALE) * scaleFactor;
        pdf.addImage(pageImg, 'PNG', MARGIN_MM, MARGIN_MM, CONTENT_WIDTH_MM, sliceMMHeight, undefined, 'NONE');

        srcY += sliceHeight;
      }
    }

    triggerBlobDownload(pdf, filename);
  } finally {
    // 4. Restore original inline styles
    for (const s of savedStyles) {
      s.el.style.width = s.width;
      s.el.style.height = s.height;
      s.el.style.objectFit = s.objectFit;
      s.el.style.objectPosition = s.objectPosition;
      s.el.style.transform = s.transform;
    }
  }
}
