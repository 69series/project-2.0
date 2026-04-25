const nodemailer = require('nodemailer');

// Store OTPs temporarily in memory
const otpStore = {};

// Generate a 6 digit OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP via email
async function sendOTP(email) {
    const otp = generateOTP();
    otpStore[email] = {
        otp,
        expiresAt: Date.now() + 5 * 60 * 1000 // expires in 5 minutes
    };

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS,
        }
    });

    await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: email,
        subject: 'Your OTP - 69s-project-2.0',
        text: `Your OTP is: ${otp}. It expires in 5 minutes.
        Resentment is corrossive and I hate it -TS.
        When You come from NOTHING, You appeciate EVERYTHING -69s`
    });

    console.log(`OTP sent to ${email}`);
}

// Verify OTP
function verifyOTP(email, otp) {
    const record = otpStore[email];
    if (!record) return false;
    if (Date.now() > record.expiresAt) {
        delete otpStore[email];
        return false;
    }
    if (record.otp !== otp) return false;
    delete otpStore[email];
    return true;
}

module.exports = { sendOTP, verifyOTP };