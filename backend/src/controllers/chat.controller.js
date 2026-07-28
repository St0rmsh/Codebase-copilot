import { askQuestion, askQuestionStream } from "../services/chat.service.js";

export const chat = async (req, res, next) => {
  try {
    const { repoId } = req.params;
    const { question } = req.body;

    if (!question) {
      res.status(400);
      throw new Error("Question is required");
    }

    const result = await askQuestion(req.user._id, repoId, question);

    res.status(200).json({ success: true, ...result });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

export const chatStream = async (req, res) => {
  const { repoId } = req.params;
  const { question } = req.body;

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
    const { tokenStream, citedChunks, persistMessages } = await askQuestionStream(
      req.user._id,
      repoId,
      question
    );

    // send citations immediately — frontend can render chips before text finishes
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