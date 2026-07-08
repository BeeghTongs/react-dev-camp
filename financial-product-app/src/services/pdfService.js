import { jsPDF } from 'jspdf';

async function loadImageAsDataUrl(url) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();

    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Failed to load product image for PDF:', error);
    return null;
  }
}

export async function downloadProductPdf(product, { imageUrl, requirements = [], shareUrl } = {}) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 48;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = margin;

  if (imageUrl) {
    const dataUrl = await loadImageAsDataUrl(imageUrl);
    if (dataUrl) {
      const imageHeight = 220;
      doc.addImage(dataUrl, 'PNG', margin, cursorY, contentWidth, imageHeight, undefined, 'FAST');
      cursorY += imageHeight + 24;
    }
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text(product.name, margin, cursorY);
  cursorY += 28;

  const displayPrice =
    typeof product.price === 'number' ? `R ${product.price.toFixed(2)}` : `${product.price}`;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(13);
  doc.setTextColor(79, 124, 255);
  doc.text(`${displayPrice} per month`, margin, cursorY);
  doc.setTextColor(0, 0, 0);
  cursorY += 28;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Description', margin, cursorY);
  cursorY += 18;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  const description = product.description || 'No description available for this product.';
  const descriptionLines = doc.splitTextToSize(description, contentWidth);
  doc.text(descriptionLines, margin, cursorY);
  cursorY += descriptionLines.length * 14 + 18;

  if (requirements.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('Requirements', margin, cursorY);
    cursorY += 18;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    requirements.forEach((requirement) => {
      const lines = doc.splitTextToSize(`•  ${requirement}`, contentWidth);
      doc.text(lines, margin, cursorY);
      cursorY += lines.length * 14 + 4;
    });
    cursorY += 14;
  }

  if (shareUrl) {
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text(shareUrl, margin, cursorY);
    doc.setTextColor(0, 0, 0);
  }

  const fileName = `${product.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.pdf`;
  doc.save(fileName);
}
