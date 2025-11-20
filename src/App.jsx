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
import HomePage from "./components/HomePage";
import Dashboard from "./components/Dashboard";  
import PublicDashboard from "./components/PublicDashboard"; // ✅ YOU FORGOT THIS

import * as THREE from "three";
import WAVES from "vanta/dist/vanta.waves.min"; // ✅ Purple Waves


export default function App() {
  const [user, setUser] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

  const vantaRef = useRef(null);
  const vantaEffect = useRef(null);

  // ✅ Authentication listener
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user || null)
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  // ✅ Purple Waves Background
  useEffect(() => {
    if (!vantaEffect.current) {
      vantaEffect.current = WAVES({
        el: vantaRef.current,
        THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,

        // ✅ Purple Aqua Wave Theme
        color: 0x8800ff, // purple waves
        shininess: 50,
        waveHeight: 20,
        waveSpeed: 0.8,
        zoom: 1.1,

        backgroundColor: 0x000000,
        minHeight: 200,
        minWidth: 200,
      });
    }

    // ✅ Fix bottom white/black gap
    function resizeVanta() {
      if (vantaRef.current) {
        vantaRef.current.style.height = `${document.documentElement.scrollHeight}px`;
      }
    }

    resizeVanta();
    window.addEventListener("resize", resizeVanta);

    return () => {
      window.removeEventListener("resize", resizeVanta);
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
        vantaEffect.current = null;
      }
    };
  }, []);

  // ✅ Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = "/auth";
  };

  return (
    <Router>
      {/* ✅ Vanta Waves Background */}
      <div
        id="vanta-bg"
        ref={vantaRef}
        className="fixed inset-0 w-full h-full -z-10"
      ></div>

      {/* ✅ Main Application Container */}
      <div className="relative min-h-screen w-full text-white overflow-x-hidden">

        {/* ✅ Navigation Bar */}
        <nav className="sticky top-0 z-50 bg-black/60 backdrop-blur-md text-white p-4 flex justify-between items-center shadow-md">
          <Link to={user ? "/" : "/auth"} className="text-lg font-bold">
            🎓 Certi Pro
          </Link>

          <div className="hidden sm:flex items-center space-x-4">
            <Link to="/" className="hover:underline">Home</Link>
            <Link to="/dashboard" className="hover:underline">Dashboard</Link>
            <Link to="/upload" className="hover:underline">Upload</Link>
            <Link to="/gallery" className="hover:underline">Gallery</Link>
            <Link to="/skills" className="hover:underline">Skills</Link>

            {user ? (
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded-md text-sm"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/auth"
                className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded-md text-sm"
              >
                Login
              </Link>
            )}
          </div>

          {/* ✅ Mobile Menu Button */}
          <button
            onClick={() => setShowMenu((prev) => !prev)}
            className="text-white text-2xl sm:hidden"
          >
            ☰
          </button>
        </nav>

        {/* ✅ Mobile Dropdown */}
        {showMenu && (
          <div className="sm:hidden absolute top-16 right-4 bg-black/80 backdrop-blur-md rounded-lg px-4 py-4 space-y-3 z-50">
            <Link to="/" onClick={() => setShowMenu(false)} className="block">Home</Link>
            <Link to="/dashboard" onClick={() => setShowMenu(false)} className="block">Dashboard</Link>
            <Link to="/upload" onClick={() => setShowMenu(false)} className="block">Upload</Link>
            <Link to="/gallery" onClick={() => setShowMenu(false)} className="block">Gallery</Link>
            <Link to="/skills" onClick={() => setShowMenu(false)} className="block">Skills</Link>

            {user ? (
              <button
                onClick={() => { setShowMenu(false); handleLogout(); }}
                className="bg-red-500 hover:bg-red-600 w-full px-3 py-1 rounded-md text-sm"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/auth"
                onClick={() => setShowMenu(false)}
                className="bg-blue-500 hover:bg-blue-600 w-full block text-center px-3 py-1 rounded-md text-sm"
              >
                Login
              </Link>
            )}
          </div>
        )}

        {/* ✅ Main Content */}
        <div className="px-4 py-6">
          <Routes>
            {/* ✅ Protected Home */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />

            {/* ✅ Dashboard */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/public-dashboard/:userId" element={<PublicDashboard />} />

            {/* ✅ Protected Pages */}
            <Route
              path="/upload"
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

            {/* ✅ Auth Pages */}
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/login" element={<Navigate to="/auth" />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
