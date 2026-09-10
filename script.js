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

// Ensure bedrock IGN always starts with a dot if selected
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
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    const confirmPass = document.getElementById('reg-confirmpass').value;
    const errorDiv = document.getElementById('reg-error');

    if (password !== confirmPass) {
        errorDiv.innerText = "Passwords do not match!";
        return;
    }

    if (platform === 'Bedrock' && !ign.startsWith('.')) {
        ign = '.' + ign;
    }

    showLoader("Checking details, saving to Firebase & notifying Discord webhook...");

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullName, address, age, whatsapp, platform, ign, username, password })
        });

        const data = await response.json();
        hideLoader();

        if (data.success) {
            alert("🎉 Register Complete & Whitelisted Successfully!");
            switchTab('login');
        } else {
            errorDiv.innerText = data.message;
        }
    } catch (err) {
        hideLoader();
        errorDiv.innerText = "Connection error. Please try again.";
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const errorDiv = document.getElementById('login-error');

    showLoader("Verifying credentials with Firebase...");

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        hideLoader();

        if (data.success) {
            document.getElementById('auth-wrapper').classList.add('hidden');
            document.getElementById('dashboard-wrapper').classList.remove('hidden');
            document.getElementById('dash-name').innerText = data.user.fullName;
        } else {
            errorDiv.innerText = data.message;
        }
    } catch (err) {
        hideLoader();
        errorDiv.innerText = "Account එකක් හමුනෙ නැත හෝ Login වීමට නොහැකි විය!";
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
