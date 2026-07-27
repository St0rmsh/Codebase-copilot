import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../features/Auth/state/authSlice";

const UserMenu = () => {
  const [open, setOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/login");
  };

  const initial = user?.name?.[0]?.toUpperCase() || "U";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-8 h-8 bg-border flex items-center justify-center font-mono text-xs text-white hover:bg-accent/30 transition"
      >
        {initial}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-48 bg-panel border border-border z-20">
            <div className="px-4 py-3 border-b border-border">
              <p className="font-mono text-xs text-white truncate">{user?.name}</p>
              <p className="font-mono text-xs text-textMuted truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 font-mono text-xs text-accent hover:bg-base tracking-widest2 uppercase"
            >
              Logout
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default UserMenu;