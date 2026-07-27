import {
  loginRequest,
  registerRequest,
  verifyOtpRequest,
  resendOtpRequest,
  getMeRequest,
  logoutRequest,
} from "../services/authService";

const initialState = {
  user: null,
  loading: false,
  error: null,
  pendingVerificationUserId: null, // set when registration or login requires OTP
};

const LOGIN_START = "auth/LOGIN_START";
const LOGIN_SUCCESS = "auth/LOGIN_SUCCESS";
const LOGIN_FAIL = "auth/LOGIN_FAIL";
const SET_USER = "auth/SET_USER";
const LOGOUT = "auth/LOGOUT";
const REQUIRES_VERIFICATION = "auth/REQUIRES_VERIFICATION";

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN_START:
      return { ...state, loading: true, error: null };
    case LOGIN_SUCCESS:
      return { ...state, loading: false, user: action.payload, pendingVerificationUserId: null };
    case LOGIN_FAIL:
      return { ...state, loading: false, error: action.payload };
    case REQUIRES_VERIFICATION:
      return { ...state, loading: false, pendingVerificationUserId: action.payload, error: null };
    case SET_USER:
      return { ...state, user: action.payload };
    case LOGOUT:
      return { ...state, user: null };
    default:
      return state;
  }
};

export const registerUser = ({ name, email, password }) => async (dispatch) => {
  dispatch({ type: LOGIN_START });
  try {
    const data = await registerRequest({ name, email, password });
    // registration never logs in directly — always requires OTP first
    dispatch({ type: REQUIRES_VERIFICATION, payload: data.user.id });
    return { success: true, requiresVerification: true, userId: data.user.id };
  } catch (err) {
    dispatch({ type: LOGIN_FAIL, payload: err.response?.data?.message || "Registration failed" });
    return { success: false };
  }
};

export const loginUser = ({ email, password }) => async (dispatch) => {
  dispatch({ type: LOGIN_START });
  try {
    const data = await loginRequest({ email, password });
    dispatch({ type: LOGIN_SUCCESS, payload: data.user });
    return { success: true };
  } catch (err) {
    const data = err.response?.data;
    if (data?.requiresVerification) {
      dispatch({ type: REQUIRES_VERIFICATION, payload: data.userId });
      return { success: false, requiresVerification: true, userId: data.userId };
    }
    dispatch({ type: LOGIN_FAIL, payload: data?.message || "Login failed" });
    return { success: false };
  }
};

export const verifyOtp = ({ userId, otp }) => async (dispatch) => {
  dispatch({ type: LOGIN_START });
  try {
    const data = await verifyOtpRequest({ userId, otp });
    dispatch({ type: LOGIN_SUCCESS, payload: data.user });
    return { success: true };
  } catch (err) {
    dispatch({ type: LOGIN_FAIL, payload: err.response?.data?.message || "Verification failed" });
    return { success: false };
  }
};

export const resendOtp = (userId) => async (dispatch) => {
  try {
    await resendOtpRequest({ userId });
    return { success: true };
  } catch (err) {
    return { success: false, message: err.response?.data?.message };
  }
};

export const fetchCurrentUser = () => async (dispatch) => {
  try {
    const data = await getMeRequest();
    dispatch({ type: SET_USER, payload: data.user });
  } catch {
    dispatch({ type: SET_USER, payload: null });
  }
};

export const logoutUser = () => async (dispatch) => {
  try {
    await logoutRequest();
  } finally {
    dispatch({ type: LOGOUT });
  }
};

export default authReducer;