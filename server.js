const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

const FIREBASE_URL = "https://whitelist-a804a-default-rtdb.firebaseio.com";
const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1547513458856042537/Ly_6vwpkuMHN7gwBFUFmuEEcdvvHJVEnqL-svRpXHNdfybyC_Yl9J5SUUiQDD5nZMksp";

// Register Endpoint
app.post('/api/register', async (req, res) => {
    try {
        const userData = req.body;
        const username = userData.username;

        // Check if user already exists in Firebase
        const checkRes = await axios.get(`${FIREBASE_URL}/users/${username}.json`);
        if (checkRes.data) {
            return res.status(400).json({ success: false, message: "Username already exists!" });
        }

        // Save to Firebase
        await axios.put(`${FIREBASE_URL}/users/${username}.json`, userData);

        // Send to Discord Webhook
        const discordPayload = {
            content: "🚀 **New Minecraft Whitelist Registration!**",
            embeds: [{
                title: "LinuxHUB Survival - New Player",
                color: 5814783,
                fields: [
                    { name: "Full Name", value: userData.fullName, inline: true },
                    { name: "Age", value: String(userData.age), inline: true },
                    { name: "Platform", value: userData.platform, inline: true },
                    { name: "In-Game Name (IGN)", value: userData.ign, inline: true },
                    { name: "WhatsApp", value: userData.whatsapp, inline: true },
                    { name: "Address", value: userData.address, false: true },
                    { name: "Username", value: userData.username, inline: true }
                ],
                timestamp: new Date().toISOString()
            }]
        };

        await axios.post(DISCORD_WEBHOOK, discordPayload);

        res.json({ success: true, message: "Registered successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error occurred!" });
    }
});

// Login Endpoint
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const response = await axios.get(`${FIREBASE_URL}/users/${username}.json`);
        const user = response.data;

        if (!user || user.password !== password) {
            return res.status(401).json({ success: false, message: "Invalid username or password, or account doesn't exist!" });
        }

        res.json({ success: true, message: "Login successful!", user: { fullName: user.fullName, ign: user.ign, platform: user.platform } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error occurred!" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
