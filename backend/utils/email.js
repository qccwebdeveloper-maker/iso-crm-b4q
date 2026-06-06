const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host:   process.env.EMAIL_HOST  || 'smtp.gmail.com',
    port:   parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const FROM = process.env.EMAIL_FROM || '"QCC CRM" <noreply@qccert.com>';

// ── Send OTP email
const sendOtpEmail = async ({ to, name, otp, expiresInMinutes = 10 }) => {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: FROM,
    to,
    subject: `${otp} — Your QCC Admin Login OTP`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 20px;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#f97316,#ea580c);padding:28px 32px;text-align:center;">
            <div style="font-size:28px;font-weight:900;color:white;letter-spacing:2px;">QCC</div>
            <div style="font-size:13px;color:rgba(255,255,255,0.85);margin-top:4px;">Quality Control Certification</div>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px 32px 24px;">
            <h2 style="margin:0 0 8px;font-size:20px;color:#1e293b;">Admin Login OTP</h2>
            <p style="margin:0 0 24px;color:#64748b;font-size:14px;line-height:1.6;">
              Hi <strong style="color:#1e293b;">${name}</strong>,<br/>
              Use the following OTP to sign in to your Admin dashboard.
              This code expires in <strong>${expiresInMinutes} minutes</strong>.
            </p>

            <!-- OTP Box -->
            <div style="background:#fff7ed;border:2px solid #fed7aa;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
              <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#f97316;margin-bottom:10px;">One-Time Password</div>
              <div style="font-size:42px;font-weight:900;letter-spacing:14px;color:#ea580c;font-family:monospace;">${otp}</div>
              <div style="font-size:12px;color:#94a3b8;margin-top:10px;">Valid for ${expiresInMinutes} minutes only</div>
            </div>

            <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:12px 16px;margin-bottom:24px;">
              <p style="margin:0;font-size:12.5px;color:#991b1b;">
                ⚠️ <strong>Never share this OTP.</strong> QCC will never ask for your OTP via call or message.
                If you did not request this, ignore this email.
              </p>
            </div>

            <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.6;">
              If you're having trouble, contact your system administrator.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:16px 32px;text-align:center;">
            <p style="margin:0;font-size:11px;color:#94a3b8;">
              &copy; ${new Date().getFullYear()} Quality Control Certification (QCC) · ISO Certification Management Platform
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
    `,
  });
};

// ── Send welcome / activation email to newly created client
const sendWelcomeEmail = async ({ to, name, clientId, email, password }) => {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: FROM,
    to,
    subject: `Welcome to QCC CRM — Your Account is Ready`,
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 20px;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#f97316,#ea580c);padding:28px 32px;text-align:center;">
            <div style="font-size:28px;font-weight:900;color:white;letter-spacing:2px;">QCC</div>
            <div style="font-size:13px;color:rgba(255,255,255,0.85);margin-top:4px;">Quality Control Certification</div>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <h2 style="margin:0 0 8px;font-size:20px;color:#1e293b;">Welcome, ${name}!</h2>
            <p style="margin:0 0 20px;color:#64748b;font-size:14px;line-height:1.6;">Your account has been activated on the QCC ISO Certification CRM platform.</p>
            <div style="background:#fff7ed;border:2px solid #fed7aa;border-radius:12px;padding:20px;margin-bottom:20px;">
              <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#f97316;margin-bottom:12px;">Your Login Credentials</div>
              <table width="100%" cellpadding="4">
                <tr><td style="font-size:12px;color:#64748b;width:110px;">Client ID</td><td style="font-size:13px;font-weight:700;color:#1e293b;font-family:monospace;">${clientId}</td></tr>
                <tr><td style="font-size:12px;color:#64748b;">Email</td><td style="font-size:13px;font-weight:700;color:#1e293b;">${email}</td></tr>
                <tr><td style="font-size:12px;color:#64748b;">Password</td><td style="font-size:13px;font-weight:700;color:#ea580c;font-family:monospace;">${password}</td></tr>
              </table>
            </div>
            <p style="margin:0 0 8px;font-size:12.5px;color:#94a3b8;">Login at: <a href="http://localhost:3000" style="color:#f97316;">QCC CRM Platform</a></p>
            <p style="margin:0;font-size:11.5px;color:#f87171;">⚠️ Please change your password after first login.</p>
          </td>
        </tr>
        <tr>
          <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:14px 32px;text-align:center;">
            <p style="margin:0;font-size:11px;color:#94a3b8;">&copy; ${new Date().getFullYear()} Quality Control Certification (QCC)</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
    `,
  });
};

// ── Generic send (for any email need)
const sendEmail = async ({ to, subject, html }) => {
  const transporter = createTransporter();
  await transporter.sendMail({ from: FROM, to, subject, html });
};

module.exports = { sendOtpEmail, sendWelcomeEmail, sendEmail };
