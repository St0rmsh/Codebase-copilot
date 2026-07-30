const TeamCard = ({ team, onClick }) => (
  <button
    onClick={onClick}
    className="w-full text-left bg-panel border border-border p-5 hover:border-accent/50 transition"
  >
    <h3 className="font-display text-lg uppercase mb-2">{team.name}</h3>
    <p className="font-mono text-xs text-textMuted">
      {team.members.length} member{team.members.length !== 1 ? "s" : ""}
    </p>
  </button>
);

export default TeamCard;