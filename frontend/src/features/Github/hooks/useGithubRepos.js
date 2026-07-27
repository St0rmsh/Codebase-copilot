import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadGithubRepos } from "../state/githubSlice";

export const useGithubRepos = (autoFetch = false) => {
  const dispatch = useDispatch();
  const { githubRepos, loading, error } = useSelector((state) => state.github);

  useEffect(() => {
    if (autoFetch) dispatch(loadGithubRepos());
  }, [autoFetch, dispatch]);

  const refetch = () => dispatch(loadGithubRepos());

  return { githubRepos, loading, error, refetch };
};