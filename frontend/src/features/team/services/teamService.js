import axiosInstance from "../../../services/axiosInstance";

export const createTeamRequest = async (name) => {
  const res = await axiosInstance.post("/teams", { name });
  return res.data;
};

export const fetchMyTeams = async () => {
  const res = await axiosInstance.get("/teams");
  return res.data;
};

export const fetchTeamDetail = async (teamId) => {
  const res = await axiosInstance.get(`/teams/${teamId}`);
  return res.data;
};

export const inviteToTeamRequest = async (teamId, email) => {
  const res = await axiosInstance.post(`/teams/${teamId}/invite`, { email });
  return res.data;
};

export const joinTeamByCodeRequest = async (inviteCode) => {
  const res = await axiosInstance.post("/teams/join", { inviteCode });
  return res.data;
};

export const shareRepoWithTeamRequest = async (repoId, teamId) => {
  const res = await axiosInstance.post(`/repos/${repoId}/share`, { teamId });
  return res.data;
};



export const removeMemberRequest = async (teamId, memberId) => {
  const res = await axiosInstance.delete(`/teams/${teamId}/members/${memberId}`);
  return res.data;
};

export const leaveTeamRequest = async (teamId) => {
  const res = await axiosInstance.post(`/teams/${teamId}/leave`);
  return res.data;
};

export const deleteTeamRequest = async (teamId) => {
  const res = await axiosInstance.delete(`/teams/${teamId}`);
  return res.data;
};