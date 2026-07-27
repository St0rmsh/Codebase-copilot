import { sendChatMessage } from "../services/chatService";

const initialState = {
  messages: [], // { role: "user" | "assistant", content, citedChunks? }
  loading: false,
  error: null,
};

const SEND_START = "chat/SEND_START";
const SEND_SUCCESS = "chat/SEND_SUCCESS";
const SEND_FAIL = "chat/SEND_FAIL";
const RESET_CHAT = "chat/RESET";

const chatReducer = (state = initialState, action) => {
  switch (action.type) {
    case SEND_START:
      return {
        ...state,
        loading: true,
        error: null,
        messages: [...state.messages, { role: "user", content: action.payload }],
      };
    case SEND_SUCCESS:
      return {
        ...state,
        loading: false,
        messages: [
          ...state.messages,
          { role: "assistant", content: action.payload.answer, citedChunks: action.payload.citedChunks },
        ],
      };
    case SEND_FAIL:
      return { ...state, loading: false, error: action.payload };
    case RESET_CHAT:
      return initialState;
    default:
      return state;
  }
};

export const askQuestion = (repoId, question) => async (dispatch) => {
  dispatch({ type: SEND_START, payload: question });
  try {
    const data = await sendChatMessage(repoId, question);
    dispatch({ type: SEND_SUCCESS, payload: data });
    return { success: true };
  } catch (err) {
    dispatch({
      type: SEND_FAIL,
      payload: err.response?.data?.message || "Failed to get a response",
    });
    return { success: false };
  }
};

export const resetChat = () => ({ type: RESET_CHAT });

export default chatReducer;