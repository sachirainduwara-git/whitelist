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
        if (!ignInput.value.startsWith('.')) ignInput.value = '.' + ignInput.value.replace(/^\.+/, '');
    } else {
        ignLabel.innerText = "Java In-Game Name (Exact IC Name)";
        if (ignInput.value.startsWith('.')) ignInput.value = ignInput.value.replace(/^\./, '');
    }
}

document.getElementById('reg-ign').addEventListener('input', function() {
    if (document.getElementById('reg-platform').value === 'Bedrock' && !this.value.startsWith('.')) {
        this.value = '.' + this.value;
    }
});

// Delay function for smooth animation viewing
const delay = ms => new Promise(res => setTimeout(res, ms));

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
    const statusContainer = document.getElementById('reg-status');
    const statusText = document.getElementById('reg-status-text');
    const regBtn = document.getElementById('reg-btn');
    const spinner = statusContainer.querySelector('.mini-spinner');

    errorDiv.innerText = "";

    if (password !== confirmPass) {
        errorDiv.innerText = "Passwords do not match!";
        return;
    }

    if (platform === 'Bedrock' && !ign.startsWith('.')) ign = '.' + ign;

    // Start Animation Process
    regBtn.disabled = true;
    regBtn.style.opacity = "0.5";
    statusContainer.classList.remove('hidden', 'status-success');
    spinner.style.display = 'block';

    const updateStatus = (text) => { statusText.innerText = text; };

    try {
        // STEP 1: Check existing details
        updateStatus("⏳ තොරතුරු පරීක්ෂා කරමින්...");
        await delay(800);

        const checkRes = await fetch(`${FIREBASE_URL}/users/${username}.json`);
        if (!checkRes.ok) throw new Error("FIREBASE_RULES_ERROR");
        const existingData = await checkRes.json();
        
        if (existingData) {
            throw new Error("USERNAME_EXISTS");
        }

        // STEP 2: Save to Firebase
        updateStatus("💾 Firebase වෙත Save වෙමින්...");
        await delay(800);

        const userData = { fullName, address, age, whatsapp, platform, ign, username, password };
        const saveRes = await fetch(`${FIREBASE_URL}/users/${username}.json`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        if (!saveRes.ok) throw new Error("FIREBASE_RULES_ERROR");

        // STEP 3: Send to Discord
        updateStatus("🚀 Discord වෙත යවමින්...");
        await delay(600);

        const discordPayload = {
            content: "🚀 **New Minecraft Whitelist Registration!**",
            embeds: [{
                title: "LinuxHUB Survival - New Player", color: 5814783,
                fields: [
                    { name: "Full Name", value: fullName, inline: true },
                    { name: "Platform", value: platform, inline: true },
                    { name: "IGN", value: ign, inline: true },
                    { name: "WhatsApp", value: whatsapp, inline: true },
                    { name: "Username", value: username, inline: true }
                ],
                timestamp: new Date().toISOString()
            }]
        };

        // Bypass CORS Error with proxy
        const proxyUrl = "https://corsproxy.io/?" + encodeURIComponent(DISCORD_WEBHOOK);
        try {
            await fetch(proxyUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(discordPayload)
            });
        } catch(e) { console.log("Discord proxy warning ignored"); }

        // STEP 4: Complete
        updateStatus("✅ Register Complete! සුපිරි...");
        statusContainer.classList.add('status-success');
        spinner.style.display = 'none';

        setTimeout(() => {
            document.getElementById('register-form').reset();
            switchTab('login');
            regBtn.disabled = false;
            regBtn.style.opacity = "1";
            statusContainer.classList.add('hidden');
        }, 2500);

    } catch (err) {
        statusContainer.classList.add('hidden');
        regBtn.disabled = false;
        regBtn.style.opacity = "1";

        if (err.message === "USERNAME_EXISTS") {
            errorDiv.innerText = "මෙම Username එක දැනටමත් ඇත! වෙන එකක් දෙන්න.";
        } else if (err.message === "FIREBASE_RULES_ERROR") {
            errorDiv.innerText = "Database Error! Firebase Rules (read/write) 'true' කර නැත!";
        } else {
            errorDiv.innerText = "Connection error. Please try again.";
        }
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    
    const errorDiv = document.getElementById('login-error');
    const statusContainer = document.getElementById('login-status');
    const statusText = document.getElementById('login-status-text');
    const loginBtn = document.getElementById('login-btn');
    const spinner = statusContainer.querySelector('.mini-spinner');

    errorDiv.innerText = "";
    loginBtn.disabled = true;
    loginBtn.style.opacity = "0.5";
    statusContainer.classList.remove('hidden', 'status-success');
    spinner.style.display = 'block';
    statusText.innerText = "🔐 Verify කරමින්...";

    try {
        await delay(800);
        const response = await fetch(`${FIREBASE_URL}/users/${username}.json`);
        if (!response.ok) throw new Error("FIREBASE_RULES_ERROR");
        
        const user = await response.json();

        if (!user || user.password !== password) {
            throw new Error("INVALID_LOGIN");
        }

        statusText.innerText = "✅ Login Successful!";
        statusContainer.classList.add('status-success');
        spinner.style.display = 'none';

        setTimeout(() => {
            document.getElementById('auth-wrapper').classList.add('hidden');
            document.getElementById('dashboard-wrapper').classList.remove('hidden');
            document.getElementById('dash-name').innerText = user.fullName;
            loginBtn.disabled = false;
            loginBtn.style.opacity = "1";
            statusContainer.classList.add('hidden');
        }, 1500);

    } catch (err) {
        statusContainer.classList.add('hidden');
        loginBtn.disabled = false;
        loginBtn.style.opacity = "1";

        if (err.message === "FIREBASE_RULES_ERROR") {
            errorDiv.innerText = "Database Error! Firebase Rules 'true' කර නැත!";
        } else {
            errorDiv.innerText = "Account එකක් නැත හෝ Username/Password වැරදියි!";
        }
    }
}

function logout() {
    document.getElementById('dashboard-wrapper').classList.add('hidden');
    document.getElementById('auth-wrapper').classList.remove('hidden');
    document.getElementById('login-form').reset();
}

function copyIP() {
    navigator.clipboard.writeText("LinuxHUB.aternos.me:47990");
    alert("Server IP copied to clipboard! 📋");
}
