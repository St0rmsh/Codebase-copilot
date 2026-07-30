import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadMyTeams, createTeam, joinTeamByCode } from "../state/teamSlice";

export const useTeams = () => {
  const dispatch = useDispatch();
  const { teams, loading, error } = useSelector((state) => state.team);

  useEffect(() => {
    dispatch(loadMyTeams());
  }, [dispatch]);

  const create = (name) => dispatch(createTeam(name));
  const joinByCode = (code) => dispatch(joinTeamByCode(code));
  const refetch = () => dispatch(loadMyTeams());

  return { teams, loading, error, create, joinByCode, refetch };
};