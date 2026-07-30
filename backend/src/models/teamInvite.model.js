import mongoose from "mongoose";

const teamInviteSchema = new mongoose.Schema(
  {
    team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["pending", "accepted"], default: "pending" },
  },
  { timestamps: true }
);

teamInviteSchema.index({ team: 1, email: 1 }, { unique: true });

const TeamInvite = mongoose.model("TeamInvite", teamInviteSchema);
export default TeamInvite;