let idCounter = 0;

const initialState = {
  toasts: [],
};

const SHOW_TOAST = "toast/SHOW";
const DISMISS_TOAST = "toast/DISMISS";

const toastReducer = (state = initialState, action) => {
  switch (action.type) {
    case SHOW_TOAST:
      return { ...state, toasts: [...state.toasts, action.payload] };
    case DISMISS_TOAST:
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.payload) };
    default:
      return state;
  }
};

export const showToast = (message, type = "error", duration = 5000) => (dispatch) => {
  const id = ++idCounter;
  dispatch({ type: SHOW_TOAST, payload: { id, message, type } });
  setTimeout(() => dispatch({ type: DISMISS_TOAST, payload: id }), duration);
};

export const dismissToast = (id) => ({ type: DISMISS_TOAST, payload: id });

export default toastReducer;