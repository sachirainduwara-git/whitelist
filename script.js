// Firebase Configuration
const firebaseConfig = {
    databaseURL: "https://whitelist-a804a-default-rtdb.firebaseio.com"
};

try {
    firebase.initializeApp(firebaseConfig);
} catch (e) {
    console.log("Firebase already initialized");
}

const db = firebase.database();
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

// Register Function
function handleRegister(e) {
    e.preventDefault();
    
    const fullName = document.getElementById('reg-fullname').value.trim();
    const address = document.getElementById('reg-address').value.trim();
    const age = document.getElementById('reg-age').value.trim();
    const whatsapp = document.getElementById('reg-whatsapp').value.trim();
    const platform = document.getElementById('reg-platform').value;
    let ign = document.getElementById('reg-ign').value.trim();
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

    if (platform === 'Bedrock' && !ign.startsWith('.')) {
        ign = '.' + ign;
    }

    regBtn.disabled = true;
    regBtn.style.opacity = "0.5";
    statusContainer.classList.remove('hidden', 'status-success');
    spinner.style.display = 'block';
    statusText.innerText = "⏳ පරීක්ෂා කරමින්...";

    // Sanitize username to be safe for Firebase path (remove dots or special characters if any)
    const safeUserKey = username.replace(/[.#$[\]]/g, "_");

    db.ref('users/' + safeUserKey).once('value')
        .then((snapshot) => {
            if (snapshot.exists()) {
                throw new Error("USERNAME_EXISTS");
            }
            
            statusText.innerText = "💾 Save වෙමින්...";
            const userData = { fullName, address, age, whatsapp, platform, ign, username, password };
            
            return db.ref('users/' + safeUserKey).set(userData);
        })
        .then(() => {
            statusText.innerText = "🚀 Discord යවමින්...";

            // Send to Discord Webhook via fetch proxy safely
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

            fetch("https://corsproxy.io/?" + encodeURIComponent(DISCORD_WEBHOOK), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(discordPayload)
            }).catch(() => {});

            statusText.innerText = "✅ Register Complete!";
            statusContainer.classList.add('status-success');
            spinner.style.display = 'none';

            setTimeout(() => {
                document.getElementById('register-form').reset();
                switchTab('login');
                regBtn.disabled = false;
                regBtn.style.opacity = "1";
                statusContainer.classList.add('hidden');
            }, 1800);
        })
        .catch((err) => {
            statusContainer.classList.add('hidden');
            regBtn.disabled = false;
            regBtn.style.opacity = "1";

            if (err.message === "USERNAME_EXISTS") {
                errorDiv.innerText = "මෙම Username එක දැනටමත් ඇත!";
            } else {
                console.error(err);
                errorDiv.innerText = "Database connection error. Try again!";
            }
        });
}

// Login Function
function handleLogin(e) {
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

    const safeUserKey = username.replace(/[.#$[\]]/g, "_");

    db.ref('users/' + safeUserKey).once('value')
        .then((snapshot) => {
            if (!snapshot.exists()) {
                throw new Error("INVALID_USER");
            }

            const user = snapshot.val();
            if (user.password !== password) {
                throw new Error("INVALID_PASSWORD");
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
            }, 1200);
        })
        .catch((err) => {
            statusContainer.classList.add('hidden');
            loginBtn.disabled.value = false;
            loginBtn.disabled = false;
            loginBtn.style.opacity = "1";
            errorDiv.innerText = "Username හෝ Password වැරදියි!";
        });
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
