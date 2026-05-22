const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/capture', (req, res) => {
    const now = new Date();
    // توقيت الأردن GMT+3
    const jordanTime = new Date(now.getTime() + (3 * 60 * 60 * 1000)).toUTCString().replace("GMT", "Jordan Time");

    const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const exactIp = rawIp ? rawIp.split(',')[0].trim() : "Unknown";
    const sourcePort = req.headers['x-forwarded-port'] || req.socket.remotePort || "Unknown";

    const visitorLog = {
        Time: jordanTime,
        Network: { IP: exactIp, Port: sourcePort },
        Device: req.body.deviceMetrics || {}
    };

    console.log("\n--- زائر جديد ---");
    console.log(JSON.stringify(visitorLog, null, 2));

    res.status(200).send("ok");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
