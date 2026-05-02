// Discord Webhook Visitor Logger
(async function sendVisitorLog() {
    const WEBHOOK = 'https://crimson-rain-b689.valehxyz.workers.dev/';

    const now = new Date();
    const timeStr = now.toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' });

    let ip = 'Bilinmiyor', ulke = 'Bilinmiyor', sehir = 'Bilinmiyor', isp = 'Bilinmiyor';

    try {
        // Cloudflare trace - CORS yok, file:// dahil her yerde çalışır
        const r = await fetch('https://cloudflare.com/cdn-cgi/trace');
        const text = await r.text();
        // DÜZELTME: [^\n]+ kullanarak sadece aynı satırı al
        const parse = (key) => {
            const m = text.match(new RegExp(key + '=([^\\n]+)'));
            return m ? m[1].trim() : 'Bilinmiyor';
        };
        ip   = parse('ip');
        ulke = parse('loc');
    } catch (e) {
        console.error('Cloudflare trace hatası:', e);
    }

    // DÜZELTME: ipwho.is yerine ipapi.co önce denenir (daha güvenilir)
    // Fallback: ipwho.is
    if (ip !== 'Bilinmiyor') {
        // Deneme 1: ipapi.co (CORS destekli, güvenilir)
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

        // Deneme 2: ipwho.is (fallback)
        if (sehir === 'Bilinmiyor' || isp === 'Bilinmiyor') {
            try {
                const r2 = await fetch('https://ipwho.is/' + ip);
                const d2 = await r2.json();
                if (d2 && d2.success === true) {
                    ulke  = d2.country || ulke;
                    sehir = (d2.city || '?') + ' / ' + (d2.region || '?');
                    // DÜZELTME: Optional chaining yerine güvenli property access
                    isp = (d2.connection && d2.connection.isp) || 
                          (d2.connection && d2.connection.org) || 
                          'Bilinmiyor';
                }
            } catch (e) {
                console.error('ipwho.is hatası:', e);
            }
        }

        // Deneme 3: ip-api.com (son fallback - HTTP only, CORS yok ama çalışabilir)
        if (sehir === 'Bilinmiyor' || isp === 'Bilinmiyor') {
            try {
                const r3 = await fetch('https://ipapi.com/' + ip + '/json/');
                const d3 = await r3.json();
                if (d3 && d3.status === 'success') {
                    ulke  = d3.country || ulke;
                    sehir = (d3.city || '?') + ' / ' + (d3.regionName || '?');
                    isp   = d3.isp || d3.org || 'Bilinmiyor';
                }
            } catch (e) {
                console.error('ipapi.com hatası:', e);
            }
        }
    }

    const embed = {
        username: "Valeh Site Logger",
        embeds: [{
            title: "🌐 Yeni Ziyaretçi!",
            color: 0x00f3ff,
            fields: [
                { name: "🔗 IP Adresi",      value: ip,      inline: true  },
                { name: "🌍 Ülke",            value: ulke,    inline: true  },
                { name: "🏙️ Şehir / Bölge",  value: sehir,   inline: true  },
                { name: "📡 ISP / Sağlayıcı", value: isp,     inline: false },
                { name: "🕐 Zaman",           value: timeStr, inline: true  },
                { name: "🌐 Sayfa",           value: window.location.href,  inline: true  },
                { name: "🖥️ Tarayıcı",        value: navigator.userAgent.substring(0, 200), inline: false }
            ],
            footer: { text: "valeh.dev • Ziyaretçi Takip" },
            timestamp: new Date().toISOString()
        }]
    };

    try {
        await fetch(WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(embed)
        });
    } catch (e) {
        console.error('Webhook gönderim hatası:', e);
    }
})();
