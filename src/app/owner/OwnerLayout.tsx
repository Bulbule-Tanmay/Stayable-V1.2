import { useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router";
import StayableLogo from "../../components/StayableLogo";
import { useAuth } from "../AuthContext";
import { signOut } from "../../lib/auth";

const navItems = [
  { to: "/owner/dashboard", icon: "dashboard", label: "Dashboard" },
  { to: "/owner/listings", icon: "apartment", label: "My Listings" },
  { to: "/owner/enquiries", icon: "forum", label: "Enquiries" },
  { to: "/owner/subscription", icon: "workspace_premium", label: "Subscription" },
];

export default function OwnerLayout() {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (!loading && (!user || (profile && profile.role !== "owner" && profile.role !== "admin"))) {
      navigate("/");
    }
  }, [user, profile, loading, navigate]);

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Top bar */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white/95 backdrop-blur-xl shadow-[0_1px_8px_rgba(15,23,42,0.06)]">
        <div className="max-w-6xl mx-auto h-16 px-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <StayableLogo className="h-7 w-auto" />
            <span className="hidden sm:block text-xs font-bold px-2.5 py-1 rounded-full bg-secondary text-white">Owner Portal</span>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    isActive ? "bg-surface-mid text-secondary" : "text-on-surface-muted hover:text-on-surface hover:bg-surface-low"
                  }`
                }
              >
                <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-1.5 text-xs font-semibold text-on-surface-muted hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">home</span>
              <span className="hidden sm:block">Back to Home</span>
            </button>
            <button
              onClick={async () => { await signOut().catch(() => {}); navigate("/"); }}
              className="flex items-center gap-1 text-xs font-semibold text-on-surface-muted hover:text-red-500 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 pt-16 pb-20 md:pb-0 max-w-6xl mx-auto w-full px-4">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-xl shadow-[0_-4px_20px_rgba(15,23,42,0.06)] md:hidden">
        <div className="flex justify-around items-center h-16 px-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center min-w-[56px] h-11 gap-0.5 transition-colors ${
                  isActive ? "text-secondary" : "text-on-surface-muted"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className="material-symbols-outlined text-[22px]"
                    style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                  >
                    {item.icon}
                  </span>
                  <span className="text-[10px] font-semibold">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
