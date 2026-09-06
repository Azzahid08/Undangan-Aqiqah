/**
 * =============================================================================
 * Code.gs — Backend Google Apps Script untuk Sistem Undangan Aqiqah
 * =============================================================================
 * File ini TIDAK dijalankan di GitHub Pages. Salin isinya ke Google Apps
 * Script (script.google.com) yang terhubung ke Google Sheets Anda, lalu
 * deploy sebagai "Web App". Lihat README.md bagian "Menghubungkan Google
 * Sheets" untuk langkah lengkap.
 *
 * Fungsi:
 *  - doPost  -> dipanggil send.html untuk menyimpan tamu baru (addGuest)
 *               dan oleh index.html untuk menandai undangan dibuka (markOpened)
 *  - doGet   -> dipanggil send.html untuk mengambil daftar tamu (listGuests)
 *
 * Struktur kolom di Sheet (baris 1 = header, dibuat otomatis jika kosong):
 *   A: Nama
 *   B: Undangan Terkirim?   (TRUE/FALSE — diisi manual/opsional oleh Anda)
 *   C: Sudah Dibuka?        (TRUE/FALSE — diisi otomatis oleh sistem)
 *   D: Waktu Dibuat
 *   E: Waktu Dibuka Terakhir
 * =============================================================================
 */

const SHEET_NAME = "Tamu"; // ganti jika nama sheet/tab Anda berbeda

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Nama",
      "Undangan Terkirim?",
      "Sudah Dibuka?",
      "Waktu Dibuat",
      "Waktu Dibuka Terakhir"
    ]);
  }
  return sheet;
}

function jsonResponse_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Menangani permintaan GET.
 * Contoh: {WEB_APP_URL}?action=listGuests
 */
function doGet(e) {
  const action = e.parameter.action;

  if (action === "listGuests") {
    const sheet = getSheet_();
    const values = sheet.getDataRange().getValues();
    const guests = [];
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      if (!row[0]) continue; // lewati baris kosong
      guests.push({
        name: row[0],
        sent: row[1] === true || row[1] === "TRUE",
        opened: row[2] === true || row[2] === "TRUE",
        createdAt: row[3] || "",
        lastOpenedAt: row[4] || ""
      });
    }
    return jsonResponse_({ guests: guests });
  }

  return jsonResponse_({ error: "Aksi tidak dikenali" });
}

/**
 * Menangani permintaan POST.
 * Body berupa JSON: { "action": "addGuest" | "markOpened", "name": "..." }
 */
function doPost(e) {
  let payload;
  try {
    payload = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonResponse_({ error: "Body request tidak valid" });
  }

  const action = payload.action;
  const name = (payload.name || "").toString().trim().slice(0, 80);

  if (!name) {
    return jsonResponse_({ error: "Nama tidak boleh kosong" });
  }

  const sheet = getSheet_();

  if (action === "addGuest") {
    sheet.appendRow([name, false, false, new Date(), ""]);
    return jsonResponse_({ success: true });
  }

  if (action === "markOpened") {
    const values = sheet.getDataRange().getValues();
    let found = false;
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] === name) {
        sheet.getRange(i + 1, 3).setValue(true);       // kolom C: Sudah Dibuka?
        sheet.getRange(i + 1, 5).setValue(new Date());  // kolom E: Waktu Dibuka Terakhir
        found = true;
        break;
      }
    }
    // Jika nama belum ada di sheet (tamu membuka link yang dibuat manual),
    // tetap catat sebagai baris baru agar tidak ada data yang hilang.
    if (!found) {
      sheet.appendRow([name, false, true, new Date(), new Date()]);
    }
    return jsonResponse_({ success: true });
  }

  return jsonResponse_({ error: "Aksi tidak dikenali" });
}
