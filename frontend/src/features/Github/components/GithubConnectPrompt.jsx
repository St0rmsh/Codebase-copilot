import Button from "../../../components/Button";

const GithubConnectPrompt = () => {
  const handleConnect = () => {
    window.location.href = "/api/github/connect";
  };

  return (
    <div className="bg-panel border border-border p-6 mb-8 flex justify-between items-center">
      <div>
        <p className="font-mono text-sm text-accentSoft tracking-widest2 uppercase mb-1">
          Github Not Connected
        </p>
        <p className="font-mono text-xs text-textMuted">
          Connect your GitHub account to browse and ingest repositories.
        </p>
      </div>
      <Button variant="primary" onClick={handleConnect}>
        Connect Github
      </Button>
    </div>
  );
};

export default GithubConnectPrompt;