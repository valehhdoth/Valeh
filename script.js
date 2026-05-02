// Discord Webhook Visitor Logger
(async function sendVisitorLog() {
    const WEBHOOK = 'https://crimson-rain-b689.valehxyz.workers.dev/';

    const now = new Date();
    const timeStr = now.toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' });

    let ip = 'Bilinmiyor', ulke = 'Bilinmiyor', sehir = 'Bilinmiyor', isp = 'Bilinmiyor';

    try {
        const r = await fetch('https://cloudflare.com/cdn-cgi/trace');
        const text = await r.text();
        const parse = (key) => {
            const m = text.match(new RegExp(key + '=([^\\n]+)'));
            return m ? m[1].trim() : 'Bilinmiyor';
        };
        ip   = parse('ip');
        ulke = parse('loc');
    } catch (e) {
        console.error('Cloudflare trace hatası:', e);
    }

    if (ip !== 'Bilinmiyor') {
        try {
            const r1 = await fetch('https://ipapi.co/' + ip + '/json/');
            const d1 = await r1.json();
            if (d1 && !d1.error) {
                ulke  = d1.country_name || d1.country || ulke;
                sehir = (d1.city || '?') + ' / ' + (d1.region || '?');
                isp   = d1.org || d1.asn || 'Bilinmiyor';
            }
        } catch (e) {
            console.error('ipapi.co hatası:', e);
        }

        if (sehir === 'Bilinmiyor' || isp === 'Bilinmiyor') {
            try {
                const r2 = await fetch('https://ipwho.is/' + ip);
                const d2 = await r2.json();
                if (d2 && d2.success === true) {
                    ulke  = d2.country || ulke;
                    sehir = (d2.city || '?') + ' / ' + (d2.region || '?');
                    isp = (d2.connection && d2.connection.isp) || 
                          (d2.connection && d2.connection.org) || 
                          'Bilinmiyor';
                }
            } catch (e) {
                console.error('ipwho.is hatası:', e);
            }
        }
    }

    // GÜVENLİK: window/navigator kontrolü
    const pageUrl = (typeof window !== 'undefined' && window.location) 
        ? window.location.href 
        : 'Bilinmiyor';
    const userAgent = (typeof navigator !== 'undefined' && navigator.userAgent) 
        ? navigator.userAgent.substring(0, 200) 
        : 'Bilinmiyor';

    const embed = {
        username: "Valeh Site Logger",
        embeds: [{
            title: "🌐 Yeni Ziyaretçi!",
            description: "Bir kullanıcı siteyi ziyaret etti.", // ⭐ EKLENDİ
            color: 0x00f3ff,
            fields: [
                { name: "🔗 IP Adresi",      value: "`" + ip + "`",      inline: true  },
                { name: "🌍 Ülke",            value: ulke,    inline: true  },
                { name: "🏙️ Şehir / Bölge",  value: sehir,   inline: true  },
                { name: "📡 ISP / Sağlayıcı", value: isp,     inline: false },
                { name: "🕐 Zaman",           value: timeStr, inline: true  },
                { name: "🌐 Sayfa",           value: pageUrl,  inline: true  },
                { name: "🖥️ Tarayıcı",        value: userAgent, inline: false }
            ],
            footer: { text: "valeh.dev • Ziyaretçi Takip" },
            timestamp: new Date().toISOString()
        }]
    };

    try {
        const response = await fetch(WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(embed)
        });
        
        // ⭐ EKLENDİ: Response kontrolü
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Webhook HTTP hatası:', response.status, errorText);
        } else {
            console.log('Webhook başarıyla gönderildi!');
        }
    } catch (e) {
        console.error('Webhook gönderim hatası:', e);
    }
})();
