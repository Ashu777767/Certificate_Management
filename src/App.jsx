import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { supabase } from "./utils/supabaseClient";
import CertificateUpload from "./components/CertificateUpload";
import CertificateGallery from "./components/CertificateGallery";
import SkillVisualizer from "./components/SkillVisualizer";
import AuthPage from "./components/AuthPage";
import ProtectedRoute from "./components/ProtectedRoute";
import ResetPassword from "./components/ResetPassword";

import * as THREE from "three";
import HALO from "vanta/dist/vanta.halo.min"; // 👈 Import the HALO effect

export default function App() {
  const [user, setUser] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const vantaRef = useRef(null);
  const vantaEffect = useRef(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!vantaEffect.current) {
      vantaEffect.current = HALO({
        el: vantaRef.current,
        THREE, // required for module version
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        baseColor: 0x111111,
        backgroundColor: 0x000000,
        amplitudeFactor: 1.2,
        size: 1.1,
      });
    }

    return () => {
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
        vantaEffect.current = null;
      }
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = "/auth";
  };

  return (
    <Router>
      <div
        ref={vantaRef}
        className="min-h-screen text-white relative h-auto w-full overflow-x-hidden"
      >
        {/* 🔝 Navigation Bar */}
        <nav className="sticky top-0 z-50 bg-black/60 text-white p-4 flex justify-between items-center shadow-md backdrop-blur-md">
          <Link to={user ? "/" : "/auth"} className="text-lg font-bold">
            🎓 Certi Pro
          </Link>

          {/* Desktop Nav */}
          <div className="hidden sm:flex items-center space-x-4">
            <Link to="/" className="hover:underline">
              Upload
            </Link>
            <Link to="/gallery" className="hover:underline">
              Gallery
            </Link>
            <Link to="/skills" className="hover:underline">
              Skills
            </Link>
            {user ? (
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/auth"
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm"
              >
                Login
              </Link>
            )}
          </div>

          {/* Hamburger Menu */}
          <div className="sm:hidden">
            <button
              onClick={() => setShowMenu((prev) => !prev)}
              className="text-white text-2xl focus:outline-none"
            >
              ☰
            </button>
          </div>
        </nav>

        {/* Mobile Menu Dropdown */}
        {showMenu && (
          <div className="sm:hidden absolute top-16 right-4 bg-black/80 rounded-lg shadow-md px-4 py-4 space-y-3 z-50">
            <Link
              to="/"
              onClick={() => setShowMenu(false)}
              className="block hover:underline"
            >
              Upload
            </Link>
            <Link
              to="/gallery"
              onClick={() => setShowMenu(false)}
              className="block hover:underline"
            >
              Gallery
            </Link>
            <Link
              to="/skills"
              onClick={() => setShowMenu(false)}
              className="block hover:underline"
            >
              Skills
            </Link>
            {user ? (
              <button
                onClick={() => {
                  setShowMenu(false);
                  handleLogout();
                }}
                className="bg-red-500 hover:bg-red-600 w-full text-white px-3 py-1 rounded-md text-sm"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/auth"
                onClick={() => setShowMenu(false)}
                className="bg-blue-500 hover:bg-blue-600 block text-center text-white px-3 py-1 rounded-md text-sm"
              >
                Login
              </Link>
            )}
          </div>
        )}

        {/* 📄 Page Content */}
        <div className="px-4 py-6">
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <CertificateUpload />
                </ProtectedRoute>
              }
            />
            <Route
              path="/gallery"
              element={
                <ProtectedRoute>
                  <CertificateGallery />
                </ProtectedRoute>
              }
            />
            <Route
              path="/skills"
              element={
                <ProtectedRoute>
                  <SkillVisualizer />
                </ProtectedRoute>
              }
            />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/login" element={<Navigate to="/auth" />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
