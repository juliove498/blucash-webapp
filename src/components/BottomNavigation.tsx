import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";

export const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white pb-safe z-30 flex justify-center">
      <div className="w-full max-w-[580px] h-20 flex items-center justify-between relative px-12">
        {/* Home Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate("/app")}
          className="flex items-center justify-center w-16 h-16 rounded-[20px] bg-[#D8E0F5]"
        >
          <svg
            className="w-7 h-7 text-[#354eab]"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
        </motion.button>

        {/* Floating Action Button - Enviar */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-8">
          <div className="relative">
            {/* White background circle */}
            <div className="absolute inset-0 bg-white rounded-full scale-[1.15] shadow-[0_4px_20px_rgba(0,0,0,0.08)]" />
            {/* Blue button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/app/send")}
              className="relative w-20 h-20 rounded-full bg-[#354eab] shadow-[0_8px_24px_rgba(53,78,171,0.35)] flex items-center justify-center"
            >
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              </svg>
            </motion.button>
          </div>
        </div>

        {/* Profile/User Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate("/app/profile")}
          className="flex items-center justify-center w-16 h-16"
        >
          <svg
            className="w-9 h-9 text-[#B8BFCE]"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </motion.button>
      </div>
    </div>
  );
};

export default BottomNavigation;
