# Log Analyzer Multi-Platform Notification Bot

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Platform](https://img.shields.io/badge/platform-Google%20Apps%20Script-orange)
![License](https://img.shields.io/badge/license-MIT-green)

## 📋 Deskripsi
Log Analyzer Multi-Platform Notification Bot adalah solusi automasi untuk monitoring dan analisis log akses sistem. Bot ini menganalisis data log dari Google Spreadsheet dan mengirimkan laporan terperinci melalui WhatsApp, Telegram, dan Email secara otomatis.

### ✨ Fitur Utama
- 📊 Analisis log akses komprehensif
- 📅 Laporan periode: mingguan, bulanan, dan total
- 📱 Notifikasi multi-platform:
  - WhatsApp (menggunakan API Kirim WA)
  - Telegram (dengan file attachment)
  - Email (dengan lampiran dan formatting)
- 🔒 Monitoring keamanan sistem
- 📈 Statistik akses terperinci
- ⚡ Performa real-time
- 🎯 Peringatan aktivitas mencurigakan

### 🚀 Kemampuan Analisis
1. **Ringkasan Utama**
   - Total akses sistem
   - Jumlah IP unik
   - Total aktivitas login

2. **Aktivitas Penting**
   - Top 3 jenis akses terbanyak
   - Pola penggunaan sistem
   - Tren aktivitas pengguna

3. **Monitoring Keamanan**
   - Deteksi aktivitas copy password
   - Analisis frekuensi login
   - Tracking IP akses

4. **Pola Waktu**
   - Jam-jam tersibuk
   - Distribusi akses harian
   - Tren penggunaan sistem

## 📝 Cara Penggunaan

### Prasyarat
1. Google Account
2. Akses ke Google Spreadsheet
3. WhatsApp Business API (Kirim WA)
4. Telegram Bot Token
5. SMTP Email yang dikonfigurasi

### Instalasi
1. Buka Google Spreadsheet target
2. Buka Script Editor (Extensions > Apps Script)
3. Copy-paste kode dari file `logAnalyzer.gs`
4. Sesuaikan konfigurasi di bagian CONFIG:
   ```javascript
   const CONFIG = {
     spreadsheet: {
       id: 'YOUR_SPREADSHEET_ID',
       sheetName: 'YOUR_SHEET_NAME'
     },
     // ... konfigurasi lainnya
   }
   ```
5. Simpan dan deploy sebagai web app

### Konfigurasi
1. **WhatsApp**
   - Dapatkan API Key dari Kirim WA
   - Sesuaikan nomor pengirim dan penerima

2. **Telegram**
   - Buat bot melalui @BotFather
   - Dapatkan bot token dan chat ID

3. **Email**
   - Sesuaikan alamat email penerima
   - Atur nama pengirim sesuai kebutuhan

## 📚 Format Data Log
Data log harus memiliki format berikut di spreadsheet:
```
Tanggal | Jenis Akses | IP Akses
```

## 🤝 Kontribusi
Kontribusi selalu terbuka! Beberapa cara berkontribusi:
1. Fork repository
2. Buat branch fitur baru (`git checkout -b fitur-baru`)
3. Commit perubahan (`git commit -m 'Menambah fitur baru'`)
4. Push ke branch (`git push origin fitur-baru`)
5. Buat Pull Request
