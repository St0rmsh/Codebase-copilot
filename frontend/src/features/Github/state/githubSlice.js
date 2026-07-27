import { fetchGithubRepos } from "../services/githubService.js";

const initialState = {
  githubRepos: [],
  loading: false,
  error: null,
};

const FETCH_GITHUB_REPOS_START = "github/FETCH_START";
const FETCH_GITHUB_REPOS_SUCCESS = "github/FETCH_SUCCESS";
const FETCH_GITHUB_REPOS_FAIL = "github/FETCH_FAIL";

const githubReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_GITHUB_REPOS_START:
      return { ...state, loading: true, error: null };
    case FETCH_GITHUB_REPOS_SUCCESS:
      return { ...state, loading: false, githubRepos: action.payload };
    case FETCH_GITHUB_REPOS_FAIL:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export const loadGithubRepos = () => async (dispatch) => {
  dispatch({ type: FETCH_GITHUB_REPOS_START });
  try {
    const data = await fetchGithubRepos();
    dispatch({ type: FETCH_GITHUB_REPOS_SUCCESS, payload: data.repos });
  } catch (err) {
    dispatch({
      type: FETCH_GITHUB_REPOS_FAIL,
      payload: err.response?.data?.message || "Failed to load GitHub repos",
    });
  }
};

export default githubReducer;