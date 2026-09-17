import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { getOwnerListings, getOwnerEnquiries } from "../../lib/api";
import { useAuth } from "../AuthContext";

const ROOM_TYPES = [
  { label: "Single Room", avail: 2, total: 4 },
  { label: "Double Sharing", avail: 4, total: 6 },
  { label: "Triple Sharing", avail: 0, total: 3 },
];

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [myListings, setMyListings] = useState<any[]>([]);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getOwnerListings().catch(() => []),
      getOwnerEnquiries().catch(() => []),
    ]).then(([l, e]) => {
      setMyListings(l);
      setEnquiries(e);
    }).finally(() => setLoading(false));
  }, []);

  const name = profile?.full_name?.split(" ")[0] ?? "Ramesh";

  const STATS = [
    { icon: "visibility", label: "Total Views", value: 1284, delta: "+128 this week" },
    { icon: "mail", label: "Enquiries", value: enquiries.length || 43, delta: "+7 this week" },
    { icon: "call", label: "Calls", value: 18, delta: "+3 this week" },
    { icon: "chat", label: "WhatsApp", value: 27, delta: "+5 this week" },
  ];

  const QUICK_ACTIONS = [
    { icon: "photo_camera", label: "Upload Photos", onClick: () => alert("Photo upload coming soon!") },
    { icon: "mail", label: "View Enquiries", onClick: () => navigate("/owner/enquiries") },
    { icon: "payments", label: "Update Rent", onClick: () => navigate("/owner/listings") },
    { icon: "trending_up", label: "Analytics", onClick: () => navigate("/owner/dashboard") },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* Welcome */}
      <div>
        <h1 className="font-display text-2xl font-extrabold text-on-surface">Welcome, {name}! 👋</h1>
        <p className="text-sm text-gray-500 mt-0.5">Here&apos;s how your PGs are performing.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <span className="material-symbols-outlined text-[24px] text-gray-400 mb-2 block">{s.icon}</span>
            <div className="font-display text-2xl font-extrabold text-on-surface">{s.value.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            <div className="text-[11px] text-green-500 font-medium mt-1">{s.delta}</div>
          </div>
        ))}
      </div>

      {/* My PG Listings */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-base font-bold text-on-surface">My PG Listings</h2>
          <button onClick={() => navigate("/owner/listings")} className="text-sm font-semibold text-primary">Manage →</button>
        </div>
        {loading ? (
          <div className="h-16 bg-gray-100 rounded-xl animate-pulse" />
        ) : (
          <div className="flex flex-col gap-2">
            {(myListings.length > 0 ? myListings : [{ id: "demo", name: "Sunrise PG", price_from: 6500, is_active: true, rooms_available: 6 }]).map((l) => (
              <div key={l.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-surface-mid overflow-hidden flex-shrink-0">
                  {l.images?.[0] ? <img src={l.images[0]} alt={l.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-surface-mid" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-on-surface">{l.name}</div>
                  <div className="text-xs text-gray-500">₹{(l.price_from ?? l.priceFrom ?? 6500).toLocaleString("en-IN")}/mo · {l.rooms_available ?? 6} rooms available</div>
                </div>
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${l.is_active !== false ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"}`}>
                  {l.is_active !== false ? "active" : "inactive"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Room Availability */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-display text-base font-bold text-on-surface mb-5">
          Room Availability — {myListings[0]?.name ?? "Sunrise PG"}
        </h2>
        <div className="flex flex-col gap-4">
          {(myListings[0]?.rooms ?? ROOM_TYPES).map((r: any) => {
            const avail = r.avail ?? 0;
            const total = r.total ?? avail;
            return (
            <div key={r.label}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-on-surface">{r.label}</span>
                <span className={`text-sm font-bold ${avail > 0 ? "text-green-500" : "text-red-400"}`}>
                  {avail}/{total}
                  <span className="text-xs font-normal text-gray-400 ml-1">available</span>
                </span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-green-500 transition-all"
                  style={{ width: `${total > 0 ? (avail / total) * 100 : 0}%` }}
                />
              </div>
            </div>
            );
          })}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        {QUICK_ACTIONS.map((a) => (
          <button
            key={a.label}
            onClick={a.onClick}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
          >
            <span className="material-symbols-outlined text-[22px] text-gray-500">{a.icon}</span>
            <span className="text-sm font-semibold text-on-surface">{a.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
