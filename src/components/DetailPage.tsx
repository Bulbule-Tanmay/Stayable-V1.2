import { useState } from "react"

type Props = {
  listingId: string

  isSaved: boolean

  onSaveToggle: (id: string) => void

  onBack: () => void

  onEnquire: (id: string) => void

  listings: any[]
}

const WA_ICON = (
  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.299.144.347.491 1.2.534 1.288.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.861.174.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086.159.058 1.011.477 1.184.564.173.086.289.13.332.202.043.073.043.419-.101.824z" />
  </svg>
)

export default function DetailPage({
  listingId,
  isSaved,
  onSaveToggle,
  onBack,
  onEnquire,
  listings,
}: Props) {
  const listing = listings.find((l) => l.id === listingId)

  const [activeImg, setActiveImg] = useState(0)

  if (!listing) return null

  return (
    <div className="flex flex-col w-full pb-28">
      {/* Gallery */}
      <div className="relative w-full aspect-[4/3] bg-slate-dark overflow-hidden">
        <img
          src={(listing.images ?? [])[activeImg] ?? ""}
          alt={listing.name}
          className="w-full h-full object-cover"
        />

        {/* Back + save */}
        <div className="absolute top-4 inset-x-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-[22px]">
              arrow_back
            </span>
          </button>
          <button
            onClick={() => onSaveToggle(listing.id)}
            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center active:scale-95 transition-transform"
          >
            <span
              className="material-symbols-outlined text-[22px]"
              style={{
                fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0",

                color: isSaved ? "#ef4444" : "white",
              }}
            >
              favorite
            </span>
          </button>
        </div>

        {/* Image count */}
        <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-white text-[11px] font-semibold px-2 py-1 rounded-full">
          {activeImg + 1} / {(listing.images ?? []).length}
        </div>

        {/* Distance badge */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-dark/85 backdrop-blur-md text-white text-[11px] font-semibold">
          <span className="material-symbols-outlined text-[13px] text-blue-300">
            near_me
          </span>
          {listing.distance} • {listing.walkTime ?? listing.walk_time ?? ""}
        </div>
      </div>

      {/* Thumbnail strip */}
      <div className="flex gap-2 px-4 py-2 overflow-x-auto">
        {(listing.images ?? []).map((img: any, i: number) => (
          <button
            key={i}
            onClick={() => setActiveImg(i)}
            className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden transition-all ${
              i === activeImg ? "ring-2 ring-primary scale-105" : "opacity-70"
            }`}
          >
            <img src={img} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      {/* Info */}
      <div className="px-4 pt-1 flex flex-col gap-4">
        {/* Name + rating */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="px-2 py-0.5 rounded-lg bg-surface-mid text-on-surface text-[11px] font-semibold">
                {listing.genderLabel ?? listing.gender_label ?? ""}
              </span>
              {listing.instant && (
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[12px]">
                    bolt
                  </span>
                  Instant Confirmation
                </span>
              )}
            </div>
            <h1 className="font-display text-xl font-extrabold text-on-surface">
              {listing.name}
            </h1>
            <p className="text-xs text-on-surface-muted mt-0.5 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">
                location_on
              </span>
              {listing.address}
            </p>
          </div>
          <div className="flex items-center gap-1 bg-surface-low px-2.5 py-1.5 rounded-full shrink-0">
            <span
              className="material-symbols-outlined text-[18px] text-amber-400"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              star
            </span>
            <span className="font-display text-sm font-bold">
              {listing.rating}
            </span>
            <span className="text-xs text-on-surface-muted">
              ({listing.reviewCount ?? listing.review_count ?? 0})
            </span>
          </div>
        </div>

        {/* Price */}
        <div className="bg-surface-low rounded-2xl px-4 py-3 flex items-baseline justify-between">
          <div>
            <span className="font-display text-2xl font-extrabold text-primary-dark">
              ₹
              {(listing.priceFrom ?? listing.price_from ?? 0).toLocaleString(
                "en-IN",
              )}
            </span>
            <span className="text-sm text-on-surface-muted ml-1">
              {listing.priceSuffix ?? listing.price_suffix ?? "/month"}
            </span>
          </div>
          <span className="text-xs text-on-surface-muted text-right">
            {listing.deposit}
          </span>
        </div>

        {/* Pricing tiers */}
        <div>
          <h3 className="text-sm font-bold text-on-surface mb-2">
            Occupancy & Rates
          </h3>
          <div
            className={`grid gap-2 ${
              (listing.tiers ?? []).length === 3 ? "grid-cols-3" : "grid-cols-2"
            }`}
          >
            {(listing.tiers ?? []).map((t: any, i: number) => (
              <div
                key={t.label}
                className={`rounded-xl p-3 flex flex-col items-center gap-1 ${
                  i === 0 ? "bg-primary-dark text-white" : "bg-surface-mid"
                }`}
              >
                <span
                  className={`text-[11px] font-semibold ${
                    i === 0 ? "text-white/70" : "text-on-surface-muted"
                  }`}
                >
                  {t.label}
                </span>
                <span
                  className={`font-display text-base font-extrabold ${
                    i === 0 ? "text-white" : "text-on-surface"
                  }`}
                >
                  ₹{t.price.toLocaleString("en-IN")}
                </span>
                <span
                  className={`text-[10px] ${
                    i === 0 ? "text-white/60" : "text-on-surface-muted"
                  }`}
                >
                  /month
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Highlights */}
        <div>
          <h3 className="text-sm font-bold text-on-surface mb-2">Highlights</h3>
          <div className="grid grid-cols-2 gap-2">
            {listing.highlights.map((h: any) => (
              <div
                key={h}
                className="flex items-center gap-2 bg-surface-low rounded-xl px-3 py-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-verified shrink-0" />
                <span className="text-xs font-medium text-on-surface">{h}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Amenities */}
        <div>
          <h3 className="text-sm font-bold text-on-surface mb-2">Amenities</h3>
          <div className="flex flex-wrap gap-2">
            {(listing.amenities ?? []).map((a: any) => (
              <span
                key={a.label}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-low text-xs font-semibold"
              >
                <span className="material-symbols-outlined text-[14px] text-secondary">
                  {a.icon}
                </span>
                {a.label}
              </span>
            ))}
          </div>
        </div>

        {/* Landlord row */}
        <div className="bg-surface-low rounded-2xl p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {(listing.profiles?.full_name ?? "Owner").slice(0, 1).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="font-display text-sm font-bold text-on-surface">
                {listing.profiles?.full_name ?? "Verified Owner"}
              </span>
              <span
                className="material-symbols-outlined text-[15px] text-verified"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                verified
              </span>
            </div>
            <p className="text-xs text-on-surface-muted">
              Verified Owner • Responds within 2 hours
            </p>
          </div>
          <a
            href={`tel:${listing.phone}`}
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-secondary"
          >
            <span className="material-symbols-outlined text-[20px]">call</span>
          </a>
        </div>

        {/* About */}
        <div>
          <h3 className="text-sm font-bold text-on-surface mb-2">
            About This Property
          </h3>
          <p className="text-sm text-on-surface-muted leading-relaxed">
            Located near GH Raisoni Pune, this accommodation
            offers a safe, comfortable living experience for students. Fully
            furnished rooms with modern amenities, secure access, and a
            supportive community make it an ideal choice for your academic
            journey.
          </p>
        </div>
      </div>

      {/* Sticky action bar */}
      <div className="fixed bottom-16 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-surface-high px-4 py-3">
        <div className="grid grid-cols-12 gap-2">
          <a
            href={`https://wa.me/${listing.phone.replace("+", "")}?text=${listing.waMessage ?? listing.wa_message ?? ""}`}
            target="_blank"
            rel="noopener noreferrer"
            className="col-span-4 h-12 rounded-full bg-whatsapp text-white flex items-center justify-center gap-1.5 text-xs font-bold shadow-sm"
          >
            {WA_ICON}
            WhatsApp
          </a>
          <a
            href={`tel:${listing.phone}`}
            className="col-span-3 h-12 rounded-full bg-surface-mid text-on-surface flex items-center justify-center gap-1 text-xs font-semibold"
          >
            <span className="material-symbols-outlined text-[18px]">call</span>
            Call
          </a>
          <button
            onClick={() => onEnquire(listing.id)}
            className="col-span-5 h-12 rounded-full bg-primary-dark text-white flex items-center justify-center gap-1.5 text-xs font-bold shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">event</span>
            Schedule Visit
          </button>
        </div>
      </div>
    </div>
  )
}
