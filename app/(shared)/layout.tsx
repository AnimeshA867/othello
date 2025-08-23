import GameNavbar from "@/components/game-navbar";

const SharedLayout = ({ children }: { children: React.ReactNode }) => {
  return <div className="min-h-screen flex flex-col">{children}</div>;
};

export default SharedLayout;
