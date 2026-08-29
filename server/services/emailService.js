const nodemailer = require("nodemailer");

// Configure transporter dynamically or fallback to test console logger
const createTransporter = () => {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return null;
};

/**
 * Sends a stylized HTML email
 */
async function sendEmail({ to, subject, htmlText, title, actionLink, actionText }) {
  const transporter = createTransporter();

  const formattedHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
        .container { max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        .logo { font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 24px; display: inline-block; text-decoration: none; }
        .badge { display: inline-block; padding: 4px 10px; background: #fee2e2; color: #991b1b; font-weight: 600; font-size: 12px; border-radius: 9999px; margin-bottom: 12px; }
        h1 { font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 12px; }
        p { font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
        .btn { display: inline-block; background: #0f172a; color: #ffffff; font-weight: 600; font-size: 14px; padding: 12px 24px; border-radius: 8px; text-decoration: none; }
        .footer { margin-top: 32px; pt-24px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">⚡ DeadlineDesk</div>
        ${title ? `<div class="badge">${title}</div>` : ""}
        <h1>${subject}</h1>
        <p>${htmlText}</p>
        ${actionLink ? `<a href="${actionLink}" class="btn">${actionText || "View Application"}</a>` : ""}
        <div class="footer">
          Sent by DeadlineDesk Internship Tracker • <a href="http://localhost:3000/account" style="color: #94a3b8;">Notification Settings</a>
        </div>
      </div>
    </body>
    </html>
  `;

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: `"DeadlineDesk" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html: formattedHtml,
      });
      console.log(`✉️ Email sent to ${to}: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error("❌ Email transport error:", err.message);
      return { success: false, error: err.message };
    }
  } else {
    console.log("\n================ [EMAIL SERVICE MOCK SEND] ================");
    console.log(`TO: ${to}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`BODY SUMMARY: ${htmlText.substring(0, 100)}...`);
    console.log("===========================================================\n");
    return { success: true, mock: true };
  }
}

module.exports = { sendEmail };
