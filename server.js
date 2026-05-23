const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

app.post('/api/capture', async (req, res) => {
    // 1. استلام مقاييس الجهاز (مع معالجة الـ ID لضمان ظهوره)
    const metrics = req.body.deviceMetrics || {};
    const trackingId = metrics.trackingId || "غير معروف (N/A)";

    // 2. الحصول على الـ IP الحقيقي والمنفذ (Source Port)
    const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const cleanIp = rawIp.split(',')[0].trim(); 
    const sourcePort = req.socket.remotePort; // جلب رقم المنفذ بدقة

    try {
        // 3. تحليل بيانات الـ IP والشركة المزودة
        const ipResponse = await axios.get(`http://ip-api.com/json/${cleanIp}?fields=status,country,city,isp,org,as,timezone`);
        const ipData = ipResponse.data;

        // 4. حساب التواقيت (الأردن، جرينتش، وتوقيت دولة الـ IP)
        const now = new Date();
        const jordanTime = new Intl.DateTimeFormat('en-GB', {
            timeZone: 'Asia/Amman',
            dateStyle: 'full',
            timeStyle: 'long'
        }).format(now);

        const utcTime = now.toUTCString();

        console.log("=========================================");
        console.log(`[!] زائر جديد مرصود | بصمة الـ ID: ${trackingId}`);
        console.log(`-----------------------------------------`);
        console.log(`[+] التواقيت الزمنية:`);
        console.log(`    - وقت الأردن: ${jordanTime}`);
        console.log(`    - وقت جرينتش: ${utcTime}`);
        console.log(`    - توقيت الدولة المصدر: ${ipData.timezone || 'غير معروف'}`);
        console.log(`-----------------------------------------`);
        console.log(`[+] بيانات الشبكة والاتصال:`);
        console.log(`    - عنوان الـ IP: ${cleanIp}`);
        console.log(`    - منفذ المصدر (Port): ${sourcePort}`);
        console.log(`    - شركة الاتصالات (ISP): ${ipData.isp || 'غير معروف'}`);
        console.log(`    - الدولة: ${ipData.country || 'غير معروف'} | المدينة: ${ipData.city || 'غير معروف'}`);
        console.log(`-----------------------------------------`);
        console.log(`[+] المواصفات الفنية للجهاز:`);
        console.log(`    - نظام التشغيل: ${metrics.platform || 'N/A'}`);
        console.log(`    - أبعاد الشاشة: ${metrics.screen || 'N/A'}`);
        console.log(`    - عتاد الجهاز: ${metrics.cores} Core | RAM: ${metrics.memory}GB`);
        console.log(`    - اللغة والإعدادات: ${metrics.lang || 'N/A'}`);
        console.log(`    - بصمة المتصفح الكاملة (UA): ${metrics.userAgent || 'N/A'}`);
        console.log("=========================================");

    } catch (error) {
        console.log("[!] تم رصد الزيارة، ولكن حدث خطأ في تحليل بيانات الـ ISP.");
    }

    res.sendStatus(200);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`الرادار المطور يعمل الآن على بورت ${PORT}...`));
