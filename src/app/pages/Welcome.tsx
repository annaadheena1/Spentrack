import { Link } from "react-router";
import { Logo } from "../components/Logo";
import { motion } from "motion/react";
import { TrendingDown, Shield, Bell, Sparkles } from "lucide-react";
import { useEffect } from "react";

export function Welcome() {
  useEffect(() => {
    // Clear any stale auth data on welcome page
    localStorage.removeItem("userPhone");
    localStorage.removeItem("userCurrency");
    localStorage.removeItem("userName");
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-teal-500 to-green-600 flex flex-col items-center justify-between p-8 text-white">
      {/* Top Section - Logo and Branding */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center mt-12"
      >
        <Logo className="w-24 h-24 mb-6" />
        <h1 className="text-4xl font-bold mb-3 text-center">SpenTrack</h1>
        <p className="text-xl text-center text-white/90 font-medium px-4">
          money runs? we'll catch it for you
        </p>
      </motion.div>

      {/* Middle Section - Features */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="grid grid-cols-2 gap-4 w-full max-w-sm"
      >
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
          <TrendingDown className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm font-medium">Track Spending</p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
          <Bell className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm font-medium">Smart Alerts</p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
          <Shield className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm font-medium">Stay in Control</p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
          <Sparkles className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm font-medium">Build Habits</p>
        </div>
      </motion.div>

      {/* Bottom Section - CTA Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="w-full max-w-sm space-y-4 mb-8"
      >
        <Link to="/signup">
          <button className="w-full bg-white text-emerald-600 font-bold py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-105 active:scale-95">
            Sign Up
          </button>
        </Link>
        <Link to="/login">
          <button className="w-full bg-white/20 backdrop-blur-sm text-white font-bold py-4 rounded-2xl border-2 border-white/30 hover:bg-white/30 transition-all hover:scale-105 active:scale-95">
            Log In
          </button>
        </Link>
      </motion.div>
    </div>
  );
}