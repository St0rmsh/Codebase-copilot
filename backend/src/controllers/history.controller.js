import { listConversations, searchConversations, getConversationDetail } from "../services/history.service.js";

export const getHistory = async (req, res, next) => {
  try {
    const { q } = req.query;
    const results = q
      ? await searchConversations(req.user._id, q)
      : await listConversations(req.user._id);
    res.status(200).json({ success: true, conversations: results });
  } catch (error) {
    next(error);
  }
};

export const getConversation = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const conversation = await getConversationDetail(conversationId, req.user._id);
    res.status(200).json({ success: true, conversation });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};