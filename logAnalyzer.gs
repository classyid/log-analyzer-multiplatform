// Konfigurasi Global
const CONFIG = {
  // Spreadsheet Config
  spreadsheet: {
    id: '<ID-SPREADSHEET>',
    sheetName: 'log_access'
  },
  
  // WhatsApp Config
  whatsapp: {
    apiKey: '<APIKEY-MPEDIA>',
    sender: '<SENDER>',
    number: '<NUMBER>',
    apiUrl: 'https://mpedia/send-message'
  },
  
  // Telegram Config
  telegram: {
    botToken: '<ID-TOKEN>',
    chatId: '<CHAT-ID>',
    get apiUrl() {
      return `https://api.telegram.org/bot${this.botToken}`;
    }
  },
  
  // Email Config
  email: {
    to: '<EMAIL-TUJUAN>', // Ganti dengan email tujuan
    senderName: 'BOT ANALISIS'
  }
};

function analyzeLogAccess() {
  // Buka spreadsheet dan ambil data
  const ss = SpreadsheetApp.openById(CONFIG.spreadsheet.id);
  const sheet = ss.getSheetByName(CONFIG.spreadsheet.sheetName);
  const data = sheet.getDataRange().getValues();
  
  // Hapus header jika ada
  const rows = data.slice(1);
  
  // Fungsi untuk membuat objek analisis kosong
  function createAnalysisObject() {
    return {
      totalAccess: 0,
      uniqueIPs: new Set(),
      accessTypes: {},
      timeDistribution: {},
      searchQueries: [],
      viewedPages: [],
      loginAttempts: 0,
      passwordCopies: 0
    };
  }
  
  // Inisialisasi objek analisis untuk berbagai periode
  let analysis = {
    all: createAnalysisObject(),
    thisMonth: createAnalysisObject(),
    thisWeek: createAnalysisObject()
  };
  
  // Mendapatkan tanggal referensi
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  
  // Analisa setiap baris data
  rows.forEach(row => {
    const timestamp = new Date(row[0]);
    const accessType = row[1];
    const ipAddress = row[2];
    
    // Fungsi untuk memproses data ke objek analisis
    function processData(analysisObj) {
      analysisObj.totalAccess++;
      analysisObj.uniqueIPs.add(ipAddress);
      analysisObj.accessTypes[accessType] = (analysisObj.accessTypes[accessType] || 0) + 1;
      
      const hour = timestamp.getHours();
      analysisObj.timeDistribution[hour] = (analysisObj.timeDistribution[hour] || 0) + 1;
      
      if(accessType.includes('Performed Search')) {
        analysisObj.searchQueries.push(accessType.split(': ')[1]);
      }
      
      if(accessType.includes('Viewed Details')) {
        analysisObj.viewedPages.push(accessType.split(': ')[1]);
      }
      
      if(accessType.includes('Login')) {
        analysisObj.loginAttempts++;
      }
      
      if(accessType.includes('Copied Password')) {
        analysisObj.passwordCopies++;
      }
    }
    
    // Proses untuk semua data
    processData(analysis.all);
    
    // Proses untuk bulan ini
    if (timestamp >= startOfMonth) {
      processData(analysis.thisMonth);
    }
    
    // Proses untuk minggu ini
    if (timestamp >= startOfWeek) {
      processData(analysis.thisWeek);
    }
  });
  
  // Fungsi untuk memformat analisis menjadi teks
  function formatAnalysis(analysisObj, title, periodType) {
    let text = `*${title}*\n\n`;
    
    // Ringkasan Utama
    text += `📌 *RINGKASAN ${periodType}*\n`;
    text += `• Total Akses: ${analysisObj.totalAccess} kali\n`;
    text += `• IP Unik: ${analysisObj.uniqueIPs.size} alamat\n`;
    text += `• Total Login: ${analysisObj.loginAttempts} kali\n\n`;
    
    // Aktivitas Penting
    text += `🔍 *AKTIVITAS PENTING*\n`;
    const topAccess = Object.entries(analysisObj.accessTypes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
      
    text += `3 Aktivitas Terbanyak:\n`;
    topAccess.forEach(([type, count], index) => {
      text += `${index + 1}. ${type}: ${count} kali\n`;
    });
    text += '\n';
    
    // Halaman yang Dilihat
    const uniquePages = [...new Set(analysisObj.viewedPages)];
    if(uniquePages.length > 0) {
      text += `👁️ *HALAMAN YANG DILIHAT*\n`;
      uniquePages.forEach(page => {
        const pageCount = analysisObj.viewedPages.filter(p => p === page).length;
        text += `• ${page}: ${pageCount} kali\n`;
      });
      text += '\n';
    }
    
    // Pencarian
    const uniqueSearches = [...new Set(analysisObj.searchQueries)];
    if(uniqueSearches.length > 0) {
      text += `🔎 *KATA KUNCI PENCARIAN*\n`;
      uniqueSearches.forEach(query => {
        const searchCount = analysisObj.searchQueries.filter(q => q === query).length;
        text += `• "${query}": ${searchCount}x dicari\n`;
      });
      text += '\n';
    }
    
    // Peringatan Keamanan
    if(analysisObj.passwordCopies > 0 || analysisObj.loginAttempts / analysisObj.totalAccess > 0.3) {
      text += `⚠️ *PERINGATAN KEAMANAN*\n`;
      if(analysisObj.passwordCopies > 0) {
        text += `• Terdeteksi ${analysisObj.passwordCopies}x aktivitas copy password\n`;
      }
      if(analysisObj.loginAttempts / analysisObj.totalAccess > 0.3) {
        text += `• Frekuensi login tinggi terdeteksi\n`;
      }
      text += '\n';
    }
    
    // Pola Waktu
    const busyHour = Object.entries(analysisObj.timeDistribution)
      .sort((a, b) => b[1] - a[1])[0];
    if(busyHour) {
      text += `⏰ *POLA WAKTU*\n`;
      text += `• Jam tersibuk: ${busyHour[0].padStart(2, '0')}:00 (${busyHour[1]} akses)\n\n`;
    }
    
    return text;
  }
  
  // Format pesan untuk semua platform
  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  let message = `📊 *LAPORAN ANALISIS LOG AKSES*\n`;
  message += `📅 ${today}\n\n`;
  
  // Analisis Mingguan
  message += `===================\n`;
  message += formatAnalysis(analysis.thisWeek, "📅 ANALISIS MINGGU INI", "MINGGU INI");
  
  // Analisis Bulanan
  message += `===================\n`;
  message += formatAnalysis(analysis.thisMonth, "📅 ANALISIS BULAN INI", "BULAN INI");
  
  // Analisis Total
  message += `===================\n`;
  message += formatAnalysis(analysis.all, "📊 ANALISIS TOTAL KESELURUHAN", "KESELURUHAN");
  
  // Mendapatkan tanggal untuk nama file
  const dateStr = new Date().toLocaleDateString('id-ID', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\//g, '');
  
  // Nama file untuk lampiran
  const fileName = `log_akses_portal_password_${dateStr}.txt`;
  
  // Caption untuk Telegram dan Subject Email
  const caption = `LAPORAN ANALISIS LOG AKSES PORTAL PASSWORD\n📅 ${today}`;
  
  // 1. Kirim ke WhatsApp
  const waOptions = {
    'method': 'post',
    'contentType': 'application/json',
    'payload': JSON.stringify({
      'api_key': CONFIG.whatsapp.apiKey,
      'sender': CONFIG.whatsapp.sender,
      'number': CONFIG.whatsapp.number,
      'message': message
    })
  };
  
  try {
    UrlFetchApp.fetch(CONFIG.whatsapp.apiUrl, waOptions);
    Logger.log('Pesan berhasil dikirim ke WhatsApp');
  } catch (error) {
    Logger.log('Error saat mengirim pesan ke WhatsApp: ' + error.toString());
  }
  
  // 2. Kirim ke Telegram
  const tempFile = DriveApp.createFile(fileName, message, 'text/plain');
  const fileBlob = tempFile.getBlob().setName(fileName);
  
  const telegramFormData = {
    method: "post",
    muteHttpExceptions: true,
    payload: {
      method: "sendDocument",
      chat_id: CONFIG.telegram.chatId,
      caption: caption,
      document: fileBlob
    }
  };
  
  try {
    const response = UrlFetchApp.fetch(`${CONFIG.telegram.apiUrl}/sendDocument`, telegramFormData);
    const responseData = JSON.parse(response.getContentText());
    
    if (responseData.ok) {
      Logger.log('File berhasil dikirim ke Telegram');
    } else {
      Logger.log('Error saat mengirim file ke Telegram: ' + responseData.description);
      
      // Mencoba mengirim sebagai pesan teks jika file gagal
      const messageOptions = {
        method: "post",
        muteHttpExceptions: true,
        payload: {
          method: "sendMessage",
          chat_id: CONFIG.telegram.chatId,
          text: message,
          parse_mode: "Markdown"
        }
      };
      
      const messageResponse = UrlFetchApp.fetch(`${CONFIG.telegram.apiUrl}/sendMessage`, messageOptions);
      const messageResponseData = JSON.parse(messageResponse.getContentText());
      
      if (messageResponseData.ok) {
        Logger.log('Pesan berhasil dikirim ke Telegram sebagai teks');
      } else {
        Logger.log('Error saat mengirim pesan teks ke Telegram: ' + messageResponseData.description);
      }
    }
  } catch (error) {
    Logger.log('Error saat mengirim ke Telegram: ' + error.toString());
    
    // Mencoba mengirim sebagai pesan teks jika terjadi error
    try {
      const fallbackOptions = {
        method: "post",
        muteHttpExceptions: true,
        payload: {
          method: "sendMessage",
          chat_id: CONFIG.telegram.chatId,
          text: message,
          parse_mode: "Markdown"
        }
      };
      
      const fallbackResponse = UrlFetchApp.fetch(`${CONFIG.telegram.apiUrl}/sendMessage`, fallbackOptions);
      const fallbackResponseData = JSON.parse(fallbackResponse.getContentText());
      
      if (fallbackResponseData.ok) {
        Logger.log('Pesan berhasil dikirim ke Telegram sebagai teks (fallback)');
      } else {
        Logger.log('Error saat mengirim pesan teks ke Telegram (fallback): ' + fallbackResponseData.description);
      }
    } catch (fallbackError) {
      Logger.log('Error saat mengirim pesan fallback ke Telegram: ' + fallbackError.toString());
    }
  } finally {
    // Hapus file temporary
    tempFile.setTrashed(true);
  }
  
  // 3. Kirim ke Email
  try {
    // Buat draft email
    const emailTemp = DriveApp.createFile(fileName, message, 'text/plain');
    const emailBody = message.replace(/\*/g, '').replace(/`/g, ''); // Hapus formatting Markdown
    
    MailApp.sendEmail({
      to: CONFIG.email.to,
      subject: caption,
      body: emailBody,
      attachments: [emailTemp.getAs('text/plain')],
      name: CONFIG.email.senderName
    });
    
    Logger.log('Email berhasil dikirim');
    
    // Hapus file temporary
    emailTemp.setTrashed(true);
  } catch (error) {
    Logger.log('Error saat mengirim email: ' + error.toString());
  }
  
  // Tetap tampilkan di log untuk referensi
  Logger.log(message);
}

// Fungsi helper untuk menambahkan menu di spreadsheet
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Analisis Log')
    .addItem('Jalankan Analisis', 'analyzeLogAccess')
    .addToUi();
}
