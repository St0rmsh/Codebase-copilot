import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { exploreRepoByUrl } from "../services/exploreService";
import { showToast } from "../../../app/toastSlice";
import Button from "../../../components/Button";

const ExploreRepoForm = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await exploreRepoByUrl(url.trim());
      dispatch(showToast(`${data.repo.name} indexed for exploration.`, "success"));
      navigate(`/repo/${data.repo._id}/chat`);
    } catch (err) {
      dispatch(showToast(err.response?.data?.message || "Failed to explore repository.", "error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://github.com/owner/repo"
        className="flex-1 bg-panel border border-border px-4 py-3 font-mono text-sm placeholder:text-textMuted outline-none focus:border-accent"
        required
      />
      <Button variant="primary" type="submit" disabled={loading}>
        {loading ? "Exploring..." : "Explore"}
      </Button>
    </form>
  );
};

export default ExploreRepoForm;