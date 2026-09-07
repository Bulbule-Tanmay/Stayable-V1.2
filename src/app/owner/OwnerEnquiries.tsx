import { useState, useEffect } from "react";
import { getOwnerEnquiries, updateEnquiryStatus } from "../../lib/api";

const STATUS_CONFIG = {
  pending: { label: "Pending", bg: "bg-amber-100", text: "text-amber-700", icon: "schedule" },
  replied: { label: "Replied", bg: "bg-emerald-100", text: "text-emerald-700", icon: "reply" },
  scheduled: { label: "Visit Scheduled", bg: "bg-blue-100", text: "text-blue-700", icon: "event_available" },
  closed: { label: "Closed", bg: "bg-surface-high", text: "text-on-surface-muted", icon: "check_circle" },
};

const NEXT_STATUS: Record<string, string> = {
  pending: "replied",
  replied: "scheduled",
  scheduled: "closed",
};

const WA_ICON = (
  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.299.144.347.491 1.2.534 1.288.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.861.174.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086.159.058 1.011.477 1.184.564.173.086.289.13.332.202.043.073.043.419-.101.824z" />
  </svg>
);

export default function OwnerEnquiries() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    getOwnerEnquiries()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const handleAdvance = async (enq: any) => {
    const nextStatus = NEXT_STATUS[enq.status];
    if (!nextStatus) return;
    setUpdating(enq.id);
    const updated = await updateEnquiryStatus(enq.id, nextStatus).catch(() => ({ ...enq, status: nextStatus }));
    setItems((prev) => prev.map((e) => (e.id === enq.id ? { ...e, status: updated.status ?? nextStatus } : e)));
    setUpdating(null);
  };

  const filtered = filter === "all" ? items : items.filter((e) => e.status === filter);

  const counts = {
    all: items.length,
    pending: items.filter((e) => e.status === "pending").length,
    replied: items.filter((e) => e.status === "replied").length,
    scheduled: items.filter((e) => e.status === "scheduled").length,
  };

  return (
    <div className="py-6 flex flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-on-surface">Enquiries</h1>
        <p className="text-sm text-on-surface-muted">{items.length} total student enquiries</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(["all", "pending", "replied", "scheduled"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              filter === f ? "bg-primary-dark text-white" : "bg-white text-on-surface-muted border border-surface-high"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${filter === f ? "bg-white/20" : "bg-surface-mid"}`}>
              {counts[f as keyof typeof counts]}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-32 rounded-2xl bg-surface-high animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center">
          <span className="material-symbols-outlined text-[48px] text-on-surface-muted">forum</span>
          <p className="font-display text-base font-bold text-on-surface-muted mt-2">No enquiries here</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((enq) => {
            const cfg = STATUS_CONFIG[enq.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending;
            const waPhone = (enq.student_phone ?? "").replace(/\D/g, "");
            return (
              <div key={enq.id} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <div className="p-4 flex gap-3">
                  {/* Avatar */}
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-400 to-primary flex items-center justify-center text-white font-bold text-base flex-shrink-0">
                    {(enq.student_name ?? "S")[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-display text-sm font-bold text-on-surface">{enq.student_name ?? "Student"}</p>
                        <p className="text-xs text-on-surface-muted">{enq.student_phone}</p>
                      </div>
                      <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${cfg.bg} ${cfg.text}`}>
                        <span className="material-symbols-outlined text-[12px]">{cfg.icon}</span>
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-muted mt-0.5 truncate">
                      {enq.listings?.name ?? enq.listingName ?? "Listing"}
                    </p>
                    <p className="text-xs text-on-surface mt-1 leading-relaxed line-clamp-2">
                      {enq.message ?? enq.lastMessage ?? "Interested in this property."}
                    </p>
                    <p className="text-[10px] text-on-surface-muted mt-1">{enq.created_at ? new Date(enq.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : enq.sentAt ?? ""}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 px-4 pb-4">
                  {waPhone && (
                    <a
                      href={`https://wa.me/${waPhone}?text=Hi%2C%20this%20is%20the%20owner%20of%20the%20property%20you%20enquired%20about%20on%20Stayable.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-whatsapp text-white text-xs font-semibold"
                    >
                      {WA_ICON}
                      Chat
                    </a>
                  )}
                  {enq.student_phone && (
                    <a
                      href={`tel:${enq.student_phone}`}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-low text-on-surface text-xs font-semibold"
                    >
                      <span className="material-symbols-outlined text-[16px]">call</span>
                      Call
                    </a>
                  )}
                  {NEXT_STATUS[enq.status] && (
                    <button
                      onClick={() => handleAdvance(enq)}
                      disabled={updating === enq.id}
                      className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary-dark text-white text-xs font-semibold disabled:opacity-50"
                    >
                      {updating === enq.id ? (
                        <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      ) : (
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      )}
                      Mark as {NEXT_STATUS[enq.status]}
                    </button>
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
