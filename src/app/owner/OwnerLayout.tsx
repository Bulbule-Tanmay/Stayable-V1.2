import { useEffect, useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router";
import StayableLogo from "../../components/StayableLogo";
import { useAuth } from "../AuthContext";
import { signOut } from "../../lib/auth";

const NAV = [
  { to: "/owner/dashboard", icon: "bar_chart", label: "Dashboard" },
  { to: "/owner/listings", icon: "home", label: "My PGs & Flats" },
  { to: "/owner/enquiries", icon: "mail", label: "Enquiries" },
  { to: "/owner/dashboard", icon: "trending_up", label: "Analytics" },
];

export default function OwnerLayout() {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (!loading && (!user || !profile || (profile.role !== "owner" && profile.role !== "admin"))) {
      navigate("/");
    }
    if (!loading && profile?.role === "admin") {
      console.warn("[OwnerLayout] Admin user accessing owner panel.");
    }
  }, [user, profile, loading, navigate]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const displayName = profile?.full_name ?? "Ramesh Kulkarni";
  const initials = displayName.split(/\s+/).map((p: string) => p[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      {/* Left sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-56 bg-white border-r border-gray-100 flex flex-col z-50 shadow-sm transition-transform md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className="p-5 pb-4 border-b border-gray-100">
          <StayableLogo className="h-7 w-auto mb-1" />
          <div className="text-xs text-gray-400 font-medium mt-1">Owner Panel</div>
        </div>

        <nav className="flex-1 py-4 px-3 flex flex-col gap-1">
          {NAV.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-50"}`
              }
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Site
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 md:ml-56 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between md:justify-end px-6 gap-4 sticky top-0 z-40 shadow-sm">
          <button className="md:hidden" onClick={() => setSidebarOpen(true)}>
            <span className="material-symbols-outlined text-[24px]">menu</span>
          </button>
          <span className="text-sm font-medium text-gray-700">{displayName}</span>
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">{initials}</div>
          <button
            onClick={async () => { await signOut().catch(() => {}); navigate("/"); }}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            Sign out
          </button>
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
