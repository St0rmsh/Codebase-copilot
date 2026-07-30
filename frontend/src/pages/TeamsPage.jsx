import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import UserMenu from "../components/UserMenu";
import TeamCard from "../features/team/components/TeamCard";
import CreateTeamModal from "../features/team/components/CreateTeamModal";
import JoinTeamModal from "../features/team/components/JoinTeamModal";
import { useTeams } from "../features/team/hooks/useTeams";
import Button from "../components/Button";

const TeamsPage = () => {
  const { teams, loading, refetch } = useTeams();
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const navigate = useNavigate();

  const handleCloseCreate = () => {
    setCreateOpen(false);
    refetch();
  };

  const handleCloseJoin = () => {
    setJoinOpen(false);
    refetch();
  };

  return (
    <div className="flex min-h-screen bg-base">
      <Sidebar />
      <main className="flex-1 px-10 py-8 w-full">
        <div className="flex justify-end mb-6">
          <UserMenu />
        </div>

        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="font-display text-3xl mb-2">TEAM WORKSPACES</h1>
            <p className="font-mono text-xs text-textMuted tracking-widest2 uppercase">
              Collaborate on shared repositories
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setJoinOpen(true)}>
              Join Team
            </Button>
            <Button variant="primary" onClick={() => setCreateOpen(true)}>
              + Create Team
            </Button>
          </div>
        </div>

        {loading ? (
          <p className="font-mono text-xs text-textMuted animate-pulse">Loading teams...</p>
        ) : teams.length === 0 ? (
          <p className="font-mono text-xs text-textMuted">
            No teams yet. Create one or join with an invite code.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {teams.map((team) => (
              <TeamCard key={team._id} team={team} onClick={() => navigate(`/teams/${team._id}`)} />
            ))}
          </div>
        )}
      </main>

      {createOpen && <CreateTeamModal onClose={handleCloseCreate} />}
      {joinOpen && <JoinTeamModal onClose={handleCloseJoin} />}
    </div>
  );
};

export default TeamsPage;