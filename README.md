# Sistem Undangan Aqiqah (Statis + Google Sheets)

Sistem undangan digital 2 halaman:

- **`index.html`** — halaman undangan tamu. Contoh: `https://subdomain-anda.com/?to=Bapak+Hendra`
- **`send.html`** — halaman generator link, untuk Anda membuat & membagikan link ke tiap tamu.

Tidak ada server backend. Semua berjalan sebagai file statis (bisa di-host di GitHub Pages,
Netlify, Vercel, cPanel, dll). Satu-satunya bagian yang butuh "backend" — menyimpan nama
tamu ke Google Sheets — ditangani oleh **Google Apps Script** yang gratis dan tidak
memerlukan server sendiri.

---

## 1. Struktur File

```
aqiqah-undangan/
├── index.html          # Halaman undangan tamu
├── send.html            # Halaman generator link
├── config.js             # SEMUA pengaturan acara & URL Apps Script ada di sini
├── style.css              # Tampilan (tema hijau tua & emas, nuansa Islami)
├── script.js               # Logika: baca parameter, escaping, generator, koneksi Sheets
├── assets/                  # Taruh foto sampul & galeri Anda di sini
│   ├── cover.jpg
│   ├── gallery-1.jpg
│   ├── gallery-2.jpg
│   └── gallery-3.jpg
└── apps-script/
    └── Code.gs             # Kode backend untuk di-tempel ke Google Apps Script (BUKAN di-host)
```

> `apps-script/Code.gs` tidak diupload ke hosting statis Anda. Isinya disalin ke
> **script.google.com**, bukan ke GitHub Pages. Penjelasan lengkap ada di Bagian 3.

---

## 2. Kustomisasi Cepat

Buka **`config.js`** dan ubah bagian `EVENT`:

```js
EVENT: {
  childName: "Ameerah Athabina Zahidah",
  parentsName: "Bapak Abdulloh Azzahid & Ibu Meyreza Dwi Savitri",
  eventDateISO: "2026-09-13T09:00:00+07:00",
  dateDisplay: "Minggu, 13 September 2026",
  timeDisplay: "09.00 WIB – Selesai",
  venueName: "Kediaman Keluarga Besar",
  address: "Jl. Seruni Utara Klego Bantaran, kel. Kelgo, kec. Pekalongan Timur, Kota Pekalongan, Jawa Tengah",
  mapsUrl: "https://maps.google.com/?q=...",
  whatsappNumber: "6281313493890",
  ...
}
```

Ganti juga `BASE_URL` dengan domain final Anda (tanpa garis miring di akhir):

```js
BASE_URL: "https://aqiqah.namadomainanda.com",
```

Letakkan foto Anda di folder `assets/` dengan nama file yang sama seperti di `config.js`
(`cover.jpg`, `gallery-1.jpg`, dst.), atau ganti nama filenya di `config.js` sesuai foto Anda.

---

## 3. Menghubungkan Google Sheets (lewat Google Apps Script)

Kita **tidak** memakai Google Sheets API + API key langsung dari browser. Alasannya:
menulis data ke Sheets via API resmi membutuhkan OAuth, dan API key yang ditaruh di kode
publik (repo GitHub) bisa disalahgunakan. Solusi yang aman, gratis, dan cocok untuk hosting
statis adalah **Google Apps Script Web App** — semacam "mini backend" yang jalan di server
Google, bukan di komputer/hosting Anda.

### 3.1 Siapkan Spreadsheet

1. Buat Google Sheet baru, beri nama bebas (misal "Data Tamu Aqiqah").
2. Buat/pastikan ada tab bernama **`Tamu`** (nama ini dipakai di `Code.gs`, bisa Anda ubah
   di kedua tempat jika mau nama lain).
3. Baris pertama akan otomatis dibuatkan oleh skrip sebagai header:

   | Nama | Undangan Terkirim? | Sudah Dibuka? | Waktu Dibuat | Waktu Dibuka Terakhir |
   |------|--------------------|----------------|---------------|-------------------------|

   Anda tidak perlu mengisi header manual — skrip akan membuatnya otomatis saat data pertama masuk.

### 3.2 Tempel Kode Backend

1. Di Google Sheet Anda: **Ekstensi → Apps Script**.
2. Hapus kode contoh (`function myFunction() {...}`) yang ada di editor.
3. Salin seluruh isi file **`apps-script/Code.gs`** dari proyek ini, tempel ke editor Apps Script.
4. Simpan (ikon disket / `Ctrl+S`). Beri nama proyek bebas, misal "Backend Aqiqah".

### 3.3 Deploy sebagai Web App

1. Klik tombol **Deploy → New deployment** (Sebarkan → Sebarkan baru) di kanan atas.
2. Klik ikon gerigi di samping "Select type", pilih **Web app**.
3. Isi:
   - **Description**: bebas, misal "v1"
   - **Execute as**: **Me (akun Anda)**
   - **Who has access**: **Anyone** (wajib "Anyone", bukan "Anyone with Google account",
     supaya halaman statis Anda — yang diakses tanpa login Google — bisa memanggilnya)
4. Klik **Deploy**. Google akan meminta Anda memberi izin (Authorize access) — ini normal,
   karena skrip perlu izin membaca/menulis ke Spreadsheet milik Anda sendiri.
5. Setelah deploy selesai, Anda akan mendapat **Web app URL** seperti:
   ```
   https://script.google.com/macros/s/AKfycbx.../exec
   ```
6. Salin URL tersebut, tempel ke `config.js`:
   ```js
   APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycby0oCh-1tgaEt48u_9Qll923J-1YL5x-sb08Iis7Ors_l6iq5GpGmnLVxRpmp6LuiJL2g/exec",
   ```

### 3.4 Setiap Kali Anda Mengubah `Code.gs`

Apps Script tidak otomatis memperbarui deployment lama. Setelah mengedit kode:
`Deploy → Manage deployments → (pilih deployment aktif) → ikon pensil → Version: New version → Deploy`.
URL Web App **tidak berubah**, jadi `config.js` tidak perlu diedit ulang.

### 3.5 Batasan Akses Baca vs Tulis

Karena ini backend sederhana (satu Web App untuk kedua halaman), pembagian akses read/write
diatur di dalam kode `Code.gs`, bukan lewat kunci API terpisah:

- **Halaman undangan (`index.html`)** hanya memanggil `action=markOpened` (POST) — hanya
  boleh mengubah kolom "Sudah Dibuka?", tidak bisa membaca isi Sheet sama sekali.
- **Halaman generator (`send.html`)** memanggil `action=addGuest` (POST) dan
  `action=listGuests` (GET) — untuk menambah tamu dan menampilkan riwayat.

Jika Anda ingin **send.html tidak bisa diakses publik** (karena bisa menulis ke Sheet Anda),
lindungi halaman itu sendiri, contoh sederhana:
- Taruh `send.html` di path yang tidak ditautkan dari mana pun dan tidak disebar,
- atau proteksi dengan `.htpasswd` jika hosting Anda mendukung (GitHub Pages murni tidak
  mendukung ini — gunakan Netlify/Cloudflare Pages dengan fitur access control jika perlu
  proteksi login),
- atau tambahkan pengecekan kata sandi sederhana di `script.js` sebelum form generator aktif
  (catatan: ini hanya penghalang ringan, bukan keamanan sungguhan, karena kode berjalan di
  browser pengguna).

---

## 4. Menjalankan di Lokal (opsional, untuk pratinjau)

Karena `fetch()` butuh server (bukan `file://`), jalankan server statis sederhana:

```bash
# Python 3
python3 -m http.server 8080

# atau Node.js
npx serve .
```

Lalu buka:
- `http://localhost:8080/?to=Nama+Tamu`
- `http://localhost:8080/send.html`

---

## 5. Deploy ke GitHub Pages

1. Buat repository baru di GitHub, upload semua isi folder ini (kecuali Anda **boleh**
   tetap menyertakan `apps-script/Code.gs` di repo sebagai dokumentasi — file ini aman
   untuk publik karena tidak mengandung kredensial apa pun, hanya logika).
2. Di repo: **Settings → Pages**.
3. **Source**: `Deploy from a branch` → pilih branch `main` dan folder `/ (root)`.
4. Simpan. GitHub akan memberi URL seperti `https://username.github.io/nama-repo/`.
5. **Menghubungkan subdomain sendiri** (misal `aqiqah.namadomainanda.com`):
   - Di **Settings → Pages → Custom domain**, isi subdomain Anda.
   - Di pengaturan DNS domain Anda, tambahkan record `CNAME` yang mengarah ke
     `username.github.io`.
   - Tunggu propagasi DNS (bisa beberapa menit hingga beberapa jam), lalu aktifkan
     **Enforce HTTPS** di GitHub Pages setelah sertifikat siap.
6. Setelah domain aktif, pastikan `BASE_URL` di `config.js` sudah sesuai domain final ini,
   lalu commit & push ulang.

*(Instruksi di atas murni langkah teknis kode/konfigurasi — pembuatan akun GitHub/domain
tetap Anda lakukan sendiri sesuai kebutuhan.)*

---

## 6. Keamanan & Catatan Penting

- **XSS aman**: nama tamu dari parameter `?to=` dibersihkan (`sanitizeGuestName`) dan selalu
  dimasukkan ke halaman lewat `element.textContent`, **bukan** `innerHTML`. Ini mencegah
  penyisipan tag `<script>` atau HTML lain lewat URL.
- **Tidak ada API key di frontend**: karena memakai Apps Script Web App, tidak ada kredensial
  rahasia yang perlu disembunyikan di `config.js`. URL Web App boleh publik — ia hanya bisa
  melakukan aksi yang secara eksplisit Anda program di `Code.gs` (`addGuest`, `markOpened`,
  `listGuests`), tidak bisa dipakai untuk mengakses data Google Anda yang lain.
- **Batasi spam**: jika khawatir orang asing memanggil `action=addGuest` berulang kali,
  Anda bisa menambahkan rate-limit sederhana di `Code.gs` (misalnya, cek apakah nama yang
  sama sudah pernah ditambahkan dalam 1 menit terakhir) — beri tahu saya jika ingin saya
  tambahkan versi ini.
- **Ganti nama tab Sheet**: jika Anda mengganti nama tab dari `Tamu` ke nama lain, ubah juga
  konstanta `SHEET_NAME` di baris atas `Code.gs`.

---

## 7. Format Spreadsheet Ringkas

| Kolom | Nama | Diisi Otomatis Oleh | Keterangan |
|-------|------|----------------------|------------|
| A | Nama | `send.html` (saat submit) | Nama tamu |
| B | Undangan Terkirim? | manual (opsional) | Anda centang manual jika sudah kirim WA |
| C | Sudah Dibuka? | `index.html` (otomatis) | `TRUE` saat tamu membuka link undangannya |
| D | Waktu Dibuat | `send.html` | Timestamp saat link dibuat |
| E | Waktu Dibuka Terakhir | `index.html` | Timestamp terakhir tamu membuka undangan |

---

Selamat, sistem undangan Anda siap dipakai. Jika ingin fitur tambahan (buku tamu ucapan,
proteksi kata sandi di `send.html`, dukungan multi-bahasa, atau tema warna lain), tinggal
sesuaikan `config.js` / `style.css`, atau minta saya tambahkan.
