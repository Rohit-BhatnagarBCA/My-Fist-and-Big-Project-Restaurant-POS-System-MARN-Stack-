const crypto = require("crypto");

// ============================================================
// EMAIL SERVICE — Brevo Transactional Email API
//
// Uses Brevo's HTTPS API directly instead of raw SMTP.
// Render's outbound network has repeatedly failed to reach
// SMTP ports (ENETUNREACH / ETIMEDOUT), which is a common
// issue on cloud hosts. A plain HTTPS API call sidesteps
// that completely — no SMTP ports involved at all.
// ============================================================

const generateOtp = () =>
  String(
    Math.floor(
      100000 +
        Math.random() * 900000
    )
  );

const hashOtp = (otp) =>
  crypto
    .createHash("sha256")
    .update(String(otp))
    .digest("hex");

const sendVerificationEmail =
  async ({ email, name, otp }) => {
    const response = await fetch(
      "https://api.brevo.com/v3/smtp/email",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
          "api-key":
            process.env.BREVO_API_KEY,
        },
        body: JSON.stringify({
          sender: {
            name: "Restro POS",
            email:
              process.env.SMTP_FROM,
          },

          to: [
            {
              email,
              name:
                name || "there",
            },
          ],

          subject:
            "Verify your Restro POS account",

          htmlContent: `
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
        }),
      }
    );

    if (!response.ok) {
      const errorBody =
        await response.text();

      throw new Error(
        `Brevo API error (${response.status}): ${errorBody}`
      );
    }
  };

module.exports = {
  generateOtp,
  hashOtp,
  sendVerificationEmail,
};