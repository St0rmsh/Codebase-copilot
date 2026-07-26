import { askQuestion } from "../services/chat.service.js";

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