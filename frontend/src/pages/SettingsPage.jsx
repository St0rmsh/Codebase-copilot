import Sidebar from "../components/Sidebar";
import UserMenu from "../components/UserMenu";
import ProfileSection from "../features/Auth/components/ProfileSection";
import PasswordSection from "../features/Auth/components/PasswordSection";
import DangerZone from "../features/Auth/components/DangerZone";
import { useSelector } from "react-redux";

const SettingsPage = () => {
  const { user } = useSelector((state) => state.auth);
  const hasPassword = !user?.githubUsername; // rough heuristic — github-only accounts skip password section entirely if desired, but safe to always show

  return (
    <div className="flex min-h-screen bg-base">
      <Sidebar />
      <main className="flex-1 px-10 py-8 max-w-2xl">
        <div className="flex justify-end mb-6">
          <UserMenu />
        </div>
        <h1 className="font-display text-3xl mb-8">SETTINGS</h1>

        <ProfileSection />
        <PasswordSection />
        <DangerZone />
      </main>
    </div>
  );
};

export default SettingsPage;