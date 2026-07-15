import jsPDF from "jspdf";
import QRCode from "qrcode";

export async function generateInvoice(invoice, settings) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  // ---------- Palette ----------
  const primary = [7, 94, 84];
  const secondary = [71, 85, 105];
  const light = [248, 250, 252];
  const border = [226, 232, 240];
  const dark = [17, 24, 39];
  const white = [255, 255, 255];
  const statusColor = [34, 197, 94]; // Green

  const PAGE_L = 20;
  const PAGE_R = 190;
  const PAGE_W = PAGE_R - PAGE_L; // 170

  // jsPDF's core "helvetica" font has no ₹ glyph — it silently falls back
  // to an unrelated character (which is why you saw "'70" instead of "₹70").
  // Safest fix without embedding a custom font is to use "Rs."
  const currency = (n) => `Rs. ${n}`;

  /* ==========================================
     HEADER
  ========================================== */
  doc.setFillColor(...primary);
  doc.rect(0, 0, 210, 36, "F");

  doc.setTextColor(...white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("ApnaKhata", PAGE_L, 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("WhatsApp Smart Billing System", PAGE_L, 23);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.text("INVOICE", PAGE_R, 18, { align: "right" });

  doc.setDrawColor(...white);
  doc.setLineWidth(0.4);
  doc.line(PAGE_L, 29, PAGE_R, 29);

 /* ==========================================
   BUSINESS + INVOICE SUMMARY
========================================== */

let y = 50;

// Business Name
doc.setTextColor(...dark);
doc.setFont("helvetica", "bold");
doc.setFontSize(18);
doc.text(settings.businessName.toUpperCase(), PAGE_L, y);

y += 2;

// Owner
doc.setFont("helvetica", "normal");
doc.setFontSize(10);
doc.setTextColor(...secondary);


y += 6;

// Address
doc.text(settings.address, PAGE_L, y);

y += 6;

// Phone
doc.text(`Phone : +91 ${settings.phone}`, PAGE_L, y);

y += 6;

// Email
doc.text(settings.email, PAGE_L, y);



/* ---------- Invoice Card ---------- */

const cardX = 125;
const cardY = 43;
const cardW = 65;
const cardH = 40;

doc.setFillColor(...light);
doc.setDrawColor(...border);
doc.roundedRect(cardX, cardY, cardW, cardH, 2, 2, "FD");

doc.setTextColor(...dark);

doc.setFont("helvetica", "bold");
doc.setFontSize(10);
doc.text("Invoice Details", cardX + 5, cardY + 8);

doc.setFont("helvetica", "normal");
doc.setFontSize(9);

doc.text(`Invoice : ${invoice.invoiceId}`, cardX + 5, cardY + 16);

doc.text(
  `Date : ${new Date(invoice.createdAt).toLocaleDateString()}`,
  cardX + 5,
  cardY + 24
);

doc.text(
  `Status : ${invoice.status}`,
  cardX + 5,
  cardY + 32
);



/* ---------- Divider ---------- */

y = 90;

doc.setDrawColor(...border);
doc.line(PAGE_L, y, PAGE_R, y);

y += 10;



/* ---------- Bill To ---------- */

doc.setTextColor(...dark);
doc.setFont("helvetica", "bold");
doc.setFontSize(11);
doc.text("Bill To", PAGE_L, y);

y += 8;

doc.setFont("helvetica", "normal");
doc.setFontSize(10);

doc.text(`Customer : ${invoice.customer}`, PAGE_L, y);

y += 7;

doc.text(`Phone : +91 ${invoice.phone}`, PAGE_L, y);

y += 12;

  /* ==========================================
     ITEMS TABLE
  ========================================== */
// y is already positioned below Bill To

  const rowH = 10;
  doc.setFillColor(...primary);
  doc.rect(PAGE_L, y, PAGE_W, rowH, "F");
  doc.setTextColor(...white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Quantity", PAGE_L + 6, y + 6.8);
doc.text("Description", PAGE_L + 42, y + 6.8);

  y += rowH;

  doc.setTextColor(...dark);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  /*invoice.items.forEach((item, idx) => {
    const parts = item.trim().split(/\s+/);
    const qty = parts.shift();
    const name = parts.join(" ");

    const itemRowH = 9;
    // zebra striping for readability
    if (idx % 2 === 1) {
      doc.setFillColor(...light);
      doc.rect(PAGE_L, y, PAGE_W, itemRowH, "F");
    }
    doc.setTextColor(...dark);
    doc.text(String(qty), PAGE_L + 6, y + 6.2);
    doc.text(name, PAGE_L + 30, y + 6.2);
    y += itemRowH;
  });*/
  const units = [
  "kg",
  "gm",
  "g",
  "l",
  "ml",
  "dozen",
  "piece",
  "pieces",
  "pcs",
  "packet",
  "pack",
  "box",
  "boxes",
  "bottle",
  "bottles"
];

invoice.items.forEach((item, idx) => {

  const words = item.trim().split(/\s+/);

  let qty = "";
  let description = "";

  // Example: 2kg Chicken Curry
  if (/^\d+(\.\d+)?[a-zA-Z]+$/i.test(words[0])) {

    qty = words[0];
    description = words.slice(1).join(" ");

  }

  // Example: 2 Dozen Banana
  else if (
    words.length > 2 &&
    !isNaN(words[0]) &&
    units.includes(words[1].toLowerCase())
  ) {

    qty = `${words[0]} ${words[1]}`;
    description = words.slice(2).join(" ");

  }

  // Example: 2 Coke
  else if (!isNaN(words[0])) {

    qty = words[0];
    description = words.slice(1).join(" ");

  }

  // Example: Coke
  else {

    qty = "1";
    description = item;

  }

  const itemRowH = 9;

  if (idx % 2 === 1) {

    doc.setFillColor(...light);

    doc.rect(PAGE_L, y, PAGE_W, itemRowH, "F");

  }

  doc.setTextColor(...dark);

  doc.text(qty, PAGE_L + 6, y + 6.2);

  doc.text(description, PAGE_L + 42, y + 6.2);

  y += itemRowH;

});
  doc.setDrawColor(...border);
  doc.line(PAGE_L, y, PAGE_R, y);
  y += 10;

  /* ==========================================
     GRAND TOTAL
  ========================================== */
  const totalBoxW = 80;
  const totalBoxH = 14;
  const totalBoxX = PAGE_R - totalBoxW;
  doc.setFillColor(237, 242, 247);
  doc.roundedRect(totalBoxX, y, totalBoxW, totalBoxH, 2, 2, "F");
  doc.setFont("helvetica", "bold");
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
     - Paid: QR/UPI info is no longer relevant, so replace it with a clean
       "Payment Received" confirmation instead
  ========================================== */
  if (invoice.status === "Paid") {
    const confirmH = 26;
    doc.setFillColor(240, 253, 244); // light green tint
    doc.setDrawColor(...statusColor);
    doc.setLineWidth(0.4);
    doc.roundedRect(PAGE_L, y, PAGE_W, confirmH, 2, 2, "FD");

    // checkmark badge
    const markCX = PAGE_L + 14;
    const markCY = y + confirmH / 2;
    doc.setFillColor(...statusColor);
    doc.circle(markCX, markCY, 5, "F");
    doc.setDrawColor(...white);
    doc.setLineWidth(0.8);
    doc.line(markCX - 2.3, markCY, markCX - 0.5, markCY + 2);
    doc.line(markCX - 0.5, markCY + 2, markCX + 2.6, markCY - 2.3);

    doc.setTextColor(...dark);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Payment Received", markCX + 12, y + 11);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...secondary);
    doc.text(
      `This invoice has been paid. Amount : ${currency(invoice.amount)}`,
      markCX + 12,
      y + 18
    );

    y += confirmH + 12;
  } else {
    const paymentBlockTop = y;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...dark);
    doc.text("Payment Details", PAGE_L, y);

    y += 8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...secondary);
    

    y += 6;
    doc.text(`UPI ID : ${settings.upiId}`, PAGE_L, y);

    y += 6;
    doc.text(`Mobile No : ${settings.phone}`, PAGE_L, y);

    // QR code, aligned to the top of the "Payment Details" block, on the right
    const qrSize = 34;
    const qrX = PAGE_R - qrSize;
    const qrY = paymentBlockTop - 6;

    const upi = `upi://pay?pa=${settings.upiId}&pn=${encodeURIComponent(
      settings.businessName
    )}&am=${invoice.amount}&cu=INR`;
    const qr = await QRCode.toDataURL(upi);
    doc.addImage(qr, "PNG", qrX, qrY, qrSize, qrSize);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...secondary);
    doc.text("Scan to Pay", qrX + qrSize / 2, qrY + qrSize + 6, {
      align: "center",
    });

    y = Math.max(y, qrY + qrSize + 6) + 12;
  }

  /* ==========================================
     NOTES
  ========================================== */
  doc.setDrawColor(...primary);
  doc.setLineWidth(0.4);
  doc.line(PAGE_L, y, PAGE_R, y);
  y += 9;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...dark);
  doc.text("Notes", PAGE_L, y);

  y += 7;
  doc.setFont("helvetica", "normal");
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
     FOOTER (fixed to bottom of page)
  ========================================== */
  doc.setTextColor(...dark);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Thank you for your business.", 105, 282, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.text(`${settings.businessName.toUpperCase()} | ApnaKhata`, 105, 288, {
    align: "center",
  });

  doc.save(`HomeKitchen_${invoice.invoiceId}_${invoice.customer}.pdf`);
}