import {
  createTeamRequest,
  fetchMyTeams,
  fetchTeamDetail,
  inviteToTeamRequest,
  joinTeamByCodeRequest,
} from "../services/teamService";

const initialState = {
  teams: [],
  activeTeam: null,
  loading: false,
  error: null,
};

const FETCH_TEAMS_START = "team/FETCH_START";
const FETCH_TEAMS_SUCCESS = "team/FETCH_SUCCESS";
const FETCH_TEAMS_FAIL = "team/FETCH_FAIL";
const SET_ACTIVE_TEAM = "team/SET_ACTIVE";
const CREATE_TEAM_SUCCESS = "team/CREATE_SUCCESS";

const teamReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_TEAMS_START:
      return { ...state, loading: true, error: null };
    case FETCH_TEAMS_SUCCESS:
      return { ...state, loading: false, teams: action.payload };
    case FETCH_TEAMS_FAIL:
      return { ...state, loading: false, error: action.payload };
    case SET_ACTIVE_TEAM:
      return { ...state, activeTeam: action.payload };
    case CREATE_TEAM_SUCCESS:
      return { ...state, teams: [action.payload, ...state.teams] };
    default:
      return state;
  }
};

export const loadMyTeams = () => async (dispatch) => {
  dispatch({ type: FETCH_TEAMS_START });
  try {
    const data = await fetchMyTeams();
    dispatch({ type: FETCH_TEAMS_SUCCESS, payload: data.teams });
  } catch (err) {
    dispatch({ type: FETCH_TEAMS_FAIL, payload: err.response?.data?.message || "Failed to load teams" });
  }
};

export const createTeam = (name) => async (dispatch) => {
  try {
    const data = await createTeamRequest(name);
    dispatch({ type: CREATE_TEAM_SUCCESS, payload: data.team });
    return { success: true, team: data.team };
  } catch (err) {
    return { success: false, message: err.response?.data?.message || "Failed to create team" };
  }
};

export const loadTeamDetail = (teamId) => async (dispatch) => {
  try {
    const data = await fetchTeamDetail(teamId);
    dispatch({ type: SET_ACTIVE_TEAM, payload: data.team });
    return { success: true };
  } catch (err) {
    return { success: false, message: err.response?.data?.message };
  }
};

export const inviteMember = (teamId, email) => async () => {
  try {
    await inviteToTeamRequest(teamId, email);
    return { success: true };
  } catch (err) {
    return { success: false, message: err.response?.data?.message || "Failed to send invite" };
  }
};

export const joinTeamByCode = (inviteCode) => async (dispatch) => {
  try {
    const data = await joinTeamByCodeRequest(inviteCode);
    dispatch(loadMyTeams());
    return { success: true, team: data.team };
  } catch (err) {
    return { success: false, message: err.response?.data?.message || "Failed to join team" };
  }
};

export default teamReducer;