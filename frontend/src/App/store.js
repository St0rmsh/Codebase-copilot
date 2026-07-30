import { createStore, combineReducers, applyMiddleware, compose } from "redux";
import { thunk } from "redux-thunk";
import authReducer from "../features/Auth/state/authSlice";
import githubReducer from "../features/Github/state/githubSlice";
import repoReducer from "../features/repo/state/repoSlice";
import chatReducer from "../features/chat/state/chatSlice";
import teamReducer from "../features/team/state/teamSlice";
import toastReducer from "./toastSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  github: githubReducer,
  repo: repoReducer,
  chat: chatReducer,
  toast: toastReducer,
  team: teamReducer,
});

const composeEnhancers = (typeof window !== "undefined" && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;

export const store = createStore(rootReducer, composeEnhancers(applyMiddleware(thunk)));