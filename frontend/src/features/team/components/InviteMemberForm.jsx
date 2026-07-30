import { useState } from "react";
import { useDispatch } from "react-redux";
import { showToast } from "../../../app/toastSlice";

const InviteMemberForm = ({ onInvite }) => {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    const result = await onInvite(email);
    setSending(false);
    if (result.success) {
      dispatch(showToast(`Invite sent to ${email}.`, "success"));
      setEmail("");
    } else {
      dispatch(showToast(result.message || "Failed to send invite.", "error"));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="teammate@email.com"
        className="flex-1 bg-transparent border border-border px-3 py-2 font-mono text-xs placeholder:text-textMuted outline-none focus:border-accent"
        required
      />
      <button
        type="submit"
        disabled={sending}
        className="bg-accent hover:bg-accent/90 disabled:opacity-50 text-white font-mono text-xs tracking-widest2 uppercase px-4"
      >
        {sending ? "Sending..." : "Invite"}
      </button>
    </form>
  );
};

export default InviteMemberForm;