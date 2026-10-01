import "dotenv/config";
import mongoose from "mongoose";
import dns from "dns"

dns.setServers(["8.8.8.8", "8.8.4.8"])
const COLLECTION_NAME = "chunks";
const EXPECTED_DIMENSIONS = 1024;

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const collection = mongoose.connection.db.collection(COLLECTION_NAME);

  const result = await collection.updateMany(
    {
      embedding: { $type: "array" },
      $expr: { $ne: [{ $size: "$embedding" }, EXPECTED_DIMENSIONS] },
    },
    { $unset: { embedding: "" } }
  );

  console.log("Chunks with embedding reset:", result.modifiedCount);

  const stillValid = await collection.countDocuments({
    $expr: {
      $and: [
        { $isArray: "$embedding" },
        { $eq: [{ $size: "$embedding" }, EXPECTED_DIMENSIONS] },
      ],
    },
  });
  console.log(`Chunks with valid ${EXPECTED_DIMENSIONS}-dim embedding:`, stillValid);

  const missing = await collection.countDocuments({ embedding: { $exists: false } });
  console.log("Chunks now waiting for embedding:", missing);

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});