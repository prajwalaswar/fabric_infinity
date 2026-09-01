type BrevoEmailInput = {
  recipientEmail: string;
  otp: string;
};

function getBrevoConfig() {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || "Fabric Infinity";

  if (!apiKey || !senderEmail) {
    return null;
  }

  return { apiKey, senderEmail, senderName };
}

export async function sendBrevoOtpEmail({
  recipientEmail,
  otp,
}: BrevoEmailInput): Promise<boolean> {
  const config = getBrevoConfig();
  if (!config) {
    return false;
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": config.apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: {
        email: config.senderEmail,
        name: config.senderName,
      },
      to: [{ email: recipientEmail }],
      subject: "Your Fabric Infinity verification code",
      textContent: `Your Fabric Infinity verification code is ${otp}. It expires in 10 minutes. If you did not request this code, you can ignore this email.`,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 560px; margin: 0 auto; padding: 24px;">
          <h1 style="color: #9a3412; margin-bottom: 8px;">Fabric Infinity</h1>
          <p>Use the verification code below to sign in to your account.</p>
          <div style="font-size: 32px; font-weight: 700; letter-spacing: 10px; background: #fff7ed; border: 1px solid #fed7aa; border-radius: 10px; padding: 16px; text-align: center; color: #9a3412; margin: 24px 0;">
            ${otp}
          </div>
          <p style="color: #6b7280; font-size: 14px;">This code expires in 10 minutes. If you did not request it, you can ignore this email.</p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("[brevo] OTP email failed", {
      status: response.status,
      response: errorBody.slice(0, 500),
    });
    return false;
  }

  return true;
}