import nodemailer from "nodemailer";
import config from "../config/config.js";

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: config.SMTP_EMAIL,
        pass: config.SMTP_APP_PASSWORD,
    },
    tls: {
        rejectUnauthorized: false,
    }
});


const buildOtpEmailHtml = (otp) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verification Code</title>
</head>
<body style="margin:0; padding:0; background-color:#0A0A0A; font-family: 'Courier New', Courier, monospace;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0A0A0A; padding:48px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px; width:100%;">

          <!-- Logo / Header -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <div style="display:inline-block; border-bottom:2px solid #E8302A; padding-bottom:8px;">
                <span style="font-size:22px; font-weight:bold; letter-spacing:3px; color:#F2A79D; text-transform:uppercase;">
                  Codebase Copilot
                </span>
              </div>
              <div style="font-size:11px; letter-spacing:2px; color:#8A8A8A; text-transform:uppercase; margin-top:10px;">
                Autonomous Engineering
              </div>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background-color:#141414; border:1px solid #262626;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:28px 32px 0 32px;">
                    <span style="font-size:11px; letter-spacing:2px; color:#E8302A; text-transform:uppercase;">
                      ⚡ System Access
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 32px 0 32px; border-bottom:1px solid #262626; padding-bottom:20px;">
                    <p style="margin:0; font-size:14px; line-height:22px; color:#CFCFCF;">
                      A verification code was requested for your account. Enter this code to confirm your identity and complete access.
                    </p>
                  </td>
                </tr>

                <!-- OTP Block -->
                <tr>
                  <td align="center" style="padding:32px;">
                    <div style="font-size:11px; letter-spacing:2px; color:#8A8A8A; text-transform:uppercase; margin-bottom:14px;">
                      Verification Code
                    </div>
                    <div style="display:inline-block; background-color:#0A0A0A; border:1px solid #E8302A; padding:16px 32px;">
                      <span style="font-size:34px; font-weight:bold; letter-spacing:10px; color:#E8302A;">
                        ${otp}
                      </span>
                    </div>
                    <div style="font-size:11px; color:#8A8A8A; margin-top:16px; letter-spacing:0.5px;">
                      This code expires in 10 minutes.
                    </div>
                  </td>
                </tr>

                <!-- Footer note -->
                <tr>
                  <td style="padding:0 32px 28px 32px; border-top:1px solid #262626; padding-top:18px;">
                    <p style="margin:0; font-size:11px; line-height:18px; color:#5F5F5F;">
                      If you did not request this code, you can safely ignore this email — no changes will be made to your account.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Bottom status bar -->
          <tr>
            <td style="padding-top:24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:10px; letter-spacing:1px; color:#5F5F5F;">
                    AES-256-GCM / RSA-4096
                  </td>
                  <td align="right" style="font-size:10px; letter-spacing:1px; color:#5F5F5F;">
                    © 2026 SYSTEM_CORE
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export const sendOtpEmail = async (toEmail, otp) => {
  await transporter.sendMail({
    from: `"Codebase Copilot" <${config.SMTP_EMAIL}>`,
    to: toEmail,
    subject: `${otp} is your Codebase Copilot verification code`,
    html: buildOtpEmailHtml(otp),
  });
};




const buildTeamInviteEmailHtml = (teamName) => `
<!DOCTYPE html>
<html>
<body style="margin:0; padding:0; background-color:#0A0A0A; font-family: 'Courier New', Courier, monospace;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0A0A0A; padding:48px 16px;">
    <tr><td align="center">
      <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px; width:100%;">
        <tr><td align="center" style="padding-bottom:32px;">
          <span style="font-size:22px; font-weight:bold; letter-spacing:3px; color:#F2A79D; text-transform:uppercase;">Codebase Copilot</span>
        </td></tr>
        <tr><td style="background-color:#141414; border:1px solid #262626; padding:28px 32px;">
          <p style="color:#CFCFCF; font-size:14px; line-height:22px;">
            You've been invited to join the <strong style="color:#E8302A;">${teamName}</strong> workspace on Codebase Copilot.
          </p>
          <p style="color:#8A8A8A; font-size:12px; margin-top:16px;">
            Log in or create an account with this email address to automatically join the team.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
`;

export const sendTeamInviteEmail = async (toEmail, teamName) => {
  await transporter.sendMail({
    from: `"Codebase Copilot" <${config.SMTP_EMAIL}>`,
    to: toEmail,
    subject: `You've been invited to join ${teamName}`,
    html: buildTeamInviteEmailHtml(teamName),
  });
};