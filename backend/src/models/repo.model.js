import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    path: { type: String, required: true },
    extension: { type: String },
    size: { type: Number },
  },
  { _id: false }
);

const graphEdgeSchema = new mongoose.Schema(
  {
    from: { type: String, required: true },
    to: { type: String, required: true },
  },
  { _id: false }
);

const repoSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    githubRepoId: { type: String, required: true },
    name: { type: String, required: true },
    fullName: { type: String, required: true },
    private: { type: Boolean, default: false },
    defaultBranch: { type: String, default: "main" },
    cloneUrl: { type: String, required: true },
    localPath: { type: String, default: null },
    status: {
      type: String,
      enum: ["pending", "cloning", "indexed", "failed"],
      default: "pending",
    },
    team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", default: null },
    files: [fileSchema],
    fileCount: { type: Number, default: 0 },
    dependencyGraph: [graphEdgeSchema],
    errorMessage: { type: String, default: null },
    webhookId: { type: Number, default: null },
    webhookSecret: { type: String, default: null, select: false },
  },
  { timestamps: true }
);

const Repo = mongoose.model("Repo", repoSchema);
export default Repo;