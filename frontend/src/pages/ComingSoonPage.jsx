import Sidebar from "../components/Sidebar";
import UserMenu from "../components/UserMenu";

const ComingSoonPage = ({ title }) => {
  return (
    <div className="flex min-h-screen bg-base">
      <Sidebar />
      <main className="flex-1 px-10 py-8">
        <div className="flex justify-end mb-10">
          <UserMenu />
        </div>
        <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
          <span className="text-accent text-2xl">⚙</span>
          <h1 className="font-display text-2xl uppercase text-center">{title}</h1>
          <p className="font-mono text-xs text-textMuted tracking-widest2 uppercase">
            Module Under Construction
          </p>
        </div>
      </main>
    </div>
  );
};

export default ComingSoonPage;