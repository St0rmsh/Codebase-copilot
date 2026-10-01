import mongoose from "mongoose";

const teamActionOtpSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    purpose: { type: String, enum: ["create-team", "join-team"], required: true },
    otpHash: { type: String, required: true, select: false },
    payload: { type: mongoose.Schema.Types.Mixed, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

teamActionOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
teamActionOtpSchema.index({ user: 1, purpose: 1 }, { unique: true });

const TeamActionOtp = mongoose.model("TeamActionOtp", teamActionOtpSchema);
export default TeamActionOtp;