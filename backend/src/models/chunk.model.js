import mongoose from "mongoose";

const chunkSchema = new mongoose.Schema(
  {
    repo: { type: mongoose.Schema.Types.ObjectId, ref: "Repo", required: true },
    filePath: { type: String, required: true },
    chunkType: {
      type: String,
      enum: ["function", "class", "component", "arrow_function", "method", "file"],
      required: true,
    },
    symbolName: { type: String, default: "anonymous" },
    code: { type: String, required: true },
    startLine: { type: Number, required: true },
    endLine: { type: Number, required: true },
    embedding: {
      type: [Number],
      default: [],
    }
  },
  { timestamps: true }
);

chunkSchema.index({ repo: 1, filePath: 1 });

const Chunk = mongoose.model("Chunk", chunkSchema);
export default Chunk;