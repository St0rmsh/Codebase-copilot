import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadUserRepos, ingestAndPrepareRepo } from "../state/repoSlice";

export const useRepos = () => {
  const dispatch = useDispatch();
  const { repos, loading, ingesting, error } = useSelector((state) => state.repo);

  useEffect(() => {
    dispatch(loadUserRepos());
  }, [dispatch]);

  const ingest = (repoData) => dispatch(ingestAndPrepareRepo(repoData));
  const refetch = () => dispatch(loadUserRepos());

  return { repos, loading, ingesting, error, ingest, refetch };
};