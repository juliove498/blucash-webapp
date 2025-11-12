import { Outlet } from "react-router-dom";

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-primary flex justify-center">
      <div className="w-full max-w-[580px]">
        <Outlet />
      </div>
    </div>
  );
};
