// ─── Validation ──────────────────────────────────────────
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPassword(password) {
    return password.length >= 6;
}

// ─── Toggle between Sign In and Sign Up ─────────────────
function showSignin() {
    document.getElementById('signinForm').classList.remove('hidden');
    document.getElementById('signupForm').classList.add('hidden');
    document.getElementById('signinBtn').classList.add('active');
    document.getElementById('signupBtn').classList.remove('active');
    clearMessage();
}

function showSignup() {
    document.getElementById('signupForm').classList.remove('hidden');
    document.getElementById('signinForm').classList.add('hidden');
    document.getElementById('signupBtn').classList.add('active');
    document.getElementById('signinBtn').classList.remove('active');
    clearMessage();
}

// ─── Google Login ────────────────────────────────────────
function googleLogin() {
    window.location.href = '/auth/google';
}

// ─── Show Message ────────────────────────────────────────
function showMessage(msg, type) {
    const el = document.getElementById('message');
    el.textContent = msg;
    el.className = type; // 'success' or 'error'
}

function clearMessage() {
    const el = document.getElementById('message');
    el.textContent = '';
    el.className = '';
}

// ─── Sign Up: Step 1 - Send OTP ─────────────────────────
async function sendOTP() {
    const email = document.getElementById('signupEmail').value;
    if (!email) return showMessage('Please enter your email!', 'error');
    if (!isValidEmail(email)) return showMessage('Please enter a valid email!', 'error');

    showMessage('Sending OTP...', '');

    try {
        const res = await fetch('/signup/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const data = await res.json();

        if (res.ok) {
            document.getElementById('step1').classList.add('hidden');
            document.getElementById('step2').classList.remove('hidden');
            showMessage('OTP sent! Check mail inbox please', 'success');
        } else {
            showMessage(data.message, 'error');
        }
    } catch (err) {
        showMessage('Something went wrong!', 'error');
    }
}



// ─── Resend OTP ──────────────────────────────────────────
async function resendOTP() {
    const email = document.getElementById('signupEmail').value;
    showMessage('Resending OTP...', '');

    try {
        const res = await fetch('/signup/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        if (res.ok) {
            showMessage('New OTP sent! Check mail inbox please', 'success');
        } else {
            showMessage('Failed to resend OTP!', 'error');
        }
    } catch (err) {
        showMessage('Something went wrong!', 'error');
    }
}

// ─── Sign Up: Step 2 - Verify OTP ───────────────────────
async function verifyOTP() {
    const email = document.getElementById('signupEmail').value;
    const otp = document.getElementById('otpInput').value;
    const password = document.getElementById('signupPassword').value;

    if (!otp || !password) return showMessage('Please fill all fields!', 'error');
    if (!isValidPassword(password)) return showMessage('Password must be at least 6 characters!', 'error');
    showMessage('Verifying...', '');

    try {
        const res = await fetch('/signup/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp, password })
        });
        const data = await res.json();

        if (res.ok) {
            showMessage('Account created successfully! feel free to login!', 'success');
            setTimeout(() => showSignin(), 2000);
        } else {
            showMessage(data.message, 'error');
        }
    } catch (err) {
        showMessage('Something went wrong!', 'error');
    }
}

// ─── Sign In ─────────────────────────────────────────────
async function signin() {
    const email = document.getElementById('signinEmail').value;
    const password = document.getElementById('signinPassword').value;

    if (!email || !password) return showMessage('Please fill all fields!', 'error');
    if (!isValidEmail(email)) return showMessage('Please enter a valid email!', 'error');
    if (!isValidPassword(password)) return showMessage('Password must be at least 6 characters!', 'error');

    showMessage('Signing in...', '');

    try {
        const res = await fetch('/signin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (res.ok) {
            showMessage(`Welcome back! 🎉`, 'success');
            setTimeout(() => window.location.href = '/dashboard', 1000);
        } else {
            showMessage(data.message, 'error');
        }
    } catch (err) {
        showMessage('Something went wrong!', 'error');
    }
}