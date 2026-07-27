import { useDispatch, useSelector } from "react-redux";
import { askQuestion, resetChat } from "../state/chatSlice";

export const useChat = (repoId) => {
  const dispatch = useDispatch();
  const { messages, loading, error } = useSelector((state) => state.chat);

  const send = (question) => dispatch(askQuestion(repoId, question));
  const clear = () => dispatch(resetChat());

  return { messages, loading, error, send, clear };
};