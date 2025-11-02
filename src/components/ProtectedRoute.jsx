import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-center mt-10">Checking auth...</div>;

  return user ? children : <Navigate to="/auth" />;
}
