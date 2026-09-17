import { useState } from "react";

type Props = {
  listingId: string;
  isSaved: boolean;
  onSaveToggle: (id: string) => void;
  onBack: () => void;
  onEnquire: (id: string) => void;
  listings: any[];
  collegeName?: string;
};

type Tab = "overview" | "photos" | "reviews";

const MOCK_REVIEWS = [
  { name: "Arjun Sharma", initial: "A", verified: true, rating: 5, date: "Aug 2026", text: "Very close to college and the room was clean. Owner is very helpful and responsive." },
  { name: "Rahul Patil", initial: "R", verified: true, rating: 4, date: "Jul 2026", text: "Food quality is good and the owner is responsive. WiFi speed could be better." },
  { name: "Vishal Kumar", initial: "V", verified: true, rating: 4, date: "Jun 2026", text: "Good location, but rooms are slightly small. Overall a decent stay." },
  { name: "Sneha Nair", initial: "S", verified: true, rating: 5, date: "May 2026", text: "Best PG near MIT! Clean, safe and affordable." },
];

function StarRating({ rating, size = "text-[16px]" }: { rating: number; size?: string }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`material-symbols-outlined ${size} text-amber-400`} style={{ fontVariationSettings: i <= rating ? "'FILL' 1" : "'FILL' 0" }}>
          star
        </span>
      ))}
    </div>
  );
}

export default function DetailPage({ listingId, isSaved, onSaveToggle, onBack, onEnquire, listings, collegeName = "Your College" }: Props) {
  const listing = listings.find((l) => l.id === listingId);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [activeImg, setActiveImg] = useState(0);

  if (!listing) return null;

  const images = listing.images ?? [];
  const price = Number(listing.priceFrom ?? listing.price_from ?? 0);
  const tiers = listing.tiers ?? [
    { label: "Single Room", price: 10000, available: 2 },
    { label: "Double Sharing", price: 7500, available: 4 },
    { label: "Triple Sharing", price: 6500, available: 0 },
  ];
  const amenities = listing.amenities ?? [
    { icon: "wifi", label: "WiFi" },
    { icon: "restaurant", label: "Food" },
    { icon: "ac_unit", label: "AC" },
    { icon: "local_laundry_service", label: "Laundry" },
    { icon: "videocam", label: "CCTV" },
    { icon: "menu_book", label: "Study Table" },
  ];

  const avgRating = (MOCK_REVIEWS.reduce((s, r) => s + r.rating, 0) / MOCK_REVIEWS.length).toFixed(1);
  const ratingCounts = [5, 4, 3, 2, 1].map((r) => MOCK_REVIEWS.filter((rv) => rv.rating === r).length);

  return (
    <div className="flex flex-col w-full pb-8">
      {/* Hero image */}
      <div className="relative w-full h-64 md:h-80 bg-gray-200 overflow-hidden">
        <img src={images[activeImg] ?? ""} alt={listing.name} className="w-full h-full object-cover" />
        {/* back + actions */}
        <button onClick={onBack} className="absolute top-4 left-4 w-9 h-9 rounded-full bg-black/40 text-white flex items-center justify-center">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </button>
        <div className="absolute top-4 right-4 flex gap-2">
          <button onClick={() => onSaveToggle(listing.id)} className="w-9 h-9 rounded-full bg-black/40 flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0", color: isSaved ? "#ef4444" : "white" }}>favorite</span>
          </button>
          <button className="w-9 h-9 rounded-full bg-black/40 text-white flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">share</span>
          </button>
        </div>
        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1">
            {images.slice(0, 3).map((img: string, i: number) => (
              <button key={i} onClick={() => setActiveImg(i)} className={`w-12 h-9 rounded-lg overflow-hidden border-2 ${activeImg === i ? "border-white" : "border-transparent"}`}>
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
            {images.length > 3 && (
              <div className="w-10 h-9 rounded-lg bg-black/60 flex items-center justify-center text-white text-xs font-bold">
                +{images.length - 3}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Info card */}
      <div className="bg-white mx-4 -mt-4 rounded-2xl shadow-lg p-4 relative z-10">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-lg font-extrabold text-on-surface">{listing.name}</h1>
              <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-green-50 text-green-600 text-[10px] font-bold border border-green-200">
                <span className="material-symbols-outlined text-[12px]">verified</span> Verified
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
              <span className="material-symbols-outlined text-[13px]">location_on</span>
              {listing.address ?? "Lane 4, Kothrud, Pune"}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[14px] text-amber-400" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="text-xs font-bold text-on-surface">{listing.rating}</span>
                <span className="text-xs text-gray-400">({listing.reviewCount} reviews)</span>
              </div>
              <span className="text-gray-300">·</span>
              <span className="text-xs text-gray-500 flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[13px]">directions_walk</span>
                {listing.walkTime ?? "6 min walk"}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400">Starting from</div>
            <div className="font-display text-xl font-extrabold text-primary">₹{price.toLocaleString("en-IN")}</div>
            <div className="text-xs text-gray-400">/month</div>
          </div>
        </div>

        {/* Distance stats */}
        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100">
          {[
            { icon: "school", val: listing.distance?.match(/\d+m/)?.[0] ?? "450m", label: `From ${collegeName}` },
            { icon: "directions_walk", val: (listing.walkTime?.match(/\d+/)?.[0] ?? "6") + " min", label: "Walk" },
            { icon: "pedal_bike", val: "2 min", label: "Bike" },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center text-center">
              <span className="material-symbols-outlined text-[22px] text-gray-500 mb-1">{s.icon}</span>
              <div className="font-bold text-sm text-on-surface">{s.val}</div>
              <div className="text-[10px] text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tab bar */}
      <div className="mx-4 mt-4 flex rounded-2xl overflow-hidden border border-gray-200 bg-white">
        {(["overview", "photos", "reviews"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`flex-1 py-3 text-sm font-semibold capitalize transition-colors ${activeTab === t ? "bg-primary text-white" : "text-gray-500"}`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === "overview" && (
        <div className="flex flex-col gap-4 mx-4 mt-4">
          {/* Room Options */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <h2 className="font-display text-base font-bold text-on-surface mb-3">Room Options</h2>
            <div className="flex flex-col divide-y divide-gray-100">
              {tiers.map((tier: any) => {
                const avail = tier.available ?? (tier.label?.includes("Triple") ? 0 : 2);
                return (
                  <div key={tier.label} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[22px] text-gray-400">bed</span>
                      <div>
                        <div className="text-sm font-semibold text-on-surface">{tier.label} Room</div>
                        <div className={`text-xs font-medium ${avail > 0 ? "text-green-500" : "text-red-400"}`}>
                          {avail > 0 ? `${avail} rooms available` : "Not available"}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-display text-sm font-extrabold text-primary">₹{Number(tier.price).toLocaleString("en-IN")}</div>
                      <div className="text-[10px] text-gray-400">/month</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Facilities */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <h2 className="font-display text-base font-bold text-on-surface mb-3">Facilities</h2>
            <div className="grid grid-cols-3 gap-3">
              {amenities.map((a: any) => (
                <div key={a.label} className="flex flex-col items-center justify-center gap-1.5 py-3 bg-gray-50 rounded-xl">
                  <span className="material-symbols-outlined text-[22px] text-gray-500">{a.icon}</span>
                  <div className="text-[11px] font-medium text-gray-600">{a.label.split(" ")[0]}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <h2 className="font-display text-base font-bold text-on-surface mb-3">Location</h2>
            <div className="h-32 bg-surface-low rounded-xl flex items-center justify-center relative overflow-hidden mb-3">
              <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(200,210,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(200,210,255,.4) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
              <div className="relative flex flex-col items-center gap-2">
                <span className="px-3 py-1.5 rounded-full bg-primary text-white text-xs font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">school</span> {collegeName}
                </span>
                <div className="w-px h-5 bg-gray-400" />
                <span className="px-3 py-1.5 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">home</span> {listing.name}
                </span>
                <div className="absolute right-0 top-1/2 text-[10px] text-gray-500">450m · 6 min walk</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => window.open("https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(listing.address ?? "Pune"), "_blank")}
                className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600"
              >
                <span className="material-symbols-outlined text-[16px]">map</span> Get Directions
              </button>
              <button className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600">
                <span className="material-symbols-outlined text-[16px]">pedal_bike</span> 2 min by bike
              </button>
            </div>
          </div>

          {/* Contact Owner */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <h2 className="font-display text-base font-bold text-on-surface mb-0.5">Contact Owner</h2>
            <p className="text-xs text-gray-400 mb-3">Owner: {listing.ownerName ?? "Ramesh Kulkarni"}</p>
            <div className="grid grid-cols-3 gap-2">
              <a href={`tel:${listing.phone ?? ""}`} className="py-2.5 bg-green-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-[15px]">call</span> Call Owner
              </a>
              <a href={`https://wa.me/${String(listing.phone ?? "").replace(/\D/g, "")}?text=Hi`} target="_blank" rel="noopener noreferrer" className="py-2.5 bg-green-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-[15px]">chat</span> WhatsApp
              </a>
              <button onClick={() => onEnquire(listing.id)} className="py-2.5 bg-primary text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-[15px]">mail</span> Enquire
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PHOTOS TAB ── */}
      {activeTab === "photos" && (
        <div className="mx-4 mt-4 grid grid-cols-2 gap-2">
          {images.map((img: string, i: number) => (
            <button key={i} onClick={() => setActiveImg(i)} className="rounded-xl overflow-hidden aspect-square">
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
          {images.length === 0 && (
            <div className="col-span-2 py-12 text-center text-gray-400 text-sm">No photos available</div>
          )}
        </div>
      )}

      {/* ── REVIEWS TAB ── */}
      {activeTab === "reviews" && (
        <div className="flex flex-col gap-4 mx-4 mt-4">
          {/* Rating summary */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-start gap-6">
            <div className="flex flex-col items-center">
              <div className="font-display text-4xl font-extrabold text-on-surface">{avgRating}</div>
              <StarRating rating={Math.round(Number(avgRating))} size="text-[18px]" />
              <div className="text-xs text-gray-400 mt-1">{MOCK_REVIEWS.length} reviews</div>
            </div>
            <div className="flex-1">
              {[5, 4, 3, 2, 1].map((r, i) => (
                <div key={r} className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-gray-500 w-3">{r}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${MOCK_REVIEWS.length > 0 ? (ratingCounts[i] / MOCK_REVIEWS.length) * 100 : 0}%` }} />
                  </div>
                  <span className="text-xs text-gray-400 w-3">{ratingCounts[i]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Review cards */}
          {MOCK_REVIEWS.map((review) => (
            <div key={review.name} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-surface-mid flex items-center justify-center text-xs font-bold text-primary">{review.initial}</div>
                  <div>
                    <div className="text-sm font-semibold text-on-surface">{review.name}</div>
                    <div className="flex items-center gap-1 text-[10px] text-green-500">
                      <span className="material-symbols-outlined text-[11px]">verified</span>
                      Verified Student
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <StarRating rating={review.rating} size="text-[13px]" />
                  <div className="text-[10px] text-gray-400 mt-0.5">{review.date}</div>
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{review.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
