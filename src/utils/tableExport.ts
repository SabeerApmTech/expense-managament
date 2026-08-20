import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ExportSection {
  /** Group header text (e.g. expense code, employee name). Omit for a flat, ungrouped table. */
  heading?: string;
  /** Extra text shown alongside the heading (e.g. "Submitted 20 Aug 2026 - Total Rs.1,000"). */
  meta?: string;
  columns: string[];
  rows: (string | number)[][];
}

// jsPDF's default fonts use WinAnsi (cp1252) encoding, which covers plain ASCII plus
// accented Latin letters (é, ñ, ü, ...) up to code point 0xFF directly. "Smart"
// punctuation from copy-pasted text (curly quotes, en/em dash, ellipsis) is normalized
// to its ASCII equivalent first. Anything else beyond 0xFF — most commonly typographic
// ligatures like "ﬁ"/"ﬂ" (U+FB01/FB02, which some source text uses in place of plain
// "fi"/"fl" and rendered fine in the browser, but not in jsPDF's font) — is run through
// Unicode compatibility decomposition to recover its plain-ASCII form (e.g. "ﬁ" -> "fi")
// before falling back to '?' for anything that still doesn't fit.
const PUNCTUATION_MAP: Record<string, string> = {
  '‘': "'", '’': "'", '“': '"', '”': '"',
  '–': '-', '—': '-', '…': '...',
};
// Combining Diacritical Marks block — stripped after NFKD decomposition so an accented
// letter that decomposes to base+mark (e.g. one already handled directly, or one from a
// script the direct check missed) degrades to its plain base letter instead of leaving
// a stray unrenderable mark behind.
const COMBINING_MARKS_RE = new RegExp('[̀-ͯ]', 'g');

function toPdfSafeChar(char: string): string {
  if (char.charCodeAt(0) <= 0xff) return char;
  const decomposed = char.normalize('NFKD').replace(COMBINING_MARKS_RE, '');
  if (decomposed && Array.from(decomposed).every((c) => c.charCodeAt(0) <= 0xff)) return decomposed;
  return '?';
}
export const pdfSafe = (value: unknown): string =>
  Array.from(
    String(value ?? '')
      .replace(/₹/g, 'Rs. ')
      .replace(/[‘’“”–—…]/g, (m) => PUNCTUATION_MAP[m]),
    toPdfSafeChar
  ).join('');

export function exportGroupedPDF(filename: string, sections: ExportSection[]) {
  const nonEmpty = sections.filter((s) => s.rows.length > 0);
  if (nonEmpty.length === 0) return;

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(pdfSafe(filename || 'Export'), 14, 18);
  let y = 28;

  nonEmpty.forEach((section) => {
    if (y > pageHeight - 40) {
      doc.addPage();
      y = 18;
    }
    if (section.heading) {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0);
      doc.text(pdfSafe(section.heading), 14, y);
      if (section.meta) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(110);
        doc.text(pdfSafe(section.meta), pageWidth - 14, y, { align: 'right' });
        doc.setTextColor(0);
      }
      y += 5;
    }

    autoTable(doc, {
      head: [section.columns],
      body: section.rows.map((row) => row.map(pdfSafe)),
      startY: y,
      theme: 'grid',
      styles: { fontSize: 7, cellPadding: 2, lineColor: [200, 200, 200], lineWidth: 0.1 },
      headStyles: { fillColor: [26, 59, 204], textColor: 255, fontStyle: 'bold', lineColor: [26, 59, 204] },
      alternateRowStyles: { fillColor: [248, 249, 255] },
      margin: { left: 14, right: 14 },
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  });

  doc.save((filename || 'export') + '.pdf');
}

const xmlEscape = (value: unknown): string =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const cellXml = (value: unknown, styleId?: string): string =>
  `<Cell${styleId ? ` ss:StyleID="${styleId}"` : ''}><Data ss:Type="String">${xmlEscape(value)}</Data></Cell>`;

// Builds a plain "SpreadsheetML" (Excel 2003 XML) workbook — no external library needed,
// and Excel opens it natively (double-click, or File > Open) with real bold/colored cells.
export function exportGroupedExcel(filename: string, sections: ExportSection[]) {
  const nonEmpty = sections.filter((s) => s.rows.length > 0);
  if (nonEmpty.length === 0) return;

  const rowsXml: string[] = [];
  nonEmpty.forEach((section) => {
    const colCount = Math.max(section.columns.length, 1);
    if (section.heading) {
      const label = section.meta ? `${section.heading}   ·   ${section.meta}` : section.heading;
      rowsXml.push(
        `<Row><Cell ss:StyleID="GroupHeading" ss:MergeAcross="${colCount - 1}"><Data ss:Type="String">${xmlEscape(label)}</Data></Cell></Row>`
      );
    }
    rowsXml.push(`<Row>${section.columns.map((c) => cellXml(c, 'Heading')).join('')}</Row>`);
    section.rows.forEach((row) => rowsXml.push(`<Row>${row.map((v) => cellXml(v)).join('')}</Row>`));
    rowsXml.push('<Row></Row>');
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="Heading">
   <Font ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#1A3BCC" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="GroupHeading">
   <Font ss:Bold="1"/>
   <Interior ss:Color="#F0F4FF" ss:Pattern="Solid"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Export">
  <Table>
${rowsXml.join('\n')}
  </Table>
 </Worksheet>
</Workbook>`;

  // Prefix a UTF-8 BOM — without it, Excel sometimes falls back to the system ANSI
  // codepage when opening the file and renders non-ASCII characters (accented names,
  // "₹") as "?".
  const blob = new Blob([String.fromCharCode(0xfeff) + xml], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = (filename || 'export') + '.xls';
  a.click();
  URL.revokeObjectURL(url);
}
