const nodemailer = require("nodemailer");
const crypto = require("crypto");

const transporter =
  nodemailer.createTransport({
    host:
      process.env.SMTP_HOST,
    port:
      Number(
        process.env.SMTP_PORT ||
          587
      ),
    secure:
      String(
        process.env.SMTP_SECURE
      ).toLowerCase() ===
      "true",

    // Render's outbound network prefers IPv6, but Gmail's
    // SMTP endpoint over IPv6 is unreachable from Render
    // (ENETUNREACH). Forcing IPv4 fixes it.
    family: 4,

    auth: {
      user:
        process.env.SMTP_USER,
      pass:
        process.env.SMTP_PASS,
    },
  });

const generateOtp = () =>
  String(
    Math.floor(
      100000 +
        Math.random() *
          900000
    )
  );

const hashOtp = (
  otp
) =>
  crypto
    .createHash("sha256")
    .update(
      String(otp)
    )
    .digest("hex");

const sendVerificationEmail =
  async ({
    email,
    name,
    otp,
  }) => {
    await transporter.sendMail({
      from:
        process.env.SMTP_FROM ||
        process.env.SMTP_USER,

      to: email,

      subject:
        "Verify your Restro POS account",

      text:
        `Hi ${name || "there"},\n\n` +
        `Your Restro POS verification code is ${otp}.\n\n` +
        `This code expires in 10 minutes.\n\n` +
        `If you did not create this account, you can ignore this email.`,

      html: `
        <div style="font-family:Arial,sans-serif;background:#fffaf5;padding:30px;">
          <div style="max-width:520px;margin:auto;background:white;border:1px solid #eaded5;border-radius:18px;padding:28px;">
            
            <h2 style="margin:0 0 8px;color:#241b16;">
              Verify your Restro POS account
            </h2>

            <p style="color:#75685f;line-height:1.6;">
              Hi ${name || "there"},
            </p>

            <p style="color:#75685f;line-height:1.6;">
              Use the verification code below to confirm your email address.
            </p>

            <div style="margin:24px 0;text-align:center;">
              <div style="display:inline-block;background:#fff0e7;border:1px solid #e5b69e;border-radius:14px;padding:16px 24px;">
                <span style="font-size:30px;font-weight:800;letter-spacing:8px;color:#c65a2e;">
                  ${otp}
                </span>
              </div>
            </div>

            <p style="font-size:13px;color:#8b7a70;">
              This code expires in 10 minutes.
            </p>

            <p style="font-size:12px;color:#a09086;margin-top:24px;">
              Restro POS
            </p>

          </div>
        </div>
      `,
    });
  };

module.exports = {
  transporter,
  generateOtp,
  hashOtp,
  sendVerificationEmail,
};