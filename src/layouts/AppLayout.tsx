import { Outlet } from "react-router-dom";
import BottomNavigation from "@/components/BottomNavigation";

export const AppLayout = () => {
  return (
    <div className="min-h-screen bg-[#F6F7FB] pb-safe flex justify-center">
      <div className="w-full max-w-[580px] relative">
        <main className="relative">
          <Outlet />
        </main>
        <BottomNavigation />
      </div>
    </div>
  );
};
