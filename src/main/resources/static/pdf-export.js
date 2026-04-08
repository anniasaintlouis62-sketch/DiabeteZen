/**
 * Export PDF (jsPDF + autotable) — attache les helpers a window.DZ.
 * Requiert les scripts jspdf et jspdf-autotable charges avant ce fichier.
 */
(function () {
  function getJsPdfConstructor() {
    const j = window.jspdf;
    if (!j) return null;
    if (typeof j.jsPDF === "function") return j.jsPDF;
    return null;
  }

  function libsReady() {
    return !!getJsPdfConstructor();
  }

  function hasAutoTable(doc) {
    return typeof doc.autoTable === "function";
  }

  function pdfDateStamp() {
    const d = new Date();
    const p = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  }

  function defaultUserSubtitle() {
    const u = window.DZ && window.DZ.state && window.DZ.state.user;
    const id = u && (u.email || u.username || u.id);
    return id ? `${String(id)} · ${pdfDateStamp()}` : `DiabeteZen · ${pdfDateStamp()}`;
  }

  function showPdfError() {
    if (window.DZ && window.DZ.showMessage) {
      window.DZ.showMessage(
        "Export PDF indisponible (bibliotheques non chargees). Verifiez la connexion puis actualisez. / Ekspo PDF pa disponib. Verifye koneksyon epi aktyalize."
      );
    }
  }

  /**
   * @param {object} opts
   * @param {string} opts.title
   * @param {string} [opts.subtitle]
   * @param {string} opts.filename
   * @param {string[][]} opts.head
   * @param {string[][]} opts.body
   * @param {"portrait"|"landscape"} [opts.orientation]
   */
  function exportHistoryPdf(opts) {
    if (!libsReady()) {
      showPdfError();
      return false;
    }
    const JsPDF = getJsPdfConstructor();
    const doc = new JsPDF({
      orientation: opts.orientation || "portrait",
      unit: "mm",
      format: "a4"
    });
    if (!hasAutoTable(doc)) {
      showPdfError();
      return false;
    }
    const teal = [13, 148, 136];
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 14;
    const textW = pageW - margin * 2;
    let y = 14;
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text(opts.title, margin, y);
    y += 7;
    const sub = opts.subtitle != null ? opts.subtitle : defaultUserSubtitle();
    if (sub) {
      doc.setFontSize(9);
      doc.setTextColor(91, 107, 122);
      const subLines = doc.splitTextToSize(String(sub), textW);
      doc.text(subLines, margin, y);
      y += subLines.length * 4 + 5;
    }
    doc.setTextColor(0, 0, 0);
    doc.autoTable({
      startY: y,
      head: opts.head,
      body: opts.body,
      styles: { fontSize: 8, cellPadding: 1.5, overflow: "linebreak" },
      headStyles: { fillColor: teal, textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [240, 253, 250] },
      margin: { left: margin, right: margin }
    });
    doc.save(opts.filename);
    return true;
  }

  /**
   * @param {object} opts
   * @param {string} opts.title
   * @param {string} [opts.subtitle]
   * @param {string} opts.filename
   * @param {HTMLCanvasElement} [opts.canvas]
   * @param {string[][]} [opts.tableHead]
   * @param {string[][]} [opts.tableBody]
   */
  function exportChartHistoryPdf(opts) {
    if (!libsReady()) {
      showPdfError();
      return false;
    }
    const JsPDF = getJsPdfConstructor();
    const doc = new JsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    if (!hasAutoTable(doc)) {
      showPdfError();
      return false;
    }
    const teal = [13, 148, 136];
    const margin = 14;
    const pageW = doc.internal.pageSize.getWidth();
    const textW = pageW - margin * 2;
    let y = 12;
    doc.setFontSize(14);
    doc.text(opts.title, margin, y);
    y += 7;
    const sub = opts.subtitle != null ? opts.subtitle : defaultUserSubtitle();
    if (sub) {
      doc.setFontSize(9);
      doc.setTextColor(91, 107, 122);
      const sl = doc.splitTextToSize(String(sub), textW);
      doc.text(sl, margin, y);
      y += sl.length * 4 + 4;
    }
    doc.setTextColor(0, 0, 0);

    if (opts.canvas && !opts.canvas.classList.contains("hidden")) {
      try {
        const dataUrl = opts.canvas.toDataURL("image/png");
        const maxW = pageW - margin * 2;
        const ip = doc.getImageProperties(dataUrl);
        let imgW = maxW;
        let imgH = (ip.height / ip.width) * imgW;
        const maxH = 95;
        if (imgH > maxH) {
          imgH = maxH;
          imgW = (ip.width / ip.height) * imgH;
        }
        doc.addImage(dataUrl, "PNG", margin, y, imgW, imgH);
        y += imgH + 8;
      } catch {
        doc.setFontSize(10);
        doc.text("(Graphique non inclus dans le PDF)", margin, y);
        y += 8;
      }
    }

    if (opts.tableHead && opts.tableBody && opts.tableBody.length) {
      doc.autoTable({
        startY: y,
        head: opts.tableHead,
        body: opts.tableBody,
        styles: { fontSize: 8, cellPadding: 1.5, overflow: "linebreak" },
        headStyles: { fillColor: teal, textColor: 255 },
        margin: { left: margin, right: margin }
      });
    }
    doc.save(opts.filename);
    return true;
  }

  if (window.DZ) {
    window.DZ.pdfDateStamp = pdfDateStamp;
    window.DZ.exportHistoryPdf = exportHistoryPdf;
    window.DZ.exportChartHistoryPdf = exportChartHistoryPdf;
    window.DZ.pdfLibsReady = libsReady;
  }
})();
