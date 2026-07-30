import { useState } from "react";
import { useDispatch } from "react-redux";
import { fetchConversationExport } from "../services/historyService";
import { showToast } from "../../../App/toastSlice";

const ExportChatButton = ({ conversationId, repoName }) => {
  const [exporting, setExporting] = useState(false);
  const dispatch = useDispatch();

  const handleExport = async () => {
    if (!conversationId) {
      dispatch(showToast("No conversation to export yet.", "error"));
      return;
    }
    setExporting(true);
    try {
      const data = await fetchConversationExport(conversationId);
      const blob = new Blob([data.markdown], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${repoName || "chat"}-export.md`;
      a.click();
      URL.revokeObjectURL(url);
      dispatch(showToast("Chat exported.", "success", 2000));
    } catch {
      dispatch(showToast("Export failed.", "error"));
    } finally {
      setExporting(false);
    }
  };

  return (
    <button onClick={handleExport} disabled={exporting} className="hover:text-white disabled:opacity-50">
      {exporting ? "Exporting..." : "⬇ Export"}
    </button>
  );
};

export default ExportChatButton;