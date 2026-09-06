/* =========================================================================
   script.js
   -------------------------------------------------------------------------
   Logika bersama untuk index.html (halaman undangan) dan send.html
   (halaman generator link). Murni JavaScript, tanpa framework.
   ========================================================================= */

/* -------------------------------------------------------------------------
   UTIL: Ambil parameter dari URL dengan aman
------------------------------------------------------------------------- */
function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

/* -------------------------------------------------------------------------
   UTIL: Bersihkan nama tamu dari karakter yang tidak wajar.
   Kita TIDAK meng-encode HTML manual di sini karena semua nilai akan
   dimasukkan ke DOM lewat textContent (bukan innerHTML), sehingga browser
   sendiri yang menjamin tidak ada tag/skrip yang dieksekusi. Fungsi ini
   hanya merapikan spasi berlebih dan membatasi panjang agar tidak dipakai
   untuk menyisipkan teks yang tidak wajar.
------------------------------------------------------------------------- */
function sanitizeGuestName(rawName) {
  if (!rawName) return "";
  let name = rawName.toString().trim();
  name = name.replace(/\s+/g, " ");   // rapikan spasi ganda
  name = name.slice(0, 80);           // batasi panjang wajar untuk nama
  return name;
}

/* -------------------------------------------------------------------------
   UTIL: Set teks ke elemen dengan aman (mencegah XSS).
   SELALU gunakan fungsi ini (bukan innerHTML) untuk menampilkan input
   yang berasal dari URL/pengguna, seperti parameter "to".
------------------------------------------------------------------------- */
function setSafeText(elementId, text) {
  const el = document.getElementById(elementId);
  if (el) el.textContent = text;
}

/* -------------------------------------------------------------------------
   HALAMAN UNDANGAN (index.html)
------------------------------------------------------------------------- */
function initInvitationPage() {
  const ev = CONFIG.EVENT;

  // 1) Nama tamu dari parameter ?to=
  const rawGuest = getQueryParam("to");
  const guestName = sanitizeGuestName(rawGuest) || "Bapak/Ibu/Saudara/i";

  setSafeText("guestName", guestName);
  document.title = `Undangan Aqiqah ${ev.childNickname} — untuk ${guestName}`;

  // 2) Isi detail acara (semua berasal dari config.js yang kita kontrol sendiri,
  //    jadi aman dipakai langsung, bukan dari input pengguna)
  setSafeText("childName", ev.childName);
  setSafeText("parentsName", ev.parentsName);
  setSafeText("dateDisplay", ev.dateDisplay);
  setSafeText("timeDisplay", ev.timeDisplay);
  setSafeText("venueName", ev.venueName);
  setSafeText("address", ev.address);
  setSafeText("invitationMessage", ev.invitationMessage);
  setSafeText("closingMessage", ev.closingMessage);

  if (ev.openingVerse) {
    setSafeText("openingVerse", ev.openingVerse);
    setSafeText("openingVerseSource", `— ${ev.openingVerseSource}`);
  }

  const mapsLink = document.getElementById("mapsLink");
  if (mapsLink) mapsLink.href = ev.mapsUrl;

  const coverImg = document.getElementById("coverImage");
  if (coverImg) coverImg.src = ev.coverImage;

  renderGallery(ev.galleryImages);
  setupCalendarButton(ev);
  setupWhatsappButton(ev, guestName);
  startCountdown(ev.eventDateISO);

  // 3) (Opsional) Catat bahwa undangan ini sudah dibuka, ke Google Sheets.
  //    Silakan hapus baris ini jika Anda tidak ingin melacak siapa yang membuka.
  if (rawGuest) {
    logGuestOpened(guestName);
  }

  // Di dalam initInvitationPage(), tambahkan:
setSafeText("overlayChildName", ev.childName);
setSafeText("overlayGuestName", guestName);

const overlay = document.getElementById("welcomeOverlay");
const openBtn = document.getElementById("openInviteBtn");
const bgMusic = document.getElementById("bgMusic");

// Kunci scroll body saat overlay aktif
document.body.style.overflow = "hidden";

if (openBtn && overlay) {
  openBtn.addEventListener("click", () => {
    overlay.classList.add("opened");
    document.body.style.overflow = "auto"; // Kembalikan scroll
    
    // Putar musik jika ada
    if (bgMusic) {
      bgMusic.play().catch(e => console.log("Autoplay audio dicegah oleh browser"));
    }
    
    // Inisiasi animasi scroll setelah undangan dibuka
    setupScrollAnimations();
  });
}
}

function setupScrollAnimations() {
  const reveals = document.querySelectorAll(".reveal");
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
        observer.unobserve(entry.target); // Animasi hanya berjalan sekali
      }
    });
  }, {
    threshold: 0.15, // Trigger saat 15% elemen terlihat
    rootMargin: "0px 0px -50px 0px"
  });

  reveals.forEach((el) => observer.observe(el));
}

function renderGallery(images) {
  const wrap = document.getElementById("gallery");
  if (!wrap || !Array.isArray(images)) return;
  wrap.innerHTML = ""; // aman: sumbernya config.js, bukan input pengguna
  images.forEach((src) => {
    const img = document.createElement("img");
    img.src = src;
    img.alt = "Galeri foto";
    img.loading = "lazy";
    wrap.appendChild(img);
  });
}

function setupCalendarButton(ev) {
  const btn = document.getElementById("addToCalendar");
  if (!btn) return;
  const start = new Date(ev.eventDateISO);
  const end = new Date(start.getTime() + 3 * 60 * 60 * 1000); // asumsi 3 jam
  const fmt = (d) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const text = encodeURIComponent(`Aqiqah ${ev.childName}`);
  const details = encodeURIComponent(ev.invitationMessage);
  const location = encodeURIComponent(ev.address);
  const url =
    `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}` +
    `&dates=${fmt(start)}/${fmt(end)}&details=${details}&location=${location}`;
  btn.href = url;
}

function setupWhatsappButton(ev, guestName) {
  const btn = document.getElementById("waConfirm");
  if (!btn || !ev.whatsappNumber) return;
  const msg = encodeURIComponent(
    `Assalamu'alaikum, saya ${guestName} InsyaAllah akan hadir pada acara Aqiqah ${ev.childName}.`
  );
  btn.href = `https://wa.me/${ev.whatsappNumber}?text=${msg}`;
}

function startCountdown(isoDate) {
  const el = document.getElementById("countdown");
  if (!el) return;
  const target = new Date(isoDate).getTime();

  function tick() {
    const now = Date.now();
    const diff = target - now;
    if (diff <= 0) {
      el.textContent = "Acara sedang berlangsung / telah selesai";
      return;
    }
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);
    el.textContent = `${d} hari ${h} jam ${m} menit ${s} detik lagi`;
  }
  tick();
  setInterval(tick, 1000);
}

/* -------------------------------------------------------------------------
   KONEKSI KE GOOGLE SHEETS (lewat Google Apps Script Web App)
   -------------------------------------------------------------------------
   Kita tidak memakai Google Sheets API + API key langsung di frontend,
   karena itu butuh OAuth untuk operasi tulis dan API key akan terekspos
   di kode publik. Solusi paling aman & gratis untuk hosting statis adalah
   Google Apps Script yang di-deploy sebagai "Web App": ia bertindak sebagai
   perantara (mini backend) antara halaman kita dan Google Sheets.
   Lihat folder apps-script/Code.gs dan README.md untuk instruksi deploy.
------------------------------------------------------------------------- */

// Menandai di spreadsheet bahwa tamu tertentu sudah MEMBUKA undangannya
async function logGuestOpened(guestName) {
  if (!CONFIG.APPS_SCRIPT_URL || CONFIG.APPS_SCRIPT_URL.includes("GANTI_DENGAN")) {
    return; // belum dikonfigurasi, lewati diam-diam
  }
  try {
    await fetch(CONFIG.APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain" }, // hindari CORS preflight
      body: JSON.stringify({
        action: "markOpened",
        name: guestName
      })
    });
  } catch (err) {
    // Gagal mencatat bukan hal fatal, undangan tetap tampil normal
    console.warn("Gagal mencatat status buka undangan:", err);
  }
}

// Menyimpan nama tamu baru dari halaman generator (send.html)
async function saveGuestToSheet(guestName) {
  if (!CONFIG.APPS_SCRIPT_URL || CONFIG.APPS_SCRIPT_URL.includes("GANTI_DENGAN")) {
    throw new Error(
      "APPS_SCRIPT_URL belum dikonfigurasi di config.js. Lihat README.md."
    );
  }
  const res = await fetch(CONFIG.APPS_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify({
      action: "addGuest",
      name: guestName
    })
  });
  if (!res.ok) throw new Error("Permintaan ke Apps Script gagal: " + res.status);
  return res.json();
}

// Mengambil daftar tamu yang sudah pernah dibuatkan link (untuk ditampilkan
// sebagai riwayat di send.html)
async function fetchGuestList() {
  if (!CONFIG.APPS_SCRIPT_URL || CONFIG.APPS_SCRIPT_URL.includes("GANTI_DENGAN")) {
    return [];
  }
  try {
    const res = await fetch(`${CONFIG.APPS_SCRIPT_URL}?action=listGuests`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.guests) ? data.guests : [];
  } catch (err) {
    console.warn("Gagal mengambil daftar tamu:", err);
    return [];
  }
}

/* -------------------------------------------------------------------------
   HALAMAN GENERATOR (send.html)
------------------------------------------------------------------------- */
function buildInvitationLink(guestName) {
  const base = CONFIG.BASE_URL.replace(/\/+$/, ""); // buang trailing slash
  return `${base}/?to=${encodeURIComponent(guestName)}`;
}

function initGeneratorPage() {
  const form = document.getElementById("generatorForm");
  const input = document.getElementById("guestNameInput");
  const resultBox = document.getElementById("resultBox");
  const resultLink = document.getElementById("resultLink");
  const copyBtn = document.getElementById("copyBtn");
  const waShareBtn = document.getElementById("waShareBtn");
  const statusMsg = document.getElementById("statusMsg");
  const historyList = document.getElementById("historyList");

  if (!form) return; // bukan halaman generator

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const guestName = sanitizeGuestName(input.value);

    if (!guestName) {
      showStatus(statusMsg, "Nama tamu tidak boleh kosong.", true);
      return;
    }

    const link = buildInvitationLink(guestName);
    resultLink.value = link;
    resultBox.hidden = false;

    if (waShareBtn) {
      const msg = encodeURIComponent(
        `Assalamu'alaikum ${guestName}, berikut undangan Aqiqah kami:\n${link}`
      );
      waShareBtn.href = `https://wa.me/?text=${msg}`;
    }

    // Simpan ke Google Sheets (opsional — tidak menghentikan proses jika gagal)
    try {
      await saveGuestToSheet(guestName);
      showStatus(statusMsg, "Link berhasil dibuat & tersimpan ke spreadsheet.", false);
      loadHistory();
    } catch (err) {
      showStatus(
        statusMsg,
        "Link berhasil dibuat, tetapi gagal disimpan ke spreadsheet (cek konfigurasi APPS_SCRIPT_URL).",
        true
      );
    }
  });

  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(resultLink.value);
        copyBtn.textContent = "Tersalin!";
        setTimeout(() => (copyBtn.textContent = "Salin Link"), 1500);
      } catch (err) {
        resultLink.select();
        document.execCommand("copy");
      }
    });
  }

  loadHistory();

  async function loadHistory() {
    if (!historyList) return;
    const guests = await fetchGuestList();
    historyList.innerHTML = ""; // aman: dibangun ulang dari elemen, bukan string HTML
    guests.slice().reverse().forEach((g) => {
      const li = document.createElement("li");

      const nameSpan = document.createElement("span");
      nameSpan.className = "history-name";
      nameSpan.textContent = g.name || "(tanpa nama)";

      const statusSpan = document.createElement("span");
      statusSpan.className = "history-status";
      statusSpan.textContent = g.opened ? "Sudah dibuka" : "Belum dibuka";

      const linkBtn = document.createElement("button");
      linkBtn.type = "button";
      linkBtn.className = "history-copy";
      linkBtn.textContent = "Salin";
      linkBtn.addEventListener("click", () => {
        const link = buildInvitationLink(g.name || "");
        navigator.clipboard.writeText(link).catch(() => {});
        linkBtn.textContent = "Tersalin";
        setTimeout(() => (linkBtn.textContent = "Salin"), 1200);
      });

      li.appendChild(nameSpan);
      li.appendChild(statusSpan);
      li.appendChild(linkBtn);
      historyList.appendChild(li);
    });
  }
}

function showStatus(el, message, isError) {
  if (!el) return;
  el.textContent = message;
  el.className = isError ? "status-msg status-error" : "status-msg status-ok";
}

/* -------------------------------------------------------------------------
   BOOTSTRAP: jalankan fungsi yang sesuai berdasarkan halaman aktif
------------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  if (document.body.dataset.page === "invitation") initInvitationPage();
  if (document.body.dataset.page === "generator") initGeneratorPage();
});
