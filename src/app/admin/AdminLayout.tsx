import { useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router";
import StayableLogo from "../../components/StayableLogo";
import { useAuth } from "../AuthContext";
import { signOut } from "../../lib/auth";

const navItems = [
  { to: "/admin/dashboard", icon: "dashboard", label: "Dashboard" },
  { to: "/admin/owners", icon: "people", label: "Owners" },
  { to: "/admin/listings", icon: "apartment", label: "Listings" },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, loading } = useAuth();

  const isLogin = location.pathname === "/admin" || location.pathname === "/admin/";

  useEffect(() => {
    if (!loading && !isLogin && user && profile && profile.role !== "admin") {
      navigate("/admin");
    }
  }, [user, profile, loading, isLogin, navigate]);

  return (
    <div className="min-h-screen bg-[#0f1117] flex flex-col">
      {!isLogin && (
        <header className="fixed top-0 inset-x-0 z-50 bg-[#1a1d27]/95 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-7xl mx-auto h-16 px-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <StayableLogo className="h-7 w-auto brightness-0 invert" />
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/20">Super Admin</span>
            </div>
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                      isActive ? "bg-white/10 text-white" : "text-white/50 hover:text-white hover:bg-white/5"
                    }`
                  }
                >
                  <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="flex items-center gap-2">
              <button onClick={() => navigate("/")} className="flex items-center gap-1.5 text-xs font-semibold text-white/50 hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[18px]">home</span>
                <span className="hidden sm:block">Home</span>
              </button>
              <button onClick={async () => { await signOut().catch(() => {}); navigate("/admin"); }} className="flex items-center gap-1 text-xs font-semibold text-white/40 hover:text-red-400 transition-colors">
                <span className="material-symbols-outlined text-[16px]">logout</span>
              </button>
            </div>
          </div>
        </header>
      )}

      <main className={`flex-1 ${!isLogin ? "pt-16 pb-20 md:pb-0" : ""} max-w-7xl mx-auto w-full px-4`}>
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      {!isLogin && (
        <nav className="fixed bottom-0 inset-x-0 z-50 bg-[#1a1d27]/95 backdrop-blur-xl border-t border-white/5 md:hidden">
          <div className="flex justify-around items-center h-16 px-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center min-w-[56px] h-11 gap-0.5 transition-colors ${
                    isActive ? "text-white" : "text-white/40"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className="material-symbols-outlined text-[22px]" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>{item.icon}</span>
                    <span className="text-[10px] font-semibold">{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}
