import { sendChatMessage, streamChatMessage } from "../services/chatService";

const initialState = {
  messages: [],
  loading: false,
  streaming: false,
  error: null,
  conversationId: null,
};

const SEND_START = "chat/SEND_START";
const SEND_SUCCESS = "chat/SEND_SUCCESS";
const SEND_FAIL = "chat/SEND_FAIL";
const RESET_CHAT = "chat/RESET";

const STREAM_START = "chat/STREAM_START";
const STREAM_CONVERSATION_ID = "chat/STREAM_CONVERSATION_ID";
const STREAM_CITATIONS = "chat/STREAM_CITATIONS";
const STREAM_TOKEN = "chat/STREAM_TOKEN";
const STREAM_DONE = "chat/STREAM_DONE";
const STREAM_ERROR = "chat/STREAM_ERROR";

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

    case STREAM_START:
      return {
        ...state,
        streaming: true,
        error: null,
        messages: [
          ...state.messages,
          { role: "user", content: action.payload },
          { role: "assistant", content: "", citedChunks: [] },
        ],
      };
    case STREAM_CONVERSATION_ID:
      return { ...state, conversationId: action.payload };
    case STREAM_CITATIONS: {
      const messages = [...state.messages];
      messages[messages.length - 1] = {
        ...messages[messages.length - 1],
        citedChunks: action.payload,
      };
      return { ...state, messages };
    }
    case STREAM_TOKEN: {
      const messages = [...state.messages];
      const last = messages[messages.length - 1];
      messages[messages.length - 1] = { ...last, content: last.content + action.payload };
      return { ...state, messages };
    }
    case STREAM_DONE:
      return { ...state, streaming: false };
    case STREAM_ERROR:
      return { ...state, streaming: false, error: action.payload };

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

export const askQuestionStreaming = (repoId, question) => async (dispatch) => {
  dispatch({ type: STREAM_START, payload: question });

  await streamChatMessage(repoId, question, {
    onConversationId: (conversationId) => dispatch({ type: STREAM_CONVERSATION_ID, payload: conversationId }),
    onCitations: (citedChunks) => dispatch({ type: STREAM_CITATIONS, payload: citedChunks }),
    onToken: (content) => dispatch({ type: STREAM_TOKEN, payload: content }),
    onDone: () => dispatch({ type: STREAM_DONE }),
    onError: (message) => dispatch({ type: STREAM_ERROR, payload: message }),
  });
};

export const resetChat = () => ({ type: RESET_CHAT });

export default chatReducer;