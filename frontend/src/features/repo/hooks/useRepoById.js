import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadUserRepos } from "../state/repoSlice";

export const useRepoById = (repoId) => {
  const dispatch = useDispatch();
  const { repos, loading } = useSelector((state) => state.repo);
  const repo = repos.find((r) => r._id === repoId);

  useEffect(() => {
    if (!repo && !loading) dispatch(loadUserRepos());
  }, [repo, loading, dispatch]);

  return { repo, loading };
};