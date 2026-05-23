const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

app.post('/api/capture', async (req, res) => {
    const metrics = req.body.deviceMetrics || {};
    // الحصول على الـ IP الحقيقي للزائر
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const cleanIp = ip.split(',')[0].trim(); // تنظيف الـ IP في حال وجود بروكسي

    try {
        // الاتصال بقاعدة بيانات الـ IP لجلب المعلومات
        const ipResponse = await axios.get(`http://ip-api.com/json/${cleanIp}?fields=status,country,city,isp,org,as,timezone`);
        const ipData = ipResponse.data;

        // حساب التواقيت
        const now = new Date();
        const jordanTime = new Intl.DateTimeFormat('en-GB', {
            timeZone: 'Asia/Amman',
            dateStyle: 'full',
            timeStyle: 'long'
        }).format(now);

        const utcTime = now.toUTCString();

        console.log("-----------------------------------------");
        console.log(`[!] زائر جديد مرصود - ID: ${metrics.trackingId || 'N/A'}`);
        console.log(`[+] وقت الدخول (الأردن): ${jordanTime}`);
        console.log(`[+] وقت الدخول (UTC/جرينتش): ${utcTime}`);
        console.log(`[+] معلومات الشبكة:`);
        console.log(`    - الـ IP: ${cleanIp}`);
        console.log(`    - الشركة (ISP): ${ipData.isp || 'غير معروف'}`);
        console.log(`    - الدولة: ${ipData.country || 'غير معروف'} | المدينة: ${ipData.city || 'غير معروف'}`);
        console.log(`    - توقيت دولة الـ IP: ${ipData.timezone || 'غير معروف'}`);
        console.log(`[+] تفاصيل الجهاز العميقة:`);
        console.log(`    - النظام الأساسي: ${metrics.platform || 'N/A'}`);
        console.log(`    - أبعاد الشاشة: ${metrics.screen || 'N/A'}`);
        console.log(`    - الأنوية: ${metrics.cores || 'N/A'} | الرام التقريبي: ${metrics.memory || 'N/A'}GB`);
        console.log(`    - لغة الجهاز: ${metrics.lang || 'N/A'}`);
        console.log(`    - البصمة المتصفح (UA): ${metrics.userAgent || 'N/A'}`);
        console.log("-----------------------------------------");

    } catch (error) {
        console.log("[!] حدث خطأ أثناء تحليل بيانات الـ IP، لكن الزيارة تم رصدها.");
    }

    res.sendStatus(200);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`الرادار المطور يعمل الآن على بورت ${PORT}...`
));
