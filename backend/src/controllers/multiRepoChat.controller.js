import { askMultiRepoQuestionStream } from "../services/chat.service.js";

export const multiRepoChatStream = async (req, res) => {
  const { repoIds, question } = req.body;

  if (!repoIds || !Array.isArray(repoIds) || repoIds.length < 2) {
    res.status(400).json({ success: false, message: "At least 2 repoIds are required" });
    return;
  }
  if (!question) {
    res.status(400).json({ success: false, message: "Question is required" });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const send = (payload) => {
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };

  try {
    const { tokenStream, citedChunks, persistMessages } = await askMultiRepoQuestionStream(
      req.user._id,
      repoIds,
      question
    );

    send({ type: "citations", citedChunks });

    let fullAnswer = "";
    for await (const token of tokenStream) {
      fullAnswer += token;
      send({ type: "token", content: token });
    }

    await persistMessages(fullAnswer);

    send({ type: "done" });
    res.end();
  } catch (error) {
    send({ type: "error", message: error.message || "Something went wrong" });
    res.end();
  }
};