import { fetchUserRepos, ingestRepo, chunkRepo, embedRepo } from "../services/repoService";

const initialState = {
  repos: [],
  loading: false,
  ingesting: false,
  error: null,
};

const FETCH_REPOS_START = "repo/FETCH_START";
const FETCH_REPOS_SUCCESS = "repo/FETCH_SUCCESS";
const FETCH_REPOS_FAIL = "repo/FETCH_FAIL";
const INGEST_START = "repo/INGEST_START";
const INGEST_SUCCESS = "repo/INGEST_SUCCESS";
const INGEST_FAIL = "repo/INGEST_FAIL";

const repoReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_REPOS_START:
      return { ...state, loading: true, error: null };
    case FETCH_REPOS_SUCCESS:
      return { ...state, loading: false, repos: action.payload };
    case FETCH_REPOS_FAIL:
      return { ...state, loading: false, error: action.payload };
    case INGEST_START:
      return { ...state, ingesting: true, error: null };
    case INGEST_SUCCESS:
      return { ...state, ingesting: false, repos: [action.payload, ...state.repos] };
    case INGEST_FAIL:
      return { ...state, ingesting: false, error: action.payload };
    default:
      return state;
  }
};

export const loadUserRepos = () => async (dispatch) => {
  dispatch({ type: FETCH_REPOS_START });
  try {
    const data = await fetchUserRepos();
    dispatch({ type: FETCH_REPOS_SUCCESS, payload: data.repos });
  } catch (err) {
    dispatch({
      type: FETCH_REPOS_FAIL,
      payload: err.response?.data?.message || "Failed to load repos",
    });
  }
};

export const ingestAndPrepareRepo = (repoData) => async (dispatch) => {
  dispatch({ type: INGEST_START });
  try {
    const { repo } = await ingestRepo(repoData);
    await chunkRepo(repo._id);
    await embedRepo(repo._id);
    dispatch({ type: INGEST_SUCCESS, payload: repo });
    return { success: true, repo };
  } catch (err) {
    dispatch({
      type: INGEST_FAIL,
      payload: err.response?.data?.message || "Failed to ingest repo",
    });
    return { success: false };
  }
};

export const pollRepoStatus = (repoId) => async (dispatch) => {
  const poll = async () => {
    const data = await fetchUserRepos();
    dispatch({ type: FETCH_REPOS_SUCCESS, payload: data.repos });

    const repo = data.repos.find((r) => r._id === repoId);
    if (repo && (repo.status === "pending" || repo.status === "cloning")) {
      setTimeout(poll, 3000);
    }
  };
  poll();
};

export default repoReducer;