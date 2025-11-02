import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "../utils/supabaseClient";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AuthPage() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        navigate("/");
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <div className="fixed inset-0 overflow-hidden flex items-center justify-center z-10">
      {user ? (
        <div className="text-center space-y-4 text-white">
          <h2 className="text-2xl font-bold">You're already logged in</h2>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
          >
            🔒 Logout
          </button>
        </div>
      ) : (
        <div className="max-w-md w-full p-6 bg-white text-black rounded-xl shadow-lg">
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            providers={[]}
            onlyThirdPartyProviders={false}
          />
        </div>
      )}
    </div>
  );
}
