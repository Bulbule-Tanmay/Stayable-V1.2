import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import StayableLogo from "../components/StayableLogo";
import AuthModal from "./AuthModal";
import { useAuth } from "./AuthContext";
import { signOut } from "../lib/auth";

const WA_ICON = (
  <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.299.144.347.491 1.2.534 1.288.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.861.174.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086.159.058 1.011.477 1.184.564.173.086.289.13.332.202.043.073.043.419-.101.824z" />
  </svg>
);

const TESTIMONIALS = [
  { name: "Ananya Deshmukh", college: "GH Raisoni, B.Tech CSE 2nd Year", text: "Found my PG within 2 hours of downloading the app. No broker, direct WhatsApp to owner. Saved ₹15,000 in brokerage!", rating: 5, type: "student" },
  { name: "Rohit Sharma", college: "GH Raisoni, MBA 1st Year", text: "The campus map feature is genius. Could see exactly which PGs were within 10 minutes walk from my department. Booked in one visit.", rating: 5, type: "student" },
  { name: "Priya Kulkarni", college: "Symbiosis, B.Com 3rd Year", text: "As a girl student, the Girls Only filter was so helpful. Found a safe, verified PG with CCTV and lady warden in my budget.", rating: 5, type: "student" },
  { name: "Rajesh Patil", college: "PG Owner, Kothrud Pune", text: "Got 12 genuine student enquiries in the first week itself. No brokerage fights, students come directly on WhatsApp. Best platform!", rating: 5, type: "owner" },
  { name: "Sunita Sharma", college: "Flat Owner, Wagholi", text: "Listed my 2BHK for student co-living and found 3 verified GH Raisoni students in 4 days. The verification system builds trust.", rating: 5, type: "owner" },
];

const FAQS_STUDENT = [
  { q: "Is Stayable free for students?", a: "100% free. Students never pay any brokerage or platform fee. All listing fees are paid by PG/flat owners only." },
  { q: "How do I contact an owner?", a: "Every listing has a WhatsApp button. Tap it to directly message the owner — no middlemen, no delays." },
  { q: "Are the listings verified?", a: "Our team physically verifies each property before it goes live. You also see student reviews for each listing." },
  { q: "Can I search near my college?", a: "Yes! Set your campus and get listings filtered by walking distance. Scan a QR code on campus for instant results." },
];

const FAQS_OWNER = [
  { q: "How much does it cost to list?", a: "Plans start at ₹499/month for 1 listing. Students are never charged — all fees are owner-side only." },
  { q: "How quickly will I get enquiries?", a: "Most verified listings start receiving WhatsApp enquiries within 24-48 hours of going live." },
  { q: "Do I need to pay brokerage?", a: "Zero brokerage. You pay only the monthly subscription fee. No per-booking charges ever." },
  { q: "How does the listing approval work?", a: "Submit your property details and our team verifies within 24 hours. Approved listings get a Verified badge." },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [authModal, setAuthModal] = useState<false | "student" | "owner">(false);
  const [activeFaqStudent, setActiveFaqStudent] = useState<number | null>(null);
  const [activeFaqOwner, setActiveFaqOwner] = useState<number | null>(null);
  const [savingsListings, setSavingsListings] = useState(3);
  const [menuOpen, setMenuOpen] = useState(false);
  const listingsRef = useRef<HTMLDivElement>(null);

  const handleCTA = (type: "student" | "owner") => {
    if (type === "student") {
      if (user) { navigate("/app"); } else { setAuthModal("student"); }
    } else {
      if (user && profile?.role === "owner") { navigate("/owner/dashboard"); } else { setAuthModal("owner"); }
    }
  };

  const handleSignOut = async () => {
    await signOut().catch(() => {});
    window.location.reload();
  };

  const estimatedSavings = savingsListings * 8000 * 0.85;

  return (
    <div className="min-h-screen bg-white font-body text-on-surface overflow-x-hidden">

      {/* ── NAVBAR ──────────────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white/95 backdrop-blur-xl border-b border-surface-high/60 shadow-[0_1px_8px_rgba(15,23,42,0.04)]">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <StayableLogo className="h-8 w-auto shrink-0" />

          <nav className="hidden lg:flex items-center gap-1">
            {[
              { label: "For Students & Parents", href: "#students" },
              { label: "For Property Owners", href: "#owners" },
              { label: "GH Raisoni Campus", href: "#campus" },
              { label: "How It Works", href: "#how" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="px-3 py-2 rounded-xl text-sm font-medium text-on-surface-muted hover:text-on-surface hover:bg-surface-low transition-colors"
              >
                {item.label}
              </a>
            ))}
            <span className="ml-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              Free
            </span>
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(profile?.role === "owner" ? "/owner/dashboard" : "/app")}
                  className="hidden sm:flex h-9 px-4 rounded-full bg-surface-low text-on-surface text-sm font-semibold items-center gap-1.5 hover:bg-surface-mid transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">dashboard</span>
                  {profile?.role === "owner" ? "Owner Dashboard" : "Explore PGs"}
                </button>
                <button onClick={handleSignOut} className="h-9 px-3 rounded-full bg-surface-low text-on-surface-muted text-sm font-medium hover:bg-surface-mid transition-colors">
                  Sign out
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setAuthModal("student")}
                  className="hidden sm:flex h-9 px-4 rounded-full bg-surface-low text-on-surface text-sm font-semibold items-center gap-1.5 hover:bg-surface-mid transition-colors"
                >
                  I am a Student
                </button>
                <button
                  onClick={() => setAuthModal("owner")}
                  className="h-9 px-4 rounded-full bg-primary-dark text-white text-sm font-bold flex items-center gap-1.5 hover:opacity-90 transition-opacity"
                >
                  <span className="hidden sm:block">List Your Property</span>
                  <span className="sm:hidden">List Property</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </>
            )}
            <button
              className="lg:hidden w-9 h-9 rounded-xl bg-surface-low flex items-center justify-center"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <span className="material-symbols-outlined text-[20px]">{menuOpen ? "close" : "menu"}</span>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="lg:hidden bg-white border-t border-surface-high px-4 pb-4 flex flex-col gap-1">
            {[
              { label: "For Students & Parents", href: "#students" },
              { label: "For Property Owners", href: "#owners" },
              { label: "GH Raisoni Campus", href: "#campus" },
              { label: "How It Works", href: "#how" },
            ].map((item) => (
              <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="py-3 text-sm font-medium text-on-surface border-b border-surface-high last:border-0">
                {item.label}
              </a>
            ))}
          </div>
        )}
      </header>

      {/* ── HERO ───────────────────────────────────────────────── */}
      <section className="pt-28 pb-16 px-4 bg-gradient-to-b from-surface to-white relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary/5 blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-secondary/5 blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Pune Campus Students & Owners
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-on-surface leading-[1.1] tracking-tight mb-5">
            The College Accommodation<br className="hidden sm:block" />
            <span className="text-primary"> Network Built for</span><br className="hidden sm:block" />
            Students. Not Brokerage.
          </h1>

          <p className="text-lg text-on-surface-muted max-w-2xl mx-auto mb-8 leading-relaxed">
            Direct Peer-to-Peer Connections via WhatsApp. Mapped with verified campus walking distances so every student finds and converts their accommodation easily.
          </p>

          {/* CTA pair */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
            <button
              onClick={() => handleCTA("student")}
              className="w-full sm:w-auto h-14 px-8 rounded-full bg-primary-dark text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-primary-dark/20 hover:opacity-90 transition-opacity"
            >
              <span className="material-symbols-outlined text-[20px]">search</span>
              Find a Student / Parent
            </button>
            <button
              onClick={() => handleCTA("owner")}
              className="w-full sm:w-auto h-14 px-8 rounded-full bg-white text-on-surface font-bold text-base flex items-center justify-center gap-2 border-2 border-surface-high hover:border-primary/30 hover:bg-surface-low transition-all"
            >
              <span className="material-symbols-outlined text-[20px] text-secondary">apartment</span>
              I am a PG/Flat Owner
            </button>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-center">
            {[
              { value: "100+", label: "PG Students", icon: "school" },
              { value: "89+", label: "PG/Flat Owners", icon: "apartment" },
              { value: "91%", label: "Commission-Free", icon: "verified" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
                <span className="font-display text-xl font-extrabold text-on-surface">{s.value}</span>
                <span className="text-sm text-on-surface-muted">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TWO-SIDED ECOSYSTEM ─────────────────────────────────── */}
      <section id="students" className="py-16 px-4 bg-surface-low/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">2 Types · One Shared Ecosystem</p>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-on-surface">Designed for Pune Campus Communities</h2>
            <p className="text-on-surface-muted mt-3 max-w-xl mx-auto text-sm">Traditional sources create artificial scarcity to push risky third-party commissions. Stayable creates direct transparency network verified across major college campuses in real time.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Student side */}
            <div className="bg-white rounded-3xl p-7 shadow-sm border border-surface-high/60">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-on-surface">Student & Parent Experience</h3>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">0% Brokerage</span>
                </div>
              </div>
              <ul className="flex flex-col gap-3">
                {[
                  { icon: "near_me", text: "Pinned PG Locations with Exact Campus Safety Audit — Walk from GH Raisoni Main Gate" },
                  { icon: "verified_user", text: "Student Profiles & Ratings by 200+ verified students. Owner responsiveness, room quality, food, and safety scores." },
                  { icon: "directions_walk", text: "Direct WhatsApp & Call Landlords — No Agencies. Save and compare 100–300 sqft accommodation options." },
                  { icon: "map", text: "In-App Google Maps On-Campus Walk Calculator — Know exact walking time from GH Raisoni Pune to any PG/flat before you visit." },
                  { icon: "discount", text: "30% discounts on PGs and ₹200–500 option discount coupons, saving you ₹1,500 more than the city average." },
                  { icon: "smartphone", text: "Want to Skip Using Apps? Download our Stayable One-Tap with a single tap on your phone to get the full experience." },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-on-surface">
                    <span className="material-symbols-outlined text-[18px] text-primary mt-0.5 shrink-0">{item.icon}</span>
                    {item.text}
                  </li>
                ))}
              </ul>
              <button onClick={() => handleCTA("student")} className="mt-6 w-full h-12 rounded-xl bg-primary-dark text-white font-bold text-sm flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[18px]">search</span>
                Explore Accommodations
              </button>
            </div>

            {/* Owner side */}
            <div id="owners" className="bg-primary-dark rounded-3xl p-7 shadow-sm text-white">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>apartment</span>
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-white">PG & Flat Owner Solution</h3>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">100% Free Listing</span>
                </div>
              </div>
              <ul className="flex flex-col gap-3">
                {[
                  { icon: "chat", text: "Zero-Broker Communication — Direct leads to your WhatsApp from students searching your area, recommending it." },
                  { icon: "location_on", text: "In-App Google Maps On-Campus Drive With Calculator — Students see exactly how far your property is from college gate." },
                  { icon: "discount", text: "30-Second Auto Listing App — Add photos, price, type, and go live. Platform handles all the enquiry routing." },
                  { icon: "star", text: "MIT with Smart Board — 5 Star Listing. Available within a single tap on your phone. Students contact directly via WhatsApp." },
                  { icon: "qr_code", text: "QR-enabled property walk-in. Students scan, see your listing, contact you — all in under 30 seconds." },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-white/80">
                    <span className="material-symbols-outlined text-[18px] text-blue-300 mt-0.5 shrink-0">{item.icon}</span>
                    {item.text}
                  </li>
                ))}
              </ul>
              <button onClick={() => handleCTA("owner")} className="mt-6 w-full h-12 rounded-xl bg-white text-primary-dark font-bold text-sm flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[18px]">add_business</span>
                List Your Property Free
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── CAMPUS MAP ──────────────────────────────────────────── */}
      <section id="campus" className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">A Hyper-Local Campus Ecosystem</p>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-on-surface mb-4">
                Near-Campus listings<br />from All-Connecting Both Worlds
              </h2>
              <p className="text-on-surface-muted mb-6 text-sm leading-relaxed">
                Stayable builds properties specifically for GH Raisoni students, parents, and verified landlords within the campus walking zone — so your commute is always walking distance.
              </p>
              <div className="flex flex-col gap-4 mb-8">
                {[
                  { icon: "near_me", label: "GH Raisoni Main Gate — Wagholi, Pune", sub: "Walking Facility" },
                  { icon: "directions_car", label: "Direct Landlord Links", sub: "No broker. No commission." },
                  { icon: "groups", label: "Campus Community", sub: "8 Student zones • 4 Daily Meals" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-surface-low flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px] text-primary">{item.icon}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-on-surface">{item.label}</p>
                      <p className="text-xs text-on-surface-muted">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => handleCTA("student")} className="h-12 px-6 rounded-xl bg-primary-dark text-white font-bold text-sm flex items-center gap-2">
                {WA_ICON}
                WhatsApp Owner
              </button>
            </div>

            {/* Map visual */}
            <div className="bg-surface-low rounded-3xl p-4 relative overflow-hidden shadow-inner border border-surface-high">
              <div className="aspect-square relative rounded-2xl overflow-hidden bg-[#e8f0f7]">
                {/* Roads */}
                <svg viewBox="0 0 400 400" className="absolute inset-0 w-full h-full opacity-30">
                  <line x1="0" y1="200" x2="400" y2="200" stroke="#94a3b8" strokeWidth="12" />
                  <line x1="200" y1="0" x2="200" y2="400" stroke="#94a3b8" strokeWidth="10" />
                  <line x1="0" y1="120" x2="400" y2="280" stroke="#94a3b8" strokeWidth="6" />
                  <line x1="0" y1="300" x2="300" y2="100" stroke="#94a3b8" strokeWidth="5" />
                </svg>
                {/* Campus block */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-20 bg-primary/20 border-2 border-primary rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <span className="material-symbols-outlined text-[24px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
                    <p className="text-[10px] font-bold text-primary">GH Raisoni</p>
                  </div>
                </div>
                {/* Price pins */}
                {[
                  { x: 30, y: 38, price: "₹7.5k", color: "bg-primary-dark" },
                  { x: 70, y: 25, price: "₹9.2k", color: "bg-secondary" },
                  { x: 20, y: 62, price: "₹8.5k", color: "bg-primary-dark" },
                  { x: 75, y: 70, price: "₹12k", color: "bg-primary" },
                  { x: 55, y: 82, price: "₹6.8k", color: "bg-verified" },
                ].map((pin, i) => (
                  <div
                    key={i}
                    className={`absolute ${pin.color} text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg border border-white/30 animate-bounce`}
                    style={{ left: `${pin.x}%`, top: `${pin.y}%`, animationDelay: `${i * 0.2}s`, animationDuration: "2s" }}
                  >
                    {pin.price}
                  </div>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {[{ color: "bg-primary-dark", label: "Under 5 min walk" }, { color: "bg-secondary", label: "5–10 min" }, { color: "bg-verified", label: "10+ min" }].map((item) => (
                  <div key={item.label} className="flex items-center gap-1.5 text-[11px] font-semibold text-on-surface">
                    <span className={`w-2 h-2 rounded-full ${item.color}`} />
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
      <section id="how" className="py-16 px-4 bg-surface-low/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Owner Growth & Direct Document Suite</p>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-on-surface">List Your Property. Get Direct Student Enquiries.</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { num: "1", title: "Fast 30-sec Onboarding", desc: "Create your account and add your property details in under 30 seconds. No complicated forms.", icon: "rocket_launch" },
              { num: "2", title: "Zero Commission Guarantee", desc: "Your listings reach 100% of students in your campus zone. Keep every paisa you earn.", icon: "verified_user" },
              { num: "3", title: "Physical Campus QR Rooms", desc: "We place Stayable QR stickers near GH Raisoni gates. Students scan → see your listing → contact you.", icon: "qr_code_2" },
              { num: "4", title: "A Verified Student Register", desc: "Students verify college ID. You know exactly who is enquiring, saving you time on unqualified leads.", icon: "how_to_reg" },
            ].map((step) => (
              <div key={step.num} className="bg-white rounded-2xl p-6 shadow-sm border border-surface-high/60 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[22px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>{step.icon}</span>
                  </div>
                  <span className="font-display text-3xl font-extrabold text-surface-high">{step.num}</span>
                </div>
                <h3 className="font-display text-base font-bold text-on-surface">{step.title}</h3>
                <p className="text-sm text-on-surface-muted leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RENTAL CALCULATOR ─────────────────────────────────────── */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-3xl border border-primary/10 p-8">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Owner Savings & Profit Calculator</p>
                <h2 className="font-display text-2xl font-extrabold text-on-surface mb-3">How much are you losing to brokers today?</h2>
                <p className="text-sm text-on-surface-muted mb-6">If you currently list through a broker, you typically pay 1 month rent per booking per year. Move to Stayable and keep 85% more.</p>

                <div className="mb-5">
                  <label className="text-sm font-semibold text-on-surface mb-2 block">
                    Number of listings: <span className="text-primary">{savingsListings}</span>
                  </label>
                  <input
                    type="range"
                    min={1} max={20} value={savingsListings}
                    onChange={(e) => setSavingsListings(+e.target.value)}
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-xs text-on-surface-muted mt-1">
                    <span>1 listing</span>
                    <span>20 listings</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-surface-high/40 flex flex-col gap-4">
                <div className="text-center">
                  <p className="text-xs font-semibold text-on-surface-muted mb-1">Estimated annual savings vs broker</p>
                  <p className="font-display text-4xl font-extrabold text-primary-dark">
                    ₹{estimatedSavings.toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-on-surface-muted mt-1">based on {savingsListings} listing{savingsListings > 1 ? "s" : ""} × avg ₹8,000/mo rent</p>
                </div>
                <div className="border-t border-surface-high pt-3 flex flex-col gap-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-muted">Stayable plan cost</span>
                    <span className="font-bold text-on-surface">₹{savingsListings <= 1 ? "499" : savingsListings <= 5 ? "999" : "1,999"}/mo</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-muted">Broker cost (avoided)</span>
                    <span className="font-bold text-verified">₹{(savingsListings * 8000).toLocaleString("en-IN")}/yr</span>
                  </div>
                </div>
                <button onClick={() => handleCTA("owner")} className="w-full h-12 rounded-xl bg-primary-dark text-white font-bold text-sm flex items-center justify-center gap-2">
                  Start Saving Now
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── QUICK OWNER REGISTRATION ─────────────────────────────── */}
      <section className="py-16 px-4 bg-primary-dark text-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-blue-300 uppercase tracking-widest mb-2">A Fast 2-Minute Landlord Registration</p>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold">List Your PG or Flat Today</h2>
            <p className="text-white/60 text-sm mt-3">Zero brokerage. Our verification team will reach out within 24 hours to activate your listing.</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 grid sm:grid-cols-2 gap-4">
            {[
              { label: "Owner / Manager Name", placeholder: "e.g. Rajesh Patil or Shri Jay Residency" },
              { label: "WhatsApp Number (For Student Leads)", placeholder: "+91 9876543210" },
              { label: "Property Name / Society", placeholder: "e.g. Sunrise Lucky Living or Shree Apts" },
              { label: "Target College / Campus", placeholder: "GH Raisoni Pune / Wagholi" },
            ].map((field) => (
              <div key={field.label}>
                <label className="text-xs font-semibold text-white/50 mb-1.5 block">{field.label}</label>
                <input
                  type="text"
                  placeholder={field.placeholder}
                  className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            ))}

            <div>
              <label className="text-xs font-semibold text-white/50 mb-1.5 block">Property Type & Vacancy Status</label>
              <div className="flex gap-2">
                {["Boys PG", "Girls PG", "Coed PG", "Flat/Apt"].map((t) => (
                  <button key={t} className="flex-1 h-9 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-white/60 hover:border-white/30 hover:text-white transition-colors">
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-white/50 mb-1.5 block">Private 1Br / BHK</label>
              <div className="flex gap-2">
                {["On-Going Listing", "Seasonal Only"].map((t) => (
                  <button key={t} className="flex-1 h-9 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-white/60 hover:border-white/30 hover:text-white transition-colors">
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="sm:col-span-2">
              <button
                onClick={() => handleCTA("owner")}
                className="w-full h-14 rounded-xl bg-white text-primary-dark font-extrabold text-base flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                <span className="material-symbols-outlined text-[22px]">verified</span>
                Register & Get Verified Now
              </button>
              <p className="text-center text-xs text-white/30 mt-2">By registering, you agree to Stayable terms. Zero brokerage guaranteed.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── QR CAMPUS DISCOVERY ───────────────────────────────────── */}
      <section className="py-16 px-4 bg-surface-low/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">A Hyper-Local On-Campus Discovery Network</p>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-on-surface mb-4">
                Scan Any Campus QR or Canteen, Skip the Search Bar
              </h2>
              <p className="text-on-surface-muted text-sm mb-6 leading-relaxed">
                Stayable QR codes are placed at GH Raisoni Campus Gates and Symbiosis, Pimpri-Chinchwad entrances. Students instantly launch verified listings directly on their phone — zero brokerage, zero download required for the first contact.
              </p>
              <div className="flex flex-col gap-3 mb-7">
                {[
                  { icon: "bolt", label: "Instant Deep Link", desc: "QR links directly to listings in campus zone, no search needed." },
                  { icon: "verified", label: "30-Day Vacancy Sync", desc: "Listings auto-update based on owner confirmations." },
                  { icon: "discount", label: "Zero Broker Fees", desc: "All contacts go direct to owner WhatsApp. No platform cut." },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[18px] text-primary">{item.icon}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-on-surface">{item.label}</p>
                      <p className="text-xs text-on-surface-muted">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* QR visual */}
            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="w-64 h-64 bg-white rounded-3xl shadow-2xl p-6 flex flex-col items-center justify-center gap-4 border border-surface-high">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <StayableLogo className="h-6 w-auto" />
                  </div>
                  <svg viewBox="0 0 100 100" className="w-36 h-36">
                    {/* QR code placeholder pattern */}
                    <rect x="5" y="5" width="30" height="30" rx="3" fill="none" stroke="#0F172A" strokeWidth="4" />
                    <rect x="12" y="12" width="16" height="16" rx="1" fill="#0F172A" />
                    <rect x="65" y="5" width="30" height="30" rx="3" fill="none" stroke="#0F172A" strokeWidth="4" />
                    <rect x="72" y="12" width="16" height="16" rx="1" fill="#0F172A" />
                    <rect x="5" y="65" width="30" height="30" rx="3" fill="none" stroke="#0F172A" strokeWidth="4" />
                    <rect x="12" y="72" width="16" height="16" rx="1" fill="#0F172A" />
                    {[45, 50, 55, 40, 60, 45, 55, 40, 65, 50].map((x, i) => (
                      <rect key={i} x={x} y={40 + (i % 4) * 8} width="5" height="5" rx="0.5" fill="#0F172A" />
                    ))}
                    {[65, 75, 70, 80, 65].map((x, i) => (
                      <rect key={i} x={x} y={65 + i * 7} width="5" height="5" rx="0.5" fill="#0F172A" />
                    ))}
                  </svg>
                  <p className="text-[11px] font-bold text-on-surface-muted text-center">Scan to see GH Raisoni<br />Campus Listings</p>
                </div>
                <div className="absolute -top-3 -right-3 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md">
                  LIVE
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Two-Sided Trust & Community</p>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-on-surface">Real Students. Real Owners. Real Reviews.</h2>
            <p className="text-on-surface-muted text-sm mt-3">Both the students and the PG owners who use it say the same thing — and they all point to the same difference.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-surface-low rounded-2xl p-5 flex flex-col gap-3">
                <div className="flex items-center gap-1">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <span key={j} className="material-symbols-outlined text-[16px] text-amber-400" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  ))}
                </div>
                <p className="text-sm text-on-surface leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-2 mt-auto pt-3 border-t border-surface-high/60">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ${t.type === "owner" ? "bg-secondary" : "bg-primary-dark"}`}>
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-on-surface">{t.name}</p>
                    <p className="text-xs text-on-surface-muted">{t.college}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-surface-low/50">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10">
          {/* Student FAQs */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-[20px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
              <h3 className="font-display text-xl font-bold text-on-surface">For University Students</h3>
            </div>
            <div className="flex flex-col gap-2">
              {FAQS_STUDENT.map((faq, i) => (
                <div key={i} className="bg-white rounded-xl border border-surface-high overflow-hidden">
                  <button
                    onClick={() => setActiveFaqStudent(activeFaqStudent === i ? null : i)}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <span className="text-sm font-semibold text-on-surface">{faq.q}</span>
                    <span className={`material-symbols-outlined text-[20px] text-on-surface-muted transition-transform ${activeFaqStudent === i ? "rotate-180" : ""}`}>expand_more</span>
                  </button>
                  {activeFaqStudent === i && (
                    <div className="px-4 pb-4 text-sm text-on-surface-muted leading-relaxed border-t border-surface-high pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Owner FAQs */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-[20px] text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>apartment</span>
              <h3 className="font-display text-xl font-bold text-on-surface">For PG & Flat Owners</h3>
            </div>
            <div className="flex flex-col gap-2">
              {FAQS_OWNER.map((faq, i) => (
                <div key={i} className="bg-white rounded-xl border border-surface-high overflow-hidden">
                  <button
                    onClick={() => setActiveFaqOwner(activeFaqOwner === i ? null : i)}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <span className="text-sm font-semibold text-on-surface">{faq.q}</span>
                    <span className={`material-symbols-outlined text-[20px] text-on-surface-muted transition-transform ${activeFaqOwner === i ? "rotate-180" : ""}`}>expand_more</span>
                  </button>
                  {activeFaqOwner === i && (
                    <div className="px-4 pb-4 text-sm text-on-surface-muted leading-relaxed border-t border-surface-high pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-primary-dark text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold mb-4">
            Find Your Perfect PG Near Campus
          </h2>
          <p className="text-white/60 text-sm mb-8">Zero brokerage. Verified listings. Direct owner contact. Start your search today.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button onClick={() => handleCTA("student")} className="w-full sm:w-auto h-14 px-8 rounded-full bg-white text-primary-dark font-extrabold text-base flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
              <span className="material-symbols-outlined text-[20px]">search</span>
              Explore Now — Free
            </button>
            <button onClick={() => handleCTA("owner")} className="w-full sm:w-auto h-14 px-8 rounded-full bg-white/10 border border-white/20 text-white font-bold text-base flex items-center justify-center gap-2 hover:bg-white/20 transition-colors">
              {WA_ICON}
              List Your Property
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer className="bg-[#070c14] text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-white/5">
            <div>
              <StayableLogo className="h-7 w-auto brightness-0 invert mb-3" />
              <p className="text-sm text-white/40 leading-relaxed">Student accommodation finder for Pune campus communities. Zero brokerage, direct owner connections.</p>
            </div>
            {[
              { title: "Students & Parents", links: ["Explore PGs", "Explore Flats", "Campus Map", "How It Works", "Safety Checks"] },
              { title: "PG & Flat Owners", links: ["List Your Property", "Owner Dashboard", "Subscription Plans", "Verified Owner Badge", "Owner Support"] },
              { title: "Company", links: ["About Stayable", "Terms of Service", "Privacy Policy", "Cancellation Policy", "Contact Us"] },
            ].map((col) => (
              <div key={col.title}>
                <p className="text-xs font-bold text-white/60 uppercase tracking-widest mb-3">{col.title}</p>
                <ul className="flex flex-col gap-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-white/40 hover:text-white/80 transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/25">
            <p>© 2025 Stayable Technologies Pvt. Ltd. All rights reserved. Zero-Brokerage Guaranteed.</p>
            <p>GH Raisoni Pune Campus Hostels</p>
          </div>
        </div>
      </footer>

      {authModal && (
        <AuthModal
          defaultMode={authModal}
          onClose={() => setAuthModal(false)}
        />
      )}
    </div>
  );
}
