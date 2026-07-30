import crypto from "crypto";

export const generateWebhookSecret = () => crypto.randomBytes(24).toString("hex");

export const verifyGithubSignature = (payloadBody, signatureHeader, secret) => {
  if (!signatureHeader) return false;
  const expectedSignature =
    "sha256=" + crypto.createHmac("sha256", secret).update(payloadBody).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(signatureHeader), Buffer.from(expectedSignature));
  } catch {
    return false;
  }
};