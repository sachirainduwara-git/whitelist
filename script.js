const FIREBASE_URL = "https://whitelist-a804a-default-rtdb.firebaseio.com";
const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1547513458856042537/Ly_6vwpkuMHN7gwBFUFmuEEcdvvHJVEnqL-svRpXHNdfybyC_Yl9J5SUUiQDD5nZMksp";

function switchTab(tab) {
    document.getElementById('tab-login').classList.toggle('active', tab === 'login');
    document.getElementById('tab-register').classList.toggle('active', tab === 'register');
    document.getElementById('login-form').classList.toggle('active', tab === 'login');
    document.getElementById('register-form').classList.toggle('active', tab === 'register');
}

function togglePlatform() {
    const platform = document.getElementById('reg-platform').value;
    const ignInput = document.getElementById('reg-ign');
    const ignLabel = document.getElementById('ign-label');

    if (platform === 'Bedrock') {
        ignLabel.innerText = "Bedrock In-Game Name (Starts with .)";
        if (!ignInput.value.startsWith('.')) {
            ignInput.value = '.' + ignInput.value.replace(/^\.+/, '');
        }
    } else {
        ignLabel.innerText = "Java In-Game Name (Exact IC Name)";
        if (ignInput.value.startsWith('.')) {
            ignInput.value = ignInput.value.replace(/^\./, '');
        }
    }
}

document.getElementById('reg-ign').addEventListener('input', function() {
    const platform = document.getElementById('reg-platform').value;
    if (platform === 'Bedrock' && !this.value.startsWith('.')) {
        this.value = '.' + this.value;
    }
});

async function handleRegister(e) {
    e.preventDefault();
    const fullName = document.getElementById('reg-fullname').value;
    const address = document.getElementById('reg-address').value;
    const age = document.getElementById('reg-age').value;
    const whatsapp = document.getElementById('reg-whatsapp').value;
    const platform = document.getElementById('reg-platform').value;
    let ign = document.getElementById('reg-ign').value;
    const username = document.getElementById('reg-username').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirmPass = document.getElementById('reg-confirmpass').value;
    const errorDiv = document.getElementById('reg-error');

    errorDiv.innerText = "";

    if (password !== confirmPass) {
        errorDiv.innerText = "Passwords do not match!";
        return;
    }

    if (platform === 'Bedrock' && !ign.startsWith('.')) {
        ign = '.' + ign;
    }

    showLoader("Saving to Firebase & notifying Discord webhook...");

    try {
        const userData = { fullName, address, age, whatsapp, platform, ign, username, password };

        // Save data to Firebase using standard fetch with no-cors or standard JSON endpoint
        const res = await fetch(`${FIREBASE_URL}/users/${username}.json`, {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        if (!res.ok) {
            throw new Error("Failed to save to database");
        }

        // Send to Discord Webhook (Using a safe try-catch so it won't break if blocked)
        const discordPayload = {
            content: "🚀 **New Minecraft Whitelist Registration!**",
            embeds: [{
                title: "LinuxHUB Survival - New Player",
                color: 5814783,
                fields: [
                    { name: "Full Name", value: fullName, inline: true },
                    { name: "Age", value: String(age), inline: true },
                    { name: "Platform", value: platform, inline: true },
                    { name: "In-Game Name (IGN)", value: ign, inline: true },
                    { name: "WhatsApp", value: whatsapp, inline: true },
                    { name: "Username", value: username, inline: true }
                ],
                timestamp: new Date().toISOString()
            }]
        };

        await fetch(DISCORD_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(discordPayload)
        }).catch(() => {});

        hideLoader();
        alert("🎉 Register Complete & Whitelisted Successfully!");
        switchTab('login');

    } catch (err) {
        hideLoader();
        console.error(err);
        errorDiv.innerText = "Connection error! Please check your internet or Firebase rules.";
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    const errorDiv = document.getElementById('login-error');

    errorDiv.innerText = "";
    showLoader("Verifying credentials...");

    try {
        const response = await fetch(`${FIREBASE_URL}/users/${username}.json`);
        const user = await response.json();
        hideLoader();

        if (!user || user.password !== password) {
            errorDiv.innerText = "Account එකක් හමුනෙ නැත හෝ Username/Password වැරදියි!";
            return;
        }

        document.getElementById('auth-wrapper').classList.add('hidden');
        document.getElementById('dashboard-wrapper').classList.remove('hidden');
        document.getElementById('dash-name').innerText = user.fullName;

    } catch (err) {
        hideLoader();
        errorDiv.innerText = "Login වීමට නොහැකි විය!";
    }
}

function logout() {
    document.getElementById('dashboard-wrapper').classList.add('hidden');
    document.getElementById('auth-wrapper').classList.remove('hidden');
}

function copyIP() {
    navigator.clipboard.writeText("LinuxHUB.aternos.me:47990");
    alert("Server IP copied to clipboard! 📋");
}

function showLoader(text) {
    document.getElementById('loader-text').innerText = text;
    document.getElementById('loader').classList.remove('hidden');
}

function hideLoader() {
    document.getElementById('loader').classList.add('hidden');
}
