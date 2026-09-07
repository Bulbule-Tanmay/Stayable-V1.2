import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { getOwnerListings, deleteListing, updateListing } from "../../lib/api";

export default function OwnerListings() {
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = () =>
    getOwnerListings()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this listing? This cannot be undone.")) return;
    setDeleting(id);
    await deleteListing(id).catch(() => {});
    setItems((prev) => prev.filter((l) => l.id !== id));
    setDeleting(null);
  };

  const handleToggle = async (l: any) => {
    const updated = await updateListing(l.id, { is_active: !l.is_active }).catch(() => ({ ...l, is_active: !l.is_active }));
    setItems((prev) => prev.map((x) => (x.id === l.id ? updated : x)));
  };

  return (
    <div className="py-6 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-on-surface">My Listings</h1>
          <p className="text-sm text-on-surface-muted">{items.length} properties</p>
        </div>
        <button
          onClick={() => navigate("/owner/listings/new")}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary-dark text-white text-sm font-bold shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Listing
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2].map((i) => <div key={i} className="h-28 rounded-2xl bg-surface-high animate-pulse" />)}
        </div>
      ) : items.length === 0 ? (
        <button
          onClick={() => navigate("/owner/listings/new")}
          className="border-2 border-dashed border-surface-high rounded-2xl p-10 text-center flex flex-col items-center gap-3 hover:border-primary/30"
        >
          <span className="material-symbols-outlined text-[48px] text-on-surface-muted">add_home</span>
          <p className="font-display text-base font-bold text-on-surface-muted">Add your first property</p>
          <p className="text-sm text-on-surface-muted">PGs, hostels, and flats welcome</p>
        </button>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((l) => (
            <div key={l.id} className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <div className="flex gap-3 p-4">
                {/* Thumbnail */}
                <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-surface-mid">
                  {(l.images ?? [])[0] && (
                    <img src={l.images[0]} alt={l.name} className="w-full h-full object-cover" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-display text-sm font-bold text-on-surface truncate">{l.name}</h3>
                      <p className="text-xs text-on-surface-muted mt-0.5 truncate">{l.address ?? l.campus}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${l.is_approved ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                        {l.is_approved ? "Approved" : "Pending Review"}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${l.is_active ? "bg-blue-100 text-blue-700" : "bg-surface-high text-on-surface-muted"}`}>
                        {l.is_active ? "Active" : "Paused"}
                      </span>
                    </div>
                  </div>
                  <p className="font-display text-base font-extrabold text-primary-dark mt-1">
                    ₹{(l.priceFrom ?? l.price_from ?? 0).toLocaleString("en-IN")}
                    <span className="font-normal text-xs text-on-surface-muted">/month</span>
                  </p>
                </div>
              </div>

              {/* Action bar */}
              <div className="flex items-center gap-2 px-4 pb-4">
                <button
                  onClick={() => navigate(`/owner/listings/${l.id}/edit`)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-low text-on-surface text-xs font-semibold"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                  Edit
                </button>
                <button
                  onClick={() => handleToggle(l)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold ${
                    l.is_active ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">{l.is_active ? "pause" : "play_arrow"}</span>
                  {l.is_active ? "Pause" : "Activate"}
                </button>
                <button
                  onClick={() => handleDelete(l.id)}
                  disabled={deleting === l.id}
                  className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 text-red-600 text-xs font-semibold disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                  {deleting === l.id ? "..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
