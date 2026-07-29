import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    citedChunks: [
      {
        repoId: mongoose.Schema.Types.ObjectId,
        repoName: String,
        filePath: String,
        symbolName: String,
        startLine: Number,
        endLine: Number,
        code: String,
      },
    ],
  },
  { timestamps: true }
);

const conversationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    repo: { type: mongoose.Schema.Types.ObjectId, ref: "Repo" },
    repos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Repo" }],
    messages: [messageSchema],
  },
  { timestamps: true }
);

conversationSchema.index({ user: 1, "messages.content": "text" });

const Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation;