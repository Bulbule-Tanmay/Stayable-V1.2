import { useState } from "react";
import { useNavigate } from "react-router";
import StayableLogo from "../components/StayableLogo";
import { useAuth } from "./AuthContext";
import { signOut } from "../lib/auth";
import AuthModal from "./AuthModal";

const COLLEGES = [
  { abbr: "MI", name: "MIT World Peace University", location: "Kothrud, Pune", pgs: 47 },
  { abbr: "Sy", name: "Symbiosis International University", location: "Lavale, Pune", pgs: 38 },
  { abbr: "CO", name: "COEP Technological University", location: "Shivajinagar, Pune", pgs: 63 },
  { abbr: "Fe", name: "Fergusson College", location: "Shivajinagar, Pune", pgs: 55 },
  { abbr: "SP", name: "Savitribai Phule Pune University", location: "Ganeshkhind, Pune", pgs: 72 },
  { abbr: "PI", name: "Pune Institute of Computer Technology", location: "Dhankawadi, Pune", pgs: 41 },
];

const STEPS = [
  { num: 1, icon: "school", title: "Select College", desc: "Choose your college from our list" },
  { num: 2, icon: "map", title: "View Map", desc: "See all nearby PGs on an interactive map" },
  { num: 3, icon: "manage_search", title: "Compare", desc: "Filter by price, distance and facilities" },
  { num: 4, icon: "call", title: "Contact Owner", desc: "Call, WhatsApp or send enquiry directly" },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  const handleSignOut = async () => {
    await signOut().catch(() => {});
    window.location.reload();
  };

  return (
    <>
    <div className="min-h-screen bg-white font-body text-on-surface">
      {/* ── NAV ── */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <StayableLogo className="h-8 w-auto" />
          <nav className="flex items-center gap-6">
            <button onClick={() => navigate("/app")} className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">
              Find PG
            </button>
            <button onClick={() => navigate("/app")} className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">
              Flats
            </button>
            <button onClick={() => navigate("/app")} className="relative text-sm font-medium text-gray-700 hover:text-primary transition-colors">
              Saved
            </button>
            <button onClick={() => navigate("/owner")} className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">Owner Login</button>
            <button
              onClick={user ? handleSignOut : () => setShowAuth(true)}
              className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold"
            >
              {user ? (profile?.full_name?.[0] ?? "S").toUpperCase() : "S"}
            </button>
          </nav>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative pt-16 overflow-hidden" style={{ background: "linear-gradient(135deg, #2D1B8B 0%, #3B1FA8 30%, #5B21B6 60%, #6D28D9 100%)" }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[
            { top: "8%", left: "4%", width: "80px", height: "55px" },
            { top: "5%", left: "18%", width: "65px", height: "45px" },
            { top: "12%", right: "20%", width: "75px", height: "52px" },
            { top: "6%", right: "6%", width: "85px", height: "58px" },
            { bottom: "20%", left: "6%", width: "90px", height: "62px" },
            { bottom: "18%", right: "4%", width: "78px", height: "54px" },
          ].map((s, i) => (
            <div key={i} className="absolute rounded-lg border border-white/20 bg-white/10" style={s} />
          ))}
        </div>

        <div className="relative max-w-3xl mx-auto px-6 pt-16 pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-white text-sm font-medium mb-8">
            <span className="material-symbols-outlined text-[16px]">location_on</span>
            College-based PG discovery
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold text-white leading-tight mb-5">
            Find Your Perfect PG<br />Near Your College
          </h1>
          <p className="text-white/80 text-base max-w-xl mx-auto mb-8">
            Explore verified PGs around your college, compare prices, check facilities and contact owners directly.
          </p>
          <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2 shadow-xl max-w-lg mx-auto mb-6">
            <span className="material-symbols-outlined text-gray-400 text-[20px]">search</span>
            <input
              type="text"
              placeholder="Search your college or area..."
              className="flex-1 text-sm text-gray-700 outline-none bg-transparent placeholder-gray-400"
              onFocus={() => navigate("/app")}
            />
            <button onClick={() => navigate("/app")} className="px-5 py-2 bg-primary text-white text-sm font-bold rounded-lg">
              Find PG
            </button>
          </div>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button onClick={() => navigate("/app")} className="px-6 py-2.5 rounded-full bg-white text-primary text-sm font-bold border-2 border-white">
              Find PG Near My College
            </button>
            <button onClick={() => navigate("/app")} className="px-6 py-2.5 rounded-full border-2 border-white/60 text-white text-sm font-bold">
              Explore PGs
            </button>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-white py-8 border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6 grid grid-cols-3 gap-6 text-center">
          {[{ val: "486+", label: "PG Listings" }, { val: "24", label: "Colleges Covered" }, { val: "2,800+", label: "Happy Students" }].map(({ val, label }) => (
            <div key={label}>
              <div className="font-display text-2xl font-extrabold text-primary">{val}</div>
              <div className="text-xs text-gray-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── POPULAR COLLEGES ── */}
      <section className="bg-white py-10">
        <div className="max-w-3xl mx-auto px-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-display text-xl font-extrabold text-on-surface">Popular Colleges</h2>
            <button onClick={() => navigate("/app")} className="text-sm font-semibold text-primary">View all →</button>
          </div>
          <p className="text-sm text-gray-500 mb-6">Find PGs near top colleges in Pune</p>
          <div className="grid grid-cols-2 gap-3">
            {COLLEGES.map((c) => (
              <button
                key={c.abbr}
                onClick={() => navigate("/app")}
                className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-primary/30 hover:bg-surface-low transition-all text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-surface-mid flex items-center justify-center text-xs font-extrabold text-primary flex-shrink-0">
                  {c.abbr}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-on-surface truncate">{c.name}</div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                    <span className="material-symbols-outlined text-[12px]">location_on</span>
                    {c.location}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-display text-sm font-extrabold text-primary">{c.pgs}</div>
                  <div className="text-[11px] text-gray-400">PGs nearby</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="font-display text-xl font-extrabold text-on-surface text-center mb-8">How Stayable Works</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STEPS.map((s) => (
              <div key={s.num} className="bg-white rounded-2xl p-5 flex flex-col items-center text-center shadow-sm">
                <div className="w-8 h-8 rounded-full bg-primary text-white text-xs font-extrabold flex items-center justify-center mb-3">{s.num}</div>
                <span className="material-symbols-outlined text-[28px] text-primary mb-3">{s.icon}</span>
                <div className="text-sm font-bold text-on-surface mb-1">{s.title}</div>
                <div className="text-xs text-gray-500 leading-relaxed">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── QR CTA ── */}
      <section className="py-10 px-6">
        <div className="max-w-3xl mx-auto rounded-3xl bg-orange-500 p-10 text-center text-white">
          <span className="material-symbols-outlined text-[40px] mb-3 block">smartphone</span>
          <h2 className="font-display text-xl font-extrabold mb-2">Scan & Find PGs Instantly</h2>
          <p className="text-white/80 text-sm mb-6">Look for our QR codes in shops, cafés, coaching centres and college areas near you.</p>
          <button onClick={() => alert("QR scanner coming soon!")} className="px-6 py-2.5 rounded-full border-2 border-white text-white text-sm font-bold hover:bg-white hover:text-orange-500 transition-colors">
            See QR Experience
          </button>
        </div>
      </section>

      {/* ── FOOTER LINKS ── */}
      <footer className="py-6 text-center border-t border-gray-100">
        <div className="flex items-center justify-center gap-8">
          <button onClick={() => navigate("/owner")} className="text-sm text-gray-500 hover:text-primary transition-colors">Owner Dashboard →</button>
        </div>
      </footer>
    </div>
    {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}
