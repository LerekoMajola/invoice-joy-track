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
