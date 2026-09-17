import { useState, useEffect } from "react";
import { getOwnerEnquiries, updateEnquiryStatus } from "../../lib/api";

const DEMO_ENQUIRIES = [
  {
    id: "1",
    student_name: "Karan Sharma",
    student_phone: "+91-XXXXXXXXXX",
    listing_name: "Sunrise PG",
    room_type: "Double Sharing",
    move_in: "2026-10-01",
    message: "Looking for double sharing room",
    status: "new",
  },
  {
    id: "2",
    student_name: "Vikram Singh",
    student_phone: "+91-XXXXXXXXXX",
    listing_name: "Sunrise PG",
    room_type: "Single Sharing",
    move_in: "2026-09-15",
    message: "Need single AC room",
    status: "contacted",
  },
  {
    id: "3",
    student_name: "Anjali Gupta",
    student_phone: "+91-XXXXXXXXXX",
    listing_name: "Campus View PG",
    room_type: "Triple Sharing",
    move_in: "2026-10-01",
    message: "Looking for affordable triple sharing",
    status: "resolved",
  },
];

const STATUS_STYLE: Record<string, string> = {
  new: "bg-blue-50 text-blue-600",
  contacted: "bg-green-50 text-green-600",
  resolved: "bg-gray-100 text-gray-500",
};

export default function OwnerEnquiries() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOwnerEnquiries()
      .then((data) => setItems(data && data.length > 0 ? data : DEMO_ENQUIRIES))
      .catch(() => setItems(DEMO_ENQUIRIES))
      .finally(() => setLoading(false));
  }, []);

  const handleMarkDone = (id: string) => {
    updateEnquiryStatus(id, "closed").catch(() => {});
    setItems((prev) => prev.map((e) => e.id === id ? { ...e, status: "resolved" } : e));
  };

  const enquiries = items.length > 0 ? items : DEMO_ENQUIRIES;

  return (
    <div className="flex flex-col gap-4 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-on-surface">Enquiries</h1>
        <p className="text-sm text-gray-500 mt-0.5">{enquiries.length} total enquiries</p>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {enquiries.map((e) => {
            const initial = (e.student_name ?? "K")[0].toUpperCase();
            const statusKey = e.status ?? "new";
            return (
              <div key={e.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-surface-mid flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                      {initial}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-on-surface">{e.student_name}</div>
                      <div className="text-xs text-gray-400">{e.student_phone}</div>
                    </div>
                  </div>
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLE[statusKey] ?? "bg-gray-100 text-gray-500"}`}>
                    {statusKey}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-3 pl-1">
                  <div className="text-xs text-gray-500">PG: <span className="font-semibold text-on-surface">{e.listing_name ?? e.listings?.name ?? "Sunrise PG"}</span></div>
                  <div className="text-xs text-gray-500">Room: <span className="font-semibold text-on-surface">{e.room_type ?? "Double Sharing"}</span></div>
                  <div className="text-xs text-gray-500">Move-in: <span className="font-semibold text-on-surface">{e.move_in ?? "2026-10-01"}</span></div>
                  <div></div>
                  <div className="col-span-2 text-xs text-gray-500">Message: <span className="font-medium italic text-gray-700">&quot;{e.message ?? ""}&quot;</span></div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <a
                    href={`tel:${e.student_phone ?? ""}`}
                    className="py-2.5 bg-green-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[15px]">call</span> Call
                  </a>
                  <a
                    href={`https://wa.me/${String(e.student_phone ?? "").replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 bg-green-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[15px]">chat</span> WhatsApp
                  </a>
                  <button
                    onClick={() => handleMarkDone(e.id)}
                    disabled={statusKey === "resolved"}
                    className="py-2.5 border border-gray-200 text-xs font-semibold text-gray-600 rounded-xl flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[15px]">check</span> Mark Done
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
