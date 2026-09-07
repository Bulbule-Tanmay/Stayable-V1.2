import { useState, useEffect } from "react";
import { adminGetOwners } from "../../lib/api";

export default function AdminOwners() {
  const [owners, setOwners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    adminGetOwners()
      .then((data) => setOwners(data ?? []))
      .catch(() => setOwners([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = owners.filter((o) =>
    !search || (o.full_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (o.email ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const subBadge = (owner: any) => {
    const sub = owner.owner_subscriptions?.[0];
    if (!sub) return null;
    const cfg: Record<string, string> = {
      active: "bg-emerald-500/20 text-emerald-400",
      trial: "bg-amber-500/20 text-amber-400",
      expired: "bg-red-500/20 text-red-400",
      cancelled: "bg-white/10 text-white/40",
    };
    return (
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg[sub.status] ?? cfg.trial}`}>
        {sub.subscription_plans?.name} • {sub.status}
      </span>
    );
  };

  return (
    <div className="py-6 flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Owners</h1>
          <p className="text-sm text-white/40">{owners.length} registered PG/Flat owners</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-white/30">search</span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email"
          className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total", value: owners.length, color: "text-white" },
          { label: "Active", value: owners.filter((o) => o.owner_subscriptions?.[0]?.status === "active").length, color: "text-emerald-400" },
          { label: "Trial", value: owners.filter((o) => o.owner_subscriptions?.[0]?.status === "trial" || !o.owner_subscriptions?.length).length, color: "text-amber-400" },
        ].map((s) => (
          <div key={s.label} className="bg-[#1a1d27] border border-white/5 rounded-2xl p-3 text-center">
            <p className={`font-display text-xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-white/40">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-2xl bg-white/5 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-white/30">No owners found</div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((owner) => {
            const sub = owner.owner_subscriptions?.[0];
            return (
              <div key={owner.id} className="bg-[#1a1d27] border border-white/5 rounded-2xl p-4 flex items-center gap-3">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/40 to-secondary/40 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {(owner.full_name ?? "O")[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-display text-sm font-bold text-white truncate">{owner.full_name ?? "Unknown"}</p>
                    {owner.is_verified && (
                      <span className="material-symbols-outlined text-[14px] text-emerald-400" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                    )}
                    {subBadge(owner)}
                  </div>
                  <p className="text-xs text-white/40 truncate">{owner.email ?? "—"} • {owner.phone ?? "—"}</p>
                  {sub?.expires_at && (
                    <p className="text-[10px] text-white/30 mt-0.5">
                      Renews {new Date(sub.expires_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <p className="text-xs font-bold text-white/60">
                    ₹{sub?.subscription_plans?.price ?? 0}/mo
                  </p>
                  {owner.phone && (
                    <a href={`tel:${owner.phone}`} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors">
                      <span className="material-symbols-outlined text-[16px]">call</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
