import "dotenv/config";
import mongoose from "mongoose";
import dns from "dns"

dns.setServers(["8.8.8.8", "8.8.4.8"])
const COLLECTION_NAME = "chunks";

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const result = await mongoose.connection.db
    .collection(COLLECTION_NAME)
    .aggregate([
      { $match: { embedding: { $type: "array" } } },
      { $group: { _id: { $size: "$embedding" }, count: { $sum: 1 } } },
    ])
    .toArray();

  console.log("Embedding dimensions in stored chunks:");
  console.table(result.map((r) => ({ dimensions: r._id, count: r.count })));

  const withoutEmbedding = await mongoose.connection.db
    .collection(COLLECTION_NAME)
    .countDocuments({ embedding: { $exists: false } });
  console.log("Chunks with no embedding yet:", withoutEmbedding);

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});