import { useState } from "react"

type Props = {
  listing: any

  isSaved: boolean

  onSaveToggle: (id: string) => void

  onViewDetails: (id: string) => void

  compact?: boolean
}

const WA_ICON = (
  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.299.144.347.491 1.2.534 1.288.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.861.174.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086.159.058 1.011.477 1.184.564.173.086.289.13.332.202.043.073.043.419-.101.824z" />
  </svg>
)

export default function ListingCard({
  listing,
  isSaved,
  onSaveToggle,
  onViewDetails,
  compact = false,
}: Props) {
  const [imgIdx, setImgIdx] = useState(0)

  const images = listing.images ?? []

  return (
    <article className="bg-white rounded-2xl overflow-hidden shadow-sm flex flex-col transition-all active:shadow-md">
      {/* Image */}
      <div className="relative w-full aspect-[16/10] overflow-hidden bg-slate-dark">
        <img
          src={images[imgIdx] || images[0] || ""}
          alt={listing.name}
          className="w-full h-full object-cover"
        />

        {/* Top badges row */}
        <div className="absolute top-2 inset-x-2 flex items-center justify-between pointer-events-none">
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-dark/85 backdrop-blur-md text-white text-[11px] font-semibold shadow-md pointer-events-auto">
            <span className="material-symbols-outlined text-[13px] text-blue-300">
              near_me
            </span>
            <span>{listing.distance}</span>
            <span className="text-white/50">•</span>
            <span className="text-emerald-300">
              {listing.walkTime ?? listing.walk_time ?? ""}
            </span>
          </div>
          <div className="flex items-center gap-1.5 pointer-events-auto">
            {listing.gender === "girls" && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-pink-900/80 backdrop-blur-md text-white text-[11px] font-semibold shadow-md">
                <span className="material-symbols-outlined text-[13px]">
                  female
                </span>
                Girls Only
              </span>
            )}
            {listing.instant && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/95 backdrop-blur-md text-emerald-600 text-[11px] font-semibold shadow-md">
                <span
                  className="material-symbols-outlined text-[13px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  verified
                </span>
                Verified
              </span>
            )}
            <button
              aria-label="Save listing"
              onClick={() => onSaveToggle(listing.id)}
              className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-md active:scale-90 transition-transform"
            >
              <span
                className="material-symbols-outlined text-[18px] transition-colors"
                style={{
                  fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0",

                  color: isSaved ? "#ef4444" : "#45464d",
                }}
              >
                favorite
              </span>
            </button>
          </div>
        </div>

        {/* Bottom: zero brokerage + dots */}
        <div className="absolute bottom-2 inset-x-2 flex items-center justify-between">
          <span className="px-2 py-0.5 rounded-full bg-primary-dark/90 backdrop-blur-sm text-white text-[11px] font-semibold">
            Zero Brokerage
          </span>
          {listing.images.length > 1 && (
            <div className="flex items-center gap-1 bg-slate-dark/60 backdrop-blur-sm px-2 py-0.5 rounded-full">
              {listing.images.map((_: any, i: number) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    i === imgIdx ? "bg-white" : "bg-white/40"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      {!compact && (
        <div className="p-4 flex flex-col gap-3">
          {/* Title row */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="px-1.5 py-0.5 rounded bg-surface-mid text-on-surface text-[11px] font-semibold">
                  {listing.genderLabel ?? listing.gender_label ?? ""}
                </span>
                {listing.instant && (
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[12px]">
                      bolt
                    </span>
                    Instant
                  </span>
                )}
              </div>
              <h3 className="font-display text-base font-bold text-on-surface truncate">
                {listing.name}
              </h3>
              <p className="text-xs text-on-surface-muted mt-0.5">
                {listing.address}
              </p>
            </div>
            <div className="flex items-center gap-1 bg-surface-low px-2 py-1 rounded-full shrink-0">
              <span
                className="material-symbols-outlined text-[16px] text-amber-400"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                star
              </span>
              <span className="text-xs font-bold text-on-surface">
                {listing.rating}
              </span>
              <span className="text-xs text-on-surface-muted">
                ({listing.reviewCount ?? listing.review_count ?? 0})
              </span>
            </div>
          </div>

          {/* Price band */}
          <div className="flex items-baseline justify-between py-1.5 bg-surface-low/60 rounded-xl px-3">
            <div className="flex items-baseline gap-1">
              <span className="font-display text-xl font-extrabold text-primary-dark">
                ₹
                {(listing.priceFrom ?? listing.price_from ?? 0).toLocaleString(
                  "en-IN",
                )}
              </span>
              <span className="text-xs text-on-surface-muted">
                {listing.priceSuffix ?? listing.price_suffix ?? "/month"}
              </span>
            </div>
            <span className="text-[11px] text-on-surface-muted">
              {listing.deposit}
            </span>
          </div>

          {/* Tier pills */}
          {(listing.tiers ?? []).length > 1 && (
            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-on-surface-muted font-semibold">
                Occupancy & Rates:
              </span>
              <div
                className={`grid gap-1.5 ${
                  (listing.tiers ?? []).length === 3
                    ? "grid-cols-3"
                    : "grid-cols-2"
                }`}
              >
                {(listing.tiers ?? []).map((t: any) => (
                  <div
                    key={t.label}
                    className="bg-surface-mid px-2 py-1.5 rounded-lg flex flex-col items-center"
                  >
                    <span className="text-[11px] text-on-surface-muted">
                      {t.label}
                    </span>
                    <span className="text-xs font-bold text-on-surface">
                      ₹{t.price.toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Amenities */}
          <div className="flex flex-wrap gap-1.5">
            {(listing.amenities ?? []).slice(0, 4).map((a: any) => (
              <span
                key={a.label}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-surface-low text-on-surface text-[11px] font-medium"
              >
                <span className="material-symbols-outlined text-[14px] text-secondary">
                  {a.icon}
                </span>
                {a.label}
              </span>
            ))}
          </div>

          {/* CTA bar */}
          <div className="grid grid-cols-12 gap-2 pt-2 mt-1 border-t border-surface-high/40">
            <a
              href={`https://wa.me/${listing.phone.replace("+", "")}?text=${listing.waMessage ?? listing.wa_message ?? ""}`}
              target="_blank"
              rel="noopener noreferrer"
              className="col-span-3 h-11 rounded-full bg-whatsapp text-white flex items-center justify-center gap-1 text-[11px] font-semibold shadow-sm active:scale-95 transition-transform"
            >
              {WA_ICON}
              <span className="hidden xs:inline">WA</span>
            </a>
            <a
              href={`tel:${listing.phone}`}
              className="col-span-3 h-11 rounded-full bg-surface-mid text-on-surface flex items-center justify-center gap-1 text-[11px] font-semibold active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-[18px]">
                call
              </span>
              <span>Call</span>
            </a>
            <button
              onClick={() => onViewDetails(listing.id)}
              className="col-span-6 h-11 rounded-full bg-primary-dark text-white flex items-center justify-center gap-1 text-[12px] font-semibold shadow-sm active:scale-98 transition-transform"
            >
              <span>View Details</span>
              <span className="material-symbols-outlined text-[16px]">
                arrow_forward
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Compact body for Saved tab */}
      {compact && (
        <div className="p-3 flex flex-col gap-1.5">
          <h3 className="font-display text-sm font-bold text-on-surface truncate">
            {listing.name}
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-xs text-on-surface-muted">
              {listing.distance}
            </span>
            <span className="font-display text-sm font-extrabold text-primary-dark">
              ₹
              {(listing.priceFrom ?? listing.price_from ?? 0).toLocaleString(
                "en-IN",
              )}
              <span className="font-normal text-xs text-on-surface-muted">
                /mo
              </span>
            </span>
          </div>
          <button
            onClick={() => onViewDetails(listing.id)}
            className="w-full h-9 rounded-full bg-primary-dark text-white text-xs font-semibold flex items-center justify-center gap-1 mt-1"
          >
            View Details
            <span className="material-symbols-outlined text-[14px]">
              arrow_forward
            </span>
          </button>
        </div>
      )}
    </article>
  )
}
