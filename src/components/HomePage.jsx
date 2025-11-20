import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white text-center relative overflow-hidden">
      {/* Removed black overlay so the HALO background stays visible */}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl font-extrabold mb-4 text-yellow-400 drop-shadow-lg"
        >
          🎓 Welcome to Certi Pro
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-lg text-gray-200 max-w-xl mb-8 leading-relaxed"
        >
          Your smart, secure, and visually stunning certificate management
          platform — crafted with code, care, and creativity.
        </motion.p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/gallery")}
          className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 
          text-white px-8 py-3 rounded-2xl font-semibold shadow-lg transition"
        >
          🚀 Go to Dashboard
        </motion.button>
      </div>
    </div>
  );
}
