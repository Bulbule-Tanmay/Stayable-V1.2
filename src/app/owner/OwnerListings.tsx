import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { getOwnerListings, updateListing } from "../../lib/api";
const DEMO_PGS = [
  {
    id: "sunrise-pg",
    name: "Sunrise PG",
    address: "Lane 4, Kothrud, Pune",
    rating: 4.5,
    reviewCount: 32,
    rooms_free: 6,
    is_active: true,
    amenities: ["WiFi", "Food", "AC", "Laundry", "CCTV"],
    price_from: 6500,
    rooms: [
      { label: "Single Room", price: 10000, avail: 2 },
      { label: "Double Sharing", price: 7500, avail: 4 },
      { label: "Triple Sharing", price: 6500, avail: 0 },
    ],
    photos: [],
  },
  {
    id: "campus-view-pg",
    name: "Campus View PG",
    address: "Kothrud, Pune",
    rating: 4.2,
    reviewCount: 18,
    rooms_free: 4,
    is_active: true,
    amenities: ["WiFi", "AC", "CCTV"],
    price_from: 7000,
    rooms: [
      { label: "Single Room", price: 11000, avail: 1 },
      { label: "Double Sharing", price: 8000, avail: 3 },
      { label: "Triple Sharing", price: 7000, avail: 0 },
    ],
    photos: [],
  },
];

export default function OwnerListings() {
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);

  useEffect(() => {
    getOwnerListings()
      .then((data) => setItems(data && data.length > 0 ? data : DEMO_PGS))
      .catch(() => setItems(DEMO_PGS))
      .finally(() => setLoading(false));
  }, []);

  const pgs = items.length > 0 ? items : DEMO_PGS;
  const selected = pgs[selectedTab] ?? DEMO_PGS[0];
  const rooms = selected.rooms ?? DEMO_PGS[0].rooms;
  const photos = selected.photos ?? [];

  const adjustRoom = (label: string, delta: number) => {
    setItems((prev) => {
      const updated = prev.map((pg) => {
        if (pg.id !== selected.id) return pg;
        return {
          ...pg,
          rooms: (pg.rooms ?? rooms).map((r: any) =>
            r.label === label ? { ...r, avail: Math.max(0, r.avail + delta) } : r
          ),
        };
      });
      const updatedPg = updated.find((pg) => pg.id === selected.id);
      if (updatedPg && !String(updatedPg.id).startsWith("sunrise") && !String(updatedPg.id).startsWith("campus")) {
        updateListing(updatedPg.id, { rooms: updatedPg.rooms }).catch(() => {});
      }
      return updated;
    });
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-extrabold text-on-surface">My PGs</h1>
        <button
          onClick={() => navigate("/owner/listings/new")}
          className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          + Add PG
        </button>
      </div>

      {/* PG Tabs */}
      <div className="flex gap-2">
        {pgs.map((pg, i) => (
          <button
            key={pg.id}
            onClick={() => setSelectedTab(i)}
            className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${selectedTab === i ? "bg-primary text-white border-primary" : "border-gray-200 text-gray-600 bg-white"}`}
          >
            {pg.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
      ) : (
        <>
          {/* Main panel: PG card + Manage Rooms */}
          <div className="grid grid-cols-2 gap-4">
            {/* PG card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="h-48 bg-surface-mid overflow-hidden">
                {photos[0] ? (
                  <img src={typeof photos[0] === "string" ? photos[0] : photos[0]} alt={selected.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <span className="material-symbols-outlined text-[48px]">image</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-1">
                  <h2 className="font-display text-base font-bold text-on-surface">{selected.name}</h2>
                  <span className="flex items-center gap-0.5 text-[11px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                    <span className="material-symbols-outlined text-[12px]">verified</span> Verified
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                  <span className="material-symbols-outlined text-[13px]">location_on</span>
                  {selected.address}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                  <span className="text-amber-400">★</span>
                  <span className="font-semibold text-on-surface">{selected.rating}</span>
                  <span>({selected.reviewCount} reviews)</span>
                  <span>·</span>
                  <span>{selected.rooms_free ?? 6} rooms free</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {(selected.amenities ?? []).map((a: string) => (
                    <span key={a} className="text-[11px] px-2.5 py-1 bg-surface-low text-primary rounded-full font-medium">{a}</span>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => navigate(`/owner/listings/${selected.id}/edit`)} className="py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600">Edit Rent</button>
                  <button onClick={() => alert("Photo upload coming soon!")} className="py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600">Upload Photos</button>
                </div>
              </div>
            </div>

            {/* Manage Rooms */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-display text-base font-bold text-on-surface mb-4">Manage Rooms</h2>
              <div className="flex flex-col divide-y divide-gray-100">
                {rooms.map((r: any) => (
                  <div key={r.label} className="py-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-on-surface">{r.label}</span>
                      <span className="font-display text-sm font-extrabold text-primary">₹{Number(r.price).toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-medium ${r.avail > 0 ? "text-green-500" : "text-red-400"}`}>
                        {r.avail} available
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => adjustRoom(r.label, 1)}
                          className="w-6 h-6 rounded-full bg-green-100 text-green-600 text-sm font-bold flex items-center justify-center"
                        >
                          +1
                        </button>
                        <button
                          onClick={() => adjustRoom(r.label, -1)}
                          className="w-6 h-6 rounded-full bg-red-100 text-red-500 text-sm font-bold flex items-center justify-center"
                        >
                          -1
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Photos section */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-base font-bold text-on-surface">Photos</h2>
              <button className="text-sm font-semibold text-primary">+ Add Photos</button>
            </div>
            {photos.length > 0 ? (
              <div className="grid grid-cols-4 gap-2">
                {photos.slice(0, 6).map((photo: any, i: number) => (
                  <div key={i} className={`rounded-xl overflow-hidden ${i < 4 ? "aspect-square" : "aspect-video col-span-1"}`}>
                    <img src={typeof photo === "string" ? photo : photo} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-200 rounded-xl h-32 flex flex-col items-center justify-center text-gray-400 gap-2">
                <span className="material-symbols-outlined text-[32px]">add_photo_alternate</span>
                <span className="text-sm">Add photos</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
