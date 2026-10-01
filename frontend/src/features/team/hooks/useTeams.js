import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  loadMyTeams,
  createTeam,
  verifyCreateTeam,
  joinTeamByCode,
  verifyJoinTeam,
} from "../state/teamSlice";

export const useTeams = () => {
  const dispatch = useDispatch();
  const { teams, loading, error } = useSelector((state) => state.team);

  useEffect(() => {
    dispatch(loadMyTeams());
  }, [dispatch]);

  const create = (name) => dispatch(createTeam(name));
  const verifyCreate = (name, otp) => dispatch(verifyCreateTeam(name, otp));
  const joinByCode = (code) => dispatch(joinTeamByCode(code));
  const verifyJoin = (code, otp) => dispatch(verifyJoinTeam(code, otp));
  const refetch = () => dispatch(loadMyTeams());

  return { teams, loading, error, create, verifyCreate, joinByCode, verifyJoin, refetch };
};