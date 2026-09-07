import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { getOwnerListings, getOwnerEnquiries, getOwnerSubscription } from "../../lib/api";
import { useAuth } from "../AuthContext";

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [myListings, setMyListings] = useState<any[]>([]);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [sub, setSub] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getOwnerListings().catch(() => []),
      getOwnerEnquiries().catch(() => []),
      getOwnerSubscription().catch(() => null),
    ]).then(([l, e, s]) => {
      setMyListings(l);
      setEnquiries(e);
      setSub(s);
    }).finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: "Active Listings", value: myListings.filter((l) => l.is_active).length, icon: "apartment", color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Total Enquiries", value: enquiries.length, icon: "forum", color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Pending Replies", value: enquiries.filter((e) => e.status === "pending").length, icon: "schedule", color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Visits Scheduled", value: enquiries.filter((e) => e.status === "scheduled").length, icon: "event_available", color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  return (
    <div className="py-6 flex flex-col gap-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-on-surface">Dashboard</h1>
          <p className="text-sm text-on-surface-muted mt-0.5">Welcome back, {profile?.full_name ?? "Owner"}</p>
        </div>
        <button
          onClick={() => navigate("/owner/listings/new")}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary-dark text-white text-sm font-bold shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Listing
        </button>
      </div>

      {/* Subscription banner */}
      {!sub || sub?.status === "trial" ? (
        <div
          onClick={() => navigate("/owner/subscription")}
          className="cursor-pointer bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-[22px] text-amber-600">workspace_premium</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-amber-900">Free trial active</p>
            <p className="text-xs text-amber-700">Upgrade to publish your listings to students</p>
          </div>
          <span className="material-symbols-outlined text-[20px] text-amber-600">chevron_right</span>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-[22px] text-emerald-600" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-emerald-900">{sub?.subscription_plans?.name ?? "Active"} Plan</p>
            <p className="text-xs text-emerald-700">Expires {sub?.expires_at ? new Date(sub.expires_at).toLocaleDateString("en-IN") : "—"}</p>
          </div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">Active</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        {loading
          ? Array(4).fill(0).map((_, i) => <div key={i} className="h-24 rounded-2xl bg-surface-high animate-pulse" />)
          : stats.map((s) => (
              <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-2">
                <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center`}>
                  <span className={`material-symbols-outlined text-[20px] ${s.color}`}>{s.icon}</span>
                </div>
                <div>
                  <p className="font-display text-2xl font-extrabold text-on-surface">{s.value}</p>
                  <p className="text-xs text-on-surface-muted">{s.label}</p>
                </div>
              </div>
            ))}
      </div>

      {/* Recent enquiries */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-base font-bold text-on-surface">Recent Enquiries</h2>
          <button onClick={() => navigate("/owner/enquiries")} className="text-xs font-semibold text-secondary">See all</button>
        </div>
        {loading ? (
          <div className="h-32 rounded-2xl bg-surface-high animate-pulse" />
        ) : enquiries.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center text-sm text-on-surface-muted">No enquiries yet. Add a listing to get started.</div>
        ) : (
          <div className="flex flex-col gap-2">
            {enquiries.slice(0, 3).map((enq) => (
              <div key={enq.id} className="bg-white rounded-2xl p-3 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-surface-mid flex items-center justify-center flex-shrink-0">
                  <span className="font-display text-base font-bold text-secondary">
                    {(enq.student_name ?? "S")[0].toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-on-surface truncate">{enq.student_name ?? "Student"}</p>
                  <p className="text-xs text-on-surface-muted truncate">{enq.listings?.name ?? "Unknown Listing"}</p>
                </div>
                <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  enq.status === "replied" ? "bg-emerald-100 text-emerald-700"
                  : enq.status === "scheduled" ? "bg-blue-100 text-blue-700"
                  : "bg-amber-100 text-amber-700"
                }`}>{enq.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* My listings preview */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-base font-bold text-on-surface">My Listings</h2>
          <button onClick={() => navigate("/owner/listings")} className="text-xs font-semibold text-secondary">Manage</button>
        </div>
        {loading ? (
          <div className="h-24 rounded-2xl bg-surface-high animate-pulse" />
        ) : myListings.length === 0 ? (
          <button
            onClick={() => navigate("/owner/listings/new")}
            className="w-full border-2 border-dashed border-surface-high rounded-2xl p-6 text-center flex flex-col items-center gap-2 hover:border-primary/30 transition-colors"
          >
            <span className="material-symbols-outlined text-[32px] text-on-surface-muted">add_circle</span>
            <p className="text-sm font-semibold text-on-surface-muted">Add your first listing</p>
          </button>
        ) : (
          <div className="flex flex-col gap-2">
            {myListings.slice(0, 3).map((l) => (
              <div key={l.id} className="bg-white rounded-2xl overflow-hidden shadow-sm flex items-center gap-3 p-3">
                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-surface-mid">
                  <img src={(l.images ?? [])[0]} alt={l.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-on-surface truncate">{l.name}</p>
                  <p className="text-xs text-on-surface-muted">₹{(l.priceFrom ?? l.price_from ?? 0).toLocaleString("en-IN")}/mo</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${l.is_approved ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    {l.is_approved ? "Live" : "Pending"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
