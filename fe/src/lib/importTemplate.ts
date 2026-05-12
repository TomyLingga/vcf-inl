import * as XLSX from "xlsx";

/**
 * Parses an Excel file, maps each row using `mapRow`, then calls `createFn` per row.
 * Shows a toast-style result via alert. Returns { success, failed, errors }.
 */
export async function parseAndImportExcel<T extends object>(
  file: File,
  mapRow: (row: Record<string, any>) => T | null,
  createFn: (data: T) => Promise<any>,
  onProgress?: (done: number, total: number) => void
): Promise<{ success: number; failed: number; errors: string[] }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const wb = XLSX.read(evt.target?.result, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws) as Record<string, any>[];

        let success = 0;
        let failed = 0;
        const errors: string[] = [];

        for (let i = 0; i < rows.length; i++) {
          const mapped = mapRow(rows[i]);
          if (!mapped) {
            failed++;
            errors.push(`Baris ${i + 2}: Data tidak valid, dilewati.`);
            continue;
          }
          try {
            await createFn(mapped);
            success++;
          } catch (err: any) {
            failed++;
            const msg = err?.response?.data?.message || err?.message || "Error tidak diketahui";
            errors.push(`Baris ${i + 2}: ${msg}`);
          }
          onProgress?.(i + 1, rows.length);
        }

        resolve({ success, failed, errors });
      } catch {
        resolve({ success: 0, failed: 0, errors: ["Gagal membaca file Excel. Pastikan format file benar."] });
      }
    };
    reader.readAsBinaryString(file);
  });
}

export function downloadImportTemplate(
  filename: string,
  headers: string[],
  sampleRows: (string | number | boolean)[][]
) {
  const wsData = [headers, ...sampleRows.map(row => row.map(v => (v === true ? "Ya" : v === false ? "Tidak" : v)))];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Bold header row style
  const headerRange = XLSX.utils.decode_range(ws["!ref"] || "A1");
  for (let c = headerRange.s.c; c <= headerRange.e.c; c++) {
    const cellAddr = XLSX.utils.encode_cell({ r: 0, c });
    if (!ws[cellAddr]) continue;
    ws[cellAddr].s = { font: { bold: true }, fill: { fgColor: { rgb: "1A1A1A" } } };
  }

  // Auto column widths
  ws["!cols"] = headers.map((h, i) => ({
    wch: Math.max(h.length + 4, ...sampleRows.map(r => String(r[i] ?? "").length + 2)),
  }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Template");

  // Add info sheet
  const infoData = [
    ["PETUNJUK IMPORT DATA"],
    [""],
    ["1. Isi data mulai dari baris ke-2 (baris pertama adalah header, jangan diubah)"],
    ["2. Kolom bertanda * wajib diisi"],
    ["3. Kolom Status: isi dengan 'Ya' (aktif) atau 'Tidak' (nonaktif)"],
    ["4. Hapus baris contoh sebelum mengimport"],
    ["5. Simpan file dalam format .xlsx sebelum diimport"],
  ];
  const wsInfo = XLSX.utils.aoa_to_sheet(infoData);
  wsInfo["!cols"] = [{ wch: 70 }];
  XLSX.utils.book_append_sheet(wb, wsInfo, "Petunjuk");

  XLSX.writeFile(wb, `${filename}_template.xlsx`);
}
