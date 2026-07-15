import jsPDF from "jspdf";
import QRCode from "qrcode";
import { NotoSansRegularBase64, NotoSansBoldBase64 } from "./notoSansFonts";

const FONT = "NotoSans";

/**
 * Registers the embedded NotoSans font (subset to ASCII + ₹ + bullet + en-dash,
 * ~9KB each) so the real ₹ glyph renders instead of jsPDF's core "helvetica"
 * font, which has no ₹ glyph and silently substitutes garbage in its place.
 */
function registerFonts(doc) {
  doc.addFileToVFS("NotoSans-Regular.ttf", NotoSansRegularBase64);
  doc.addFont("NotoSans-Regular.ttf", FONT, "normal");
  doc.addFileToVFS("NotoSans-Bold.ttf", NotoSansBoldBase64);
  doc.addFont("NotoSans-Bold.ttf", FONT, "bold");
}

export async function generateInvoice(invoice, settings) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  registerFonts(doc);
  doc.setFont(FONT, "normal");

  // Product/app branding (ApnaKhata) is distinct from the merchant's own
  // business name (settings.businessName, e.g. "Ghar Pizzeria"). Header shows
  // the product brand; the merchant's details get their own card below it.
  // Falls back to "ApnaKhata" if settings.brandName isn't wired up yet.
  const BRAND_NAME = settings.brandName || "ApnaKhata";

  // ---------- Palette ----------
  const primary = [7, 94, 84];
  const secondary = [71, 85, 105];
  const light = [248, 250, 252];
  const border = [226, 232, 240];
  const dark = [17, 24, 39];
  const white = [255, 255, 255];

  const PAGE_L = 20;
  const PAGE_R = 190;
  const PAGE_W = PAGE_R - PAGE_L; // 170
  const PAGE_TOP = 20;
  const PAGE_BOTTOM = 265; // reserve space below this for the footer

  const currency = (n) => `₹${n}`;

  /* ==========================================
     PAGE-BREAK HELPERS
  ========================================== */
  function addContinuationPage() {
    doc.addPage();
    doc.setFillColor(...primary);
    doc.rect(0, 0, 210, 16, "F");
    doc.setTextColor(...white);
    doc.setFont(FONT, "bold");
    doc.setFontSize(11);
    doc.text(`${BRAND_NAME.toUpperCase()} — Invoice ${invoice.invoiceId} (contd.)`, PAGE_L, 10);
    return PAGE_TOP + 6;
  }

  function ensureSpace(currentY, neededHeight) {
    if (currentY + neededHeight > PAGE_BOTTOM) {
      return addContinuationPage();
    }
    return currentY;
  }

  function drawFooter() {
    doc.setTextColor(...dark);
    doc.setFont(FONT, "normal");
    doc.setFontSize(9);
    doc.text("Thank you for your business.", 105, 282, { align: "center" });
    doc.setFont(FONT, "bold");
    doc.text(`${settings.businessName.toUpperCase()} | ${BRAND_NAME}`, 105, 288, {
      align: "center",
    });
  }

  /* ==========================================
     HEADER — product branding (ApnaKhata), not the merchant's name
  ========================================== */
  doc.setFillColor(...primary);
  doc.rect(0, 0, 210, 36, "F");

  doc.setTextColor(...white);
  doc.setFont(FONT, "bold");
  doc.setFontSize(22);
  doc.text(BRAND_NAME, PAGE_L, 16);

  doc.setFont(FONT, "normal");
  doc.setFontSize(10);
  doc.text("WhatsApp Smart Billing System", PAGE_L, 23);

  doc.setFont(FONT, "bold");
  doc.setFontSize(26);
  doc.text("INVOICE", PAGE_R, 18, { align: "right" });

  doc.setDrawColor(...white);
  doc.setLineWidth(0.4);
  doc.line(PAGE_L, 29, PAGE_R, 29);

  /* ==========================================
     TWO MATCHING CARDS: merchant's business details (left)
     + "Business Information" trust card (right)
  ========================================== */
  const cardY = 44;
  const cardH = 32;
  const cardGap = 6;
  const rightBoxW = 62;
  const rightBoxX = PAGE_R - rightBoxW;
  const leftBoxX = PAGE_L;
  const leftBoxW = rightBoxX - leftBoxX - cardGap;

  // Left card — the merchant's own business identity + contact details
  doc.setFillColor(...light);
  doc.setDrawColor(...border);
  doc.roundedRect(leftBoxX, cardY, leftBoxW, cardH, 2, 2, "FD");

  doc.setTextColor(...dark);
  doc.setFont(FONT, "bold");
  doc.setFontSize(11);
  doc.text(settings.businessName, leftBoxX + 5, cardY + 8);

  doc.setDrawColor(...border);
  doc.setLineWidth(0.2);
  doc.line(leftBoxX + 5, cardY + 11, leftBoxX + leftBoxW - 5, cardY + 11);

  doc.setFont(FONT, "normal");
  doc.setFontSize(8.5);
  const rowLabelX = leftBoxX + 5;
  const rowValueX = leftBoxX + 22;
  let rowY = cardY + 17;

  doc.setTextColor(...secondary);
  doc.text("Address", rowLabelX, rowY);
  doc.setTextColor(...dark);
  doc.text(settings.address, rowValueX, rowY);

  rowY += 6;
  doc.setTextColor(...secondary);
  doc.text("Phone", rowLabelX, rowY);
  doc.setTextColor(...dark);
  doc.text(`+91 ${settings.phone}`, rowValueX, rowY);

  rowY += 6;
  doc.setTextColor(...secondary);
  doc.text("Email", rowLabelX, rowY);
  doc.setTextColor(...dark);
  doc.text(settings.email, rowValueX, rowY);

  // Right card — trust/authenticity note, same height as the left card now
  doc.setFillColor(...light);
  doc.setDrawColor(...border);
  doc.roundedRect(rightBoxX, cardY, rightBoxW, cardH, 2, 2, "FD");

  doc.setTextColor(...dark);
  doc.setFont(FONT, "bold");
  doc.setFontSize(10);
  doc.text("Business Information", rightBoxX + 5, cardY + 8);

  doc.setFont(FONT, "normal");
  doc.setFontSize(8);
  doc.setTextColor(...secondary);
  doc.text("Digitally Generated", rightBoxX + 5, cardY + 16);
  doc.text("No Signature Required", rightBoxX + 5, cardY + 23);
  doc.text(`Powered by ${BRAND_NAME}`, rightBoxX + 5, cardY + 29);

  /* ==========================================
     DIVIDER
  ========================================== */
  const dividerY = cardY + cardH + 6;
  doc.setDrawColor(...border);
  doc.line(PAGE_L, dividerY, PAGE_R, dividerY);

  /* ==========================================
     INVOICE META (invoice no / date / customer / phone)
  ========================================== */
  let metaY = dividerY + 8;
  const lineGap = 7;

  doc.setTextColor(...dark);
  doc.setFont(FONT, "bold");
  doc.setFontSize(10);
  doc.text(`Invoice No : ${invoice.invoiceId}`, PAGE_L, metaY);

  metaY += lineGap;
  doc.setFont(FONT, "normal");
  doc.text(`Date : ${new Date(invoice.createdAt).toLocaleDateString()}`, PAGE_L, metaY);

  metaY += lineGap;
  doc.text(`Customer : ${invoice.customer}`, PAGE_L, metaY);

  metaY += lineGap;
  doc.text(`Phone : +91 ${invoice.phone}`, PAGE_L, metaY);

  // Status badge — vertically centered against the full meta block, right-aligned
  const statusColor = invoice.status === "Paid" ? [22, 163, 74] : [234, 88, 12];
  const badgeW = 32;
  const badgeH = 10;
  const badgeX = PAGE_R - badgeW;
  const metaBlockTop = dividerY + 8 - 3.5;
  const metaBlockBottom = metaY + 2;
  const badgeY = (metaBlockTop + metaBlockBottom) / 2 - badgeH / 2;
  doc.setFillColor(...statusColor);
  doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 2, 2, "F");
  doc.setTextColor(...white);
  doc.setFont(FONT, "bold");
  doc.setFontSize(9);
  doc.text(invoice.status.toUpperCase(), badgeX + badgeW / 2, badgeY + 6.5, {
    align: "center",
  });

  /* ==========================================
     ITEMS TABLE (with automatic page breaks)
  ========================================== */
  let y = metaY + 14;

  function drawTableHeader(atY) {
    const rowH = 10;
    doc.setFillColor(...primary);
    doc.rect(PAGE_L, atY, PAGE_W, rowH, "F");
    doc.setTextColor(...white);
    doc.setFont(FONT, "bold");
    doc.setFontSize(10);
    doc.text("Qty", PAGE_L + 6, atY + 6.8);
    doc.text("Description", PAGE_L + 30, atY + 6.8);
    return atY + rowH;
  }

  y = drawTableHeader(y);

  doc.setFont(FONT, "normal");
  doc.setFontSize(10);

  const itemRowH = 9;
  invoice.items.forEach((item, idx) => {
    if (y + itemRowH > PAGE_BOTTOM) {
      y = addContinuationPage();
      y = drawTableHeader(y);
      doc.setFont(FONT, "normal");
      doc.setFontSize(10);
    }

    const parts = item.trim().split(/\s+/);
    const qty = parts.shift();
    const name = parts.join(" ");

    if (idx % 2 === 1) {
      doc.setFillColor(...light);
      doc.rect(PAGE_L, y, PAGE_W, itemRowH, "F");
    }
    doc.setTextColor(...dark);
    doc.text(String(qty), PAGE_L + 6, y + 6.2);
    doc.text(name, PAGE_L + 30, y + 6.2);
    y += itemRowH;
  });

  doc.setDrawColor(...border);
  doc.line(PAGE_L, y, PAGE_R, y);
  y += 10;

  /* ==========================================
     GRAND TOTAL
  ========================================== */
  y = ensureSpace(y, 14 + 14);

  const totalBoxW = 80;
  const totalBoxH = 14;
  const totalBoxX = PAGE_R - totalBoxW;
  doc.setFillColor(237, 242, 247);
  doc.roundedRect(totalBoxX, y, totalBoxW, totalBoxH, 2, 2, "F");
  doc.setFont(FONT, "bold");
  doc.setFontSize(11);
  doc.setTextColor(...dark);
  doc.text(
    `Grand Total : ${currency(invoice.amount)}`,
    totalBoxX + totalBoxW / 2,
    y + 9,
    { align: "center" }
  );

  y += totalBoxH + 14;

  /* ==========================================
     PAYMENT SECTION
     - Pending: show UPI details + scannable QR code
     - Paid: replace with a clean "Payment Received" confirmation
  ========================================== */
  const paymentSectionHeight = invoice.status === "Paid" ? 26 : 46;
  y = ensureSpace(y, paymentSectionHeight);

  if (invoice.status === "Paid") {
    const confirmH = 26;
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(...statusColor);
    doc.setLineWidth(0.4);
    doc.roundedRect(PAGE_L, y, PAGE_W, confirmH, 2, 2, "FD");

    const markCX = PAGE_L + 14;
    const markCY = y + confirmH / 2;
    doc.setFillColor(...statusColor);
    doc.circle(markCX, markCY, 5, "F");
    doc.setDrawColor(...white);
    doc.setLineWidth(0.8);
    doc.line(markCX - 2.3, markCY, markCX - 0.5, markCY + 2);
    doc.line(markCX - 0.5, markCY + 2, markCX + 2.6, markCY - 2.3);

    doc.setTextColor(...dark);
    doc.setFont(FONT, "bold");
    doc.setFontSize(12);
    doc.text("Payment Received", markCX + 12, y + 11);

    doc.setFont(FONT, "normal");
    doc.setFontSize(9);
    doc.setTextColor(...secondary);
    doc.text(
      `This invoice has been paid in full via UPI. Amount : ${currency(invoice.amount)}`,
      markCX + 12,
      y + 18
    );

    y += confirmH + 12;
  } else {
    const paymentBlockTop = y;

    doc.setFont(FONT, "bold");
    doc.setFontSize(11);
    doc.setTextColor(...dark);
    doc.text("Payment Details", PAGE_L, y);

    y += 8;
    doc.setFont(FONT, "normal");
    doc.setFontSize(10);
    doc.setTextColor(...secondary);
    doc.text("Payment Method : UPI", PAGE_L, y);

    y += 6;
    doc.text(`UPI ID : ${settings.upiId}`, PAGE_L, y);

    y += 6;
    doc.text(`Contact : +91 ${settings.phone}`, PAGE_L, y);

    const qrSize = 34;
    const qrX = PAGE_R - qrSize;
    const qrY = paymentBlockTop - 6;

    try {
      const upi = `upi://pay?pa=${settings.upiId}&pn=${encodeURIComponent(
        settings.businessName
      )}&am=${invoice.amount}&cu=INR`;
      const qr = await QRCode.toDataURL(upi);
      doc.addImage(qr, "PNG", qrX, qrY, qrSize, qrSize);
      doc.setFont(FONT, "normal");
      doc.setFontSize(9);
      doc.setTextColor(...secondary);
      doc.text("Scan to Pay", qrX + qrSize / 2, qrY + qrSize + 6, {
        align: "center",
      });
    } catch (err) {
      // QR generation can fail (e.g. missing UPI ID) — degrade gracefully
      // instead of crashing the whole PDF generation.
      doc.setFont(FONT, "normal");
      doc.setFontSize(9);
      doc.setTextColor(...secondary);
      doc.text("QR code unavailable — pay using the UPI ID above.", qrX - 30, qrY + 10);
    }

    y = Math.max(y, qrY + qrSize + 6) + 12;
  }

  /* ==========================================
     NOTES
  ========================================== */
  y = ensureSpace(y, 22);

  doc.setDrawColor(...primary);
  doc.setLineWidth(0.4);
  doc.line(PAGE_L, y, PAGE_R, y);
  y += 9;

  doc.setFont(FONT, "bold");
  doc.setFontSize(10);
  doc.setTextColor(...dark);
  doc.text("Notes", PAGE_L, y);

  y += 7;
  doc.setFont(FONT, "normal");
  doc.setFontSize(9);
  doc.setTextColor(...secondary);
  if (invoice.status === "Paid") {
    doc.text("• This invoice has been settled. Please retain this copy for your records.", PAGE_L + 4, y);
  } else {
    doc.text("• Please verify payment before marking the invoice as paid.", PAGE_L + 4, y);
  }
  y += 6;
  doc.text("• This invoice is electronically generated and does not require a signature.", PAGE_L + 4, y);

  /* ==========================================
     FOOTER (always on the last page)
  ========================================== */
  drawFooter();

  const fileSlug = settings.businessName.replace(/\s+/g, "");
  doc.save(`${fileSlug}_${invoice.invoiceId}_${invoice.customer}.pdf`);
}