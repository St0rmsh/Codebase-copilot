import { getGithubConnectUrl } from "../services/githubService";
import Button from "../../../components/Button";

const ConnectRepoButton = () => {
  const handleConnect = () => {
    window.location.href = getGithubConnectUrl();
  };

  return (
    <Button variant="primary" onClick={handleConnect} className="flex items-center gap-2">
      + Connect Repository
    </Button>
  );
};

export default ConnectRepoButton;