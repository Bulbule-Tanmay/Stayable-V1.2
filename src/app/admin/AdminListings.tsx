import { useState, useEffect } from "react";
import { adminGetListings, adminApproveListing } from "../../lib/api";

export default function AdminListings() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    adminGetListings()
      .then((data) => setItems(data ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const handleApprove = async (id: string, approved: boolean) => {
    setUpdating(id);
    const updated = await adminApproveListing(id, approved).catch(() => null);
    setItems((prev) =>
      prev.map((l) =>
        l.id === id ? { ...l, is_approved: approved, is_active: approved } : l
      )
    );
    setUpdating(null);
  };

  let filtered = items;
  if (filter === "pending") filtered = items.filter((l) => !l.is_approved);
  if (filter === "approved") filtered = items.filter((l) => l.is_approved);
  if (search) filtered = filtered.filter((l) => (l.name ?? "").toLowerCase().includes(search.toLowerCase()));

  const counts = {
    all: items.length,
    pending: items.filter((l) => !l.is_approved).length,
    approved: items.filter((l) => l.is_approved).length,
  };

  return (
    <div className="py-6 flex flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Listings</h1>
        <p className="text-sm text-white/40">{items.length} total listings across all owners</p>
      </div>

      {/* Search */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-white/30">search</span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search listings..."
          className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(["all", "pending", "approved"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              filter === f ? "bg-white text-on-surface" : "bg-white/5 text-white/50 border border-white/10 hover:border-white/20"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${filter === f ? "bg-black/10" : "bg-white/10"}`}>
              {counts[f as keyof typeof counts]}
            </span>
          </button>
        ))}
      </div>

      {/* Pending alert */}
      {counts.pending > 0 && filter !== "approved" && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center gap-3">
          <span className="material-symbols-outlined text-[22px] text-amber-400">pending_actions</span>
          <p className="text-sm font-semibold text-amber-300">
            {counts.pending} listing{counts.pending > 1 ? "s" : ""} awaiting review
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-28 rounded-2xl bg-white/5 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-white/30">No listings found</div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((l) => (
            <div key={l.id} className="bg-[#1a1d27] border border-white/5 rounded-2xl overflow-hidden">
              <div className="flex gap-3 p-4">
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-white/5">
                  {(l.images ?? [])[0] && <img src={l.images[0]} alt={l.name} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-display text-sm font-bold text-white truncate">{l.name}</p>
                      <p className="text-xs text-white/40 truncate">{l.address ?? l.campus}</p>
                      <p className="text-xs text-white/50 mt-0.5">
                        Owner: {l.profiles?.full_name ?? "Unknown"} • {l.type?.toUpperCase()} • {l.gender}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${l.is_approved ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
                        {l.is_approved ? "Approved" : "Pending"}
                      </span>
                      <p className="text-xs font-bold text-white/60">
                        ₹{(l.priceFrom ?? l.price_from ?? 0).toLocaleString("en-IN")}/mo
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Admin actions */}
              <div className="flex gap-2 px-4 pb-4">
                {!l.is_approved ? (
                  <button
                    onClick={() => handleApprove(l.id, true)}
                    disabled={updating === l.id}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs font-bold hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
                  >
                    {updating === l.id ? (
                      <span className="w-3 h-3 border-2 border-emerald-400/40 border-t-emerald-400 rounded-full animate-spin" />
                    ) : (
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    )}
                    Approve & Publish
                  </button>
                ) : (
                  <button
                    onClick={() => handleApprove(l.id, false)}
                    disabled={updating === l.id}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/10 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-colors disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[16px]">unpublished</span>
                    Unpublish
                  </button>
                )}
                <div className="ml-auto flex items-center gap-1.5 text-xs text-white/30">
                  <span className="material-symbols-outlined text-[14px]">schedule</span>
                  {new Date(l.created_at ?? Date.now()).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
