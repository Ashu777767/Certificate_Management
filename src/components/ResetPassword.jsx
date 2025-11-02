import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("idle");
  const navigate = useNavigate();

  // Check for access token from URL and confirm session
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      supabase.auth.setSession({
        access_token: new URLSearchParams(hash.substring(1)).get("access_token"),
        refresh_token: new URLSearchParams(hash.substring(1)).get("refresh_token"),
      });
    }
  }, []);

  const handleReset = async () => {
    setStatus("loading");
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      console.error("Password update error:", error);
      setStatus("error");
    } else {
      setStatus("success");
      setTimeout(() => navigate("/"), 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      <div className="w-full max-w-md p-6 border border-white/20 rounded-xl backdrop-blur-md bg-black/50">
        <h2 className="text-2xl font-bold mb-4 text-center text-pink-400">🔐 Set New Password</h2>

        <input
          type="password"
          placeholder="Enter new password"
          className="w-full p-2 mb-4 rounded bg-white/10 border border-white/30 focus:outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleReset}
          disabled={status === "loading"}
          className="w-full bg-pink-500 hover:bg-pink-600 text-white py-2 rounded font-medium"
        >
          {status === "loading" ? "Updating..." : "Update Password"}
        </button>

        {status === "success" && (
          <p className="text-green-400 mt-4 text-center">✅ Password updated! Redirecting...</p>
        )}
        {status === "error" && (
          <p className="text-red-400 mt-4 text-center">❌ Failed to update password.</p>
        )}
      </div>
    </div>
  );
}
