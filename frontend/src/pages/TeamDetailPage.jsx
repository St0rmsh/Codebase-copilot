import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "../components/Sidebar";
import UserMenu from "../components/UserMenu";
import InviteMemberForm from "../features/team/components/InviteMemberForm";
import { useTeamDetail } from "../features/team/hooks/useTeamDetail";
import {
  removeMemberRequest,
  removeMultipleMembersRequest,
  leaveTeamRequest,
  deleteTeamRequest,
} from "../features/team/services/teamService";
import { showToast } from "../App/toastSlice";

const TeamDetailPage = () => {
  const { teamId } = useParams();
  const { team, invite, refetch } = useTeamDetail(teamId);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [confirmDeleteTeam, setConfirmDeleteTeam] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);

  if (!team) {
    return (
      <div className="flex min-h-screen bg-base">
        <Sidebar />
        <main className="flex-1 px-10 py-8">
          <p className="font-mono text-xs text-textMuted animate-pulse">Loading team...</p>
        </main>
      </div>
    );
  }

  const ownerId = team.owner?._id || team.owner;
  const isOwner = ownerId === user?.id;
  const removableMembers = team.members.filter((m) => (m.user._id || m.user) !== ownerId);

  const toggleSelect = (memberId) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedMembers.length === removableMembers.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(removableMembers.map((m) => m.user._id || m.user));
    }
  };

  const handleRemoveMember = async (memberId, memberName) => {
    try {
      await removeMemberRequest(teamId, memberId);
      dispatch(showToast(`${memberName} removed from team.`, "success"));
      refetch();
    } catch (err) {
      dispatch(showToast(err.response?.data?.message || "Failed to remove member.", "error"));
    }
  };

  const handleRemoveSelected = async () => {
    try {
      await removeMultipleMembersRequest(teamId, selectedMembers);
      dispatch(showToast(`${selectedMembers.length} member(s) removed.`, "success"));
      setSelectedMembers([]);
      refetch();
    } catch (err) {
      dispatch(showToast(err.response?.data?.message || "Failed to remove members.", "error"));
    }
  };

  const handleLeaveTeam = async () => {
    try {
      await leaveTeamRequest(teamId);
      dispatch(showToast("You left the team.", "success"));
      navigate("/teams");
    } catch (err) {
      dispatch(showToast(err.response?.data?.message || "Failed to leave team.", "error"));
    }
  };

  const handleDeleteTeam = async () => {
    if (!confirmDeleteTeam) {
      setConfirmDeleteTeam(true);
      return;
    }
    try {
      await deleteTeamRequest(teamId);
      dispatch(showToast("Team deleted.", "success"));
      navigate("/teams");
    } catch (err) {
      dispatch(showToast(err.response?.data?.message || "Failed to delete team.", "error"));
    }
  };

  return (
    <div className="flex min-h-screen bg-base">
      <Sidebar />
      <main className="flex-1 px-10 py-8 max-w-2xl">
        <div className="flex justify-end mb-6">
          <UserMenu />
        </div>

        <h1 className="font-display text-3xl mb-2">{team.name}</h1>
        <p className="font-mono text-xs text-textMuted tracking-widest2 uppercase mb-8">
          {team.members.length} member{team.members.length !== 1 ? "s" : ""}
        </p>

        <div className="bg-panel border border-border p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-mono text-sm tracking-widest2 uppercase text-accentSoft">
              Members
            </h3>
            {isOwner && removableMembers.length > 0 && (
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleSelectAll}
                  className="font-mono text-xs text-textMuted hover:text-white"
                >
                  {selectedMembers.length === removableMembers.length ? "Deselect All" : "Select All"}
                </button>
                {selectedMembers.length > 0 && (
                  <button
                    onClick={handleRemoveSelected}
                    className="font-mono text-xs text-accent hover:text-white bg-accent/10 hover:bg-accent px-3 py-1 transition"
                  >
                    Remove Selected ({selectedMembers.length})
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            {team.members.map((m) => {
              const memberId = m.user._id || m.user;
              const memberName = m.user.name || m.user.email || "Unknown";
              const isThisOwner = memberId === ownerId;

              return (
                <div
                  key={memberId}
                  className="flex justify-between items-center py-2 border-b border-border last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    {isOwner && !isThisOwner && (
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(memberId)}
                        onChange={() => toggleSelect(memberId)}
                        className="accent-accent"
                      />
                    )}
                    <span className="font-mono text-sm">{memberName}</span>
                    <span className="font-mono text-xs text-textMuted uppercase tracking-widest2">
                      {m.role}
                    </span>
                  </div>
                  {isOwner && !isThisOwner && (
                    <button
                      onClick={() => handleRemoveMember(memberId, memberName)}
                      className="font-mono text-xs text-textMuted hover:text-accent"
                    >
                      Remove
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {isOwner && (
          <div className="bg-panel border border-border p-6 mb-6">
            <h3 className="font-mono text-sm tracking-widest2 uppercase text-accentSoft mb-4">
              Invite by Email
            </h3>
            <InviteMemberForm onInvite={invite} />
          </div>
        )}

        <div className="bg-panel border border-border p-6 mb-6">
          <h3 className="font-mono text-sm tracking-widest2 uppercase text-accentSoft mb-2">
            Invite Code
          </h3>
          <p className="font-mono text-xs text-textMuted mb-3">
            Share this code so others can join directly.
          </p>
          <div className="bg-base border border-border px-4 py-3 font-mono text-sm text-accentSoft tracking-widest2">
            {team.inviteCode}
          </div>
        </div>

        <div className="border border-accent/30 p-6">
          <h3 className="font-mono text-sm tracking-widest2 uppercase text-accent mb-4">
            Danger Zone
          </h3>
          {isOwner ? (
            <button
              onClick={handleDeleteTeam}
              className={`font-mono text-xs uppercase tracking-widest2 px-4 py-2 border transition ${
                confirmDeleteTeam
                  ? "bg-accent text-white border-accent"
                  : "border-accent text-accent hover:bg-accent hover:text-white"
              }`}
            >
              {confirmDeleteTeam ? "Confirm Delete Team" : "Delete Team"}
            </button>
          ) : (
            <button
              onClick={handleLeaveTeam}
              className="font-mono text-xs uppercase tracking-widest2 px-4 py-2 border border-accent text-accent hover:bg-accent hover:text-white transition"
            >
              Leave Team
            </button>
          )}
        </div>
      </main>
    </div>
  );
};

export default TeamDetailPage;