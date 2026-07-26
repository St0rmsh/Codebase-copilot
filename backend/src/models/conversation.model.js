import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    citedChunks: [
      {
        filePath: String,
        symbolName: String,
        startLine: Number,
        endLine: Number,
      },
    ],
  },
  { timestamps: true }
);

const conversationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    repo: { type: mongoose.Schema.Types.ObjectId, ref: "Repo", required: true },
    messages: [messageSchema],
  },
  { timestamps: true }
);

const Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation;