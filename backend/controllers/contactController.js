const nodemailer = require('nodemailer');

// ─── helpers ────────────────────────────────────────────────────────────────

function isValidIndianMobile(num) {
  // Strips spaces, dashes, country codes (+91 / 0)
  const cleaned = num.replace(/[\s\-]/g, '').replace(/^(\+91|0)/, '');
  return /^[6-9]\d{9}$/.test(cleaned);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/[<>]/g, '');
}

// ─── mailer factory ──────────────────────────────────────────────────────────

function createTransporter() {
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST   || 'smtp.gmail.com',
    port:   parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true', // true = TLS on 465
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// ─── controller ─────────────────────────────────────────────────────────────

async function submitContact(req, res) {
  try {
    const {
      name,
      mobile,
      purpose,
      institute,
      email,
    } = req.body;

    // ── server-side validation ──────────────────────────────────────────────

    const errors = {};

    const cleanName = sanitize(name);
    if (!cleanName) errors.name = 'Name is required.';
    else if (cleanName.length > 120) errors.name = 'Name is too long.';

    const cleanMobile = sanitize(mobile);
    if (!cleanMobile) {
      errors.mobile = 'Mobile number is required.';
    } else if (!isValidIndianMobile(cleanMobile)) {
      errors.mobile = 'Please enter a valid 10-digit Indian mobile number.';
    }

    const cleanPurpose   = sanitize(purpose   || '');
    const cleanInstitute = sanitize(institute  || '');
    const cleanEmail     = sanitize(email      || '');

    if (cleanEmail && !isValidEmail(cleanEmail)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    // ── guard: SMTP must be configured ─────────────────────────────────────
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('[Contact] SMTP credentials not configured in environment.');
      return res.status(503).json({
        success: false,
        message: 'Email service is not configured. Please contact us directly.',
      });
    }

    // ── build email ─────────────────────────────────────────────────────────
    const recipientEmail = process.env.CONTACT_RECIPIENT || process.env.SMTP_USER;

    const htmlBody = `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
        <div style="background: #0a0a0a; padding: 28px 32px; border-radius: 10px 10px 0 0;">
          <p style="margin:0; font-family: monospace; font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(255,255,255,0.45);">ViewFinder · Confluenz</p>
          <h1 style="margin: 8px 0 0; font-size: 22px; font-weight: 500; color: #fff; letter-spacing: -0.01em;">New Enquiry Received</h1>
        </div>
        <div style="background: #f9f9f9; padding: 28px 32px; border-radius: 0 0 10px 10px;">
          <table style="width:100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e8e8e8; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.08em; width: 36%;">Name</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e8e8e8; font-size: 14px; color: #1a1a1a;">${cleanName}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e8e8e8; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.08em;">Mobile</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e8e8e8; font-size: 14px; color: #1a1a1a;">${cleanMobile}</td>
            </tr>
            ${cleanEmail ? `
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e8e8e8; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.08em;">Email</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e8e8e8; font-size: 14px; color: #1a1a1a;"><a href="mailto:${cleanEmail}" style="color:#0066cc;">${cleanEmail}</a></td>
            </tr>` : ''}
            ${cleanInstitute ? `
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e8e8e8; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.08em;">Institute / Co.</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e8e8e8; font-size: 14px; color: #1a1a1a;">${cleanInstitute}</td>
            </tr>` : ''}
            ${cleanPurpose ? `
            <tr>
              <td style="padding: 10px 0; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.08em; vertical-align: top;">Purpose</td>
              <td style="padding: 10px 0; font-size: 14px; color: #1a1a1a; line-height: 1.6;">${cleanPurpose.replace(/\n/g, '<br/>')}</td>
            </tr>` : ''}
          </table>
          <p style="margin: 24px 0 0; font-size: 11px; color: #aaa; font-family: monospace; letter-spacing: 0.06em;">Submitted at ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</p>
        </div>
      </div>
    `;

    const textBody = [
      'New enquiry via ViewFinder / Confluenz',
      '─'.repeat(40),
      `Name:        ${cleanName}`,
      `Mobile:      ${cleanMobile}`,
      cleanEmail     ? `Email:       ${cleanEmail}`     : null,
      cleanInstitute ? `Institute:   ${cleanInstitute}` : null,
      cleanPurpose   ? `Purpose:\n${cleanPurpose}`      : null,
      '─'.repeat(40),
      `Submitted: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST`,
    ].filter(Boolean).join('\n');

    const transporter = createTransporter();

    await transporter.sendMail({
      from:    `"ViewFinder · Confluenz" <${process.env.SMTP_USER}>`,
      to:      recipientEmail,
      replyTo: cleanEmail || undefined,
      subject: `[ViewFinder Enquiry] ${cleanName}`,
      text:    textBody,
      html:    htmlBody,
    });

    return res.status(200).json({
      success: true,
      message: 'Your enquiry has been sent. We\'ll be in touch soon.',
    });

  } catch (err) {
    console.error('[Contact] Email delivery error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again or email us directly.',
    });
  }
}

module.exports = { submitContact };
