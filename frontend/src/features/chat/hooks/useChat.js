import { useDispatch, useSelector } from "react-redux";
import { askQuestion, askQuestionStreaming, resetChat } from "../state/chatSlice";

export const useChat = (repoId) => {
  const dispatch = useDispatch();
  const { messages, loading, streaming, error, conversationId } = useSelector((state) => state.chat);

  const send = (question) => dispatch(askQuestion(repoId, question));
  const sendStreaming = (question) => dispatch(askQuestionStreaming(repoId, question));
  const clear = () => dispatch(resetChat());

  return { messages, loading, streaming, error, conversationId, send, sendStreaming, clear };
};