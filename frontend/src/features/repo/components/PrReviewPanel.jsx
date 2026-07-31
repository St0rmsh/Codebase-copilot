import { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { fetchOpenPullRequests, requestPrReview } from "../services/repoService";
import { showToast } from "../../../app/toastSlice";
import MarkdownRenderer from "../../../components/MarkdownRenderer";

const PrReviewPanel = ({ repoId }) => {
  const [pullRequests, setPullRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(null);
  const [reviewResult, setReviewResult] = useState(null);
  const dispatch = useDispatch();

  const loadPrs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchOpenPullRequests(repoId);
      setPullRequests(data.pullRequests);
    } catch {
      dispatch(showToast("Failed to load pull requests.", "error"));
    } finally {
      setLoading(false);
    }
  }, [repoId, dispatch]);

  useEffect(() => {
    loadPrs();
  }, [loadPrs]);

  const handleReview = async (prNumber) => {
    setReviewing(prNumber);
    setReviewResult(null);
    try {
      const data = await requestPrReview(repoId, prNumber);
      setReviewResult(data);
    } catch (err) {
      dispatch(showToast(err.response?.data?.message || "Failed to generate review.", "error"));
    } finally {
      setReviewing(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex justify-between items-center px-6 py-3 border-b border-border">
        <p className="font-mono text-xs text-textMuted tracking-widest2 uppercase">
          {pullRequests.length} open pull request{pullRequests.length !== 1 ? "s" : ""}
        </p>
        <button
          onClick={loadPrs}
          className="font-mono text-xs text-textMuted hover:text-white"
        >
          Refresh
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <p className="font-mono text-xs text-textMuted animate-pulse">Loading pull requests...</p>
        ) : pullRequests.length === 0 ? (
          <p className="font-mono text-xs text-textMuted">
            No open pull requests found for this repository.
          </p>
        ) : (
          <div className="space-y-3 mb-6">
            {pullRequests.map((pr) => (
              <div key={pr.number} className="bg-panel border border-border p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-mono text-sm text-white">
                      #{pr.number} — {pr.title}
                    </p>
                    <p className="font-mono text-xs text-textMuted mt-1">by {pr.author}</p>
                  </div>
                  <button
                    onClick={() => handleReview(pr.number)}
                    disabled={reviewing !== null}
                    className="bg-accent hover:bg-accent/90 disabled:opacity-50 text-white font-mono text-xs tracking-widest2 uppercase px-4 py-2 shrink-0 ml-4"
                  >
                    {reviewing === pr.number ? "Reviewing..." : "Review"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {reviewResult && (
          <div className="bg-panel border border-accent/40 p-6">
            <div className="flex items-center gap-2 mb-4 font-mono text-xs text-accent tracking-widest2 uppercase">
              <span>⚡</span> Review — {reviewResult.prTitle}
            </div>
            <p className="font-mono text-xs text-textMuted mb-4">
              {reviewResult.filesChanged} file{reviewResult.filesChanged !== 1 ? "s" : ""} changed by{" "}
              {reviewResult.prAuthor}
            </p>
            <MarkdownRenderer content={reviewResult.review} />
          </div>
        )}
      </div>
    </div>
  );
};

export default PrReviewPanel;