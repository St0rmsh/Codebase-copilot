import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadTeamDetail, inviteMember } from "../state/teamSlice";

export const useTeamDetail = (teamId) => {
  const dispatch = useDispatch();
  const { activeTeam } = useSelector((state) => state.team);

  const load = useCallback(() => {
    if (teamId) dispatch(loadTeamDetail(teamId));
  }, [teamId, dispatch]);

  useEffect(() => {
    load();
  }, [load]);

  const invite = (email) => dispatch(inviteMember(teamId, email));

  return { team: activeTeam, invite, refetch: load };
};