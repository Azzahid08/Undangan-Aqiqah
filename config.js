/* =========================================================================
   config.js
   -------------------------------------------------------------------------
   Semua nilai yang perlu Anda ubah untuk acara Anda ada di file ini.
   Tidak ada logika di sini — hanya data. Ini sengaja dipisah dari script.js
   supaya Anda (atau siapa pun) bisa mengedit acara tanpa menyentuh kode.
   ========================================================================= */

const CONFIG = {
  /* -----------------------------------------------------------------------
     1) URL WEB APP GOOGLE APPS SCRIPT
     -----------------------------------------------------------------------
     Ini adalah "backend" gratis kita, ganti setelah Anda deploy Apps Script.
     Lihat README.md bagian "Menghubungkan Google Sheets" untuk cara
     mendapatkan URL ini. Formatnya selalu diakhiri "/exec".
  ------------------------------------------------------------------------*/
  APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycby0oCh-1tgaEt48u_9Qll923J-1YL5x-sb08Iis7Ors_l6iq5GpGmnLVxRpmp6LuiJL2g/exec",

  /* -----------------------------------------------------------------------
     2) DOMAIN UNDANGAN
     -----------------------------------------------------------------------
     Domain tempat index.html akan diakses tamu, TANPA garis miring di akhir.
     Dipakai oleh send.html untuk merangkai link undangan lengkap.
  ------------------------------------------------------------------------*/
  BASE_URL: "https://aqiqah.namadomainanda.com",

  /* -----------------------------------------------------------------------
     3) INFORMASI ACARA
     -----------------------------------------------------------------------
  ------------------------------------------------------------------------*/
  EVENT: {
    // Nama anak yang diaqiqahkan
    childName: "Ameerah Athabina Zahidah",

    // Nama panggilan singkat, dipakai di judul tab & beberapa tempat kecil
    childNickname: "Ameerah",

    // Nama orang tua
    parentsName: "Bapak Abdulloh Azzahid & Ibu Meyreza Dwi Savitri",

    // Tanggal lahir anak (opsional, tampil di bagian "kabar bahagia")
    birthDate: "03 Agustus 2026",

    // Tanggal & waktu acara
    eventDateISO: "2026-09-13T09:00:00+07:00", // dipakai untuk hitung mundur & Google Calendar
    dateDisplay: "Minggu, 13 September 2026",
    timeDisplay: "15.30 WIB – Selesai",

    // Lokasi
    venueName: "Kediaman Keluarga Besar",
    address: "Jl. Seruni Utara Klego Bantaran, kel. Klego, Kec. Pekalongan Timur, Kota Pekalongan, Jawa Tengah",
    mapsUrl: "https://maps.app.goo.gl/emXAtQ1uKRKutysr8",

    // Ayat / kutipan pembuka (opsional, kosongkan string jika tidak dipakai)
    openingVerse:
      "“Setiap anak tergadai dengan aqiqahnya, disembelihkan untuknya pada hari ketujuh, dicukur rambutnya, dan diberi nama.”",
    openingVerseSource: "HR. Abu Dawud & Tirmidzi",

    // Pesan sambutan singkat
    invitationMessage:
      "Dengan memohon rahmat dan ridho Allah SWT, kami mengundang Bapak/Ibu/Saudara/i untuk hadir dan memberikan doa restu pada acara Aqiqah putra kami.",

    // Pesan penutup / doa
    closingMessage:
      "Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.",

    // Gambar (letakkan file di folder assets/ lalu sesuaikan nama filenya)
    coverImage: "assets/Gambar-7.jpeg",
    galleryImages: [
      "assets/Gambar-6.png",
      "assets/Gambar-3.jpeg",
      "assets/Gambar-4.jpeg"
    ],

    // Nomor WhatsApp untuk konfirmasi kehadiran (format internasional tanpa +)
    whatsappNumber: "6281313493890"
  }
};
