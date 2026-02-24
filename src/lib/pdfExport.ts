import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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

  pdf.save(filename);
}

/**
 * High-quality admin invoice PDF download.
 *
 * Clones the source element into an offscreen container, normalises all
 * images (especially logos) to prevent skewing, captures as lossless PNG,
 * and inserts into an A4 jsPDF.
 */
export async function exportHighQualityPDF(
  sourceElement: HTMLElement,
  filename: string,
) {
  const RENDER_WIDTH = 595; // matches the on-screen A4 preview width in px
  const SCALE = Math.min(Math.max(3, Math.round(window.devicePixelRatio * 2)), 5);

  // 1. Clone into an offscreen container for isolated, stable rendering
  const offscreen = document.createElement('div');
  offscreen.style.cssText = `
    position: fixed; left: -9999px; top: 0;
    width: ${RENDER_WIDTH}px;
    background: #ffffff;
    z-index: -1;
    overflow: visible;
  `;
  const clone = sourceElement.cloneNode(true) as HTMLElement;
  clone.style.width = `${RENDER_WIDTH}px`;
  clone.style.minHeight = 'auto';
  clone.style.overflow = 'visible';
  offscreen.appendChild(clone);
  document.body.appendChild(offscreen);

  try {
    // 2. Normalise all images in the clone to prevent distortion
    const images = Array.from(clone.querySelectorAll('img')) as HTMLImageElement[];
    await Promise.all(
      images.map(async (img) => {
        // Force deterministic sizing
        img.style.objectFit = 'contain';
        img.style.display = 'block';
        img.style.transform = 'none';
        img.removeAttribute('loading'); // disable lazy loading
        img.crossOrigin = 'anonymous';

        // Wait for image to fully decode
        try {
          if (img.decode) await img.decode();
        } catch {
          // decode() can reject for already-decoded or broken images — safe to ignore
        }
      }),
    );

    // Small extra wait to let layout settle after image decode
    await new Promise((r) => setTimeout(r, 200));

    // 3. Capture with html2canvas — lossless PNG
    const canvas = await html2canvas(clone, {
      scale: SCALE,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      width: RENDER_WIDTH,
      windowWidth: RENDER_WIDTH,
      height: clone.scrollHeight,
      scrollX: 0,
      scrollY: 0,
      imageTimeout: 20000,
      logging: false,
    });

    // 4. Build PDF
    const imgData = canvas.toDataURL('image/png'); // lossless
    const pxW = canvas.width / SCALE;
    const pxH = canvas.height / SCALE;
    const scaleFactor = CONTENT_WIDTH_MM / pxW;
    const contentH = pxH * scaleFactor;

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    // If content is taller than one page, handle multi-page slicing
    if (contentH <= CONTENT_HEIGHT_MM) {
      pdf.addImage(imgData, 'PNG', MARGIN_MM, MARGIN_MM, CONTENT_WIDTH_MM, contentH, undefined, 'NONE');
    } else {
      // Slice the canvas into page-sized chunks
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

    pdf.save(filename);
  } finally {
    // Always clean up offscreen container
    document.body.removeChild(offscreen);
  }
}
