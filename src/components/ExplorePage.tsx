import FilterChips from "./FilterChips"

import ListingCard from "./ListingCard"

type Props = {
  segment: "pgs" | "flats"

  onSegmentChange: (s: "pgs" | "flats") => void

  filters: string[]

  onFiltersChange: (f: string[]) => void

  savedIds: Set<string>

  onSaveToggle: (id: string) => void

  onViewDetails: (id: string) => void

  onMapView: () => void

  listings: any[]

  loading?: boolean

  campus?: string

  onCampusChange?: () => void
}

export default function ExplorePage({
  segment,

  onSegmentChange,

  filters,

  onFiltersChange,

  savedIds,

  onSaveToggle,

  onViewDetails,

  onMapView,

  listings,

  loading = false,

  campus = "GH Raisoni Pune",

  onCampusChange,
}: Props) {
  const pgCount = listings.filter((l) => l.type === "pg").length

  const flatCount = listings.filter((l) => l.type === "flat").length

  let visible = listings.filter((l) =>
    segment === "pgs" ? l.type === "pg" : l.type === "flat",
  )

  if (filters.includes("budget"))
    visible = visible.filter((l) => (l.priceFrom ?? l.price_from) < 8000)

  if (filters.includes("single"))
    visible = visible.filter((l) =>
      (l.tiers ?? []).some((t: any) => t.label === "Single"),
    )

  if (filters.includes("double"))
    visible = visible.filter((l) =>
      (l.tiers ?? []).some((t: any) => t.label === "Double"),
    )

  if (filters.includes("food"))
    visible = visible.filter((l) =>
      (l.amenities ?? []).some((a: any) => a.icon === "restaurant"),
    )

  if (filters.includes("ac"))
    visible = visible.filter((l) =>
      (l.amenities ?? []).some((a: any) => a.icon === "ac_unit"),
    )

  if (filters.includes("walking"))
    visible = visible.filter((l) => {
      const value = l.walk_time_minutes ?? l.walkTime ?? l.walk_time ?? "99"

      const minutes =
        typeof value === "number"
          ? value
          : Number.parseInt(String(value).match(/\d+/)?.[0] ?? "99", 10)

      return minutes <= 10
    })

  return (
    <div className="flex flex-col w-full">
      {/* Campus context banner */}
      <div className="px-3 py-2">
        <div className="bg-surface-mid rounded-2xl p-3 flex flex-col gap-1.5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px]">
                  school
                </span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="font-display text-sm font-bold text-on-surface truncate">
                    {campus}
                  </span>
                  <span
                    className="material-symbols-outlined text-verified text-[15px] shrink-0"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    verified
                  </span>
                </div>
                <p className="text-xs text-on-surface-muted truncate">
                  Paud Road, Pune • Campus Zone
                </p>
              </div>
            </div>
            <button
              onClick={onCampusChange}
              className="px-3 py-1 rounded-full bg-white text-secondary text-xs font-semibold shrink-0 shadow-sm flex items-center gap-1"
            >
              Change
              <span className="material-symbols-outlined text-[14px]">
                swap_horiz
              </span>
            </button>
          </div>

          {/* QR context */}
          <div className="flex items-center justify-between pt-1.5 border-t border-surface-high/60">
            <div className="inline-flex items-center gap-1.5 bg-surface-highest/80 px-2 py-0.5 rounded-full">
              <span className="material-symbols-outlined text-primary-dark text-[13px]">
                qr_code_2
              </span>
              <span className="text-[10px] font-semibold text-on-surface">
                Scanned via Campus Main Gate QR
              </span>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-on-surface-muted">
              <span className="w-1.5 h-1.5 rounded-full bg-verified animate-pulse" />
              Live Availability
            </span>
          </div>
        </div>
      </div>

      {/* Segment toggle */}
      <div className="px-3 pt-1">
        <div className="bg-surface-high p-1 rounded-full flex items-center gap-1">
          <button
            onClick={() => onSegmentChange("pgs")}
            className={`flex-1 py-2 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              segment === "pgs"
                ? "bg-primary-dark text-white shadow-sm"
                : "text-on-surface-muted"
            }`}
          >
            PGs (Paying Guest)
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                segment === "pgs" ? "bg-white/20" : "bg-surface-highest"
              }`}
            >
              {pgCount}
            </span>
          </button>
          <button
            onClick={() => onSegmentChange("flats")}
            className={`flex-1 py-2 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              segment === "flats"
                ? "bg-primary-dark text-white shadow-sm"
                : "text-on-surface-muted"
            }`}
          >
            Flats (1/2/3 BHK)
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                segment === "flats" ? "bg-white/20" : "bg-surface-highest"
              }`}
            >
              {flatCount}
            </span>
          </button>
        </div>
      </div>

      {/* Filter chips */}
      <FilterChips active={filters} onChange={onFiltersChange} />

      {/* Meta */}
      <div className="px-3 pb-2 flex items-center justify-between">
        <p className="text-xs text-on-surface-muted">
          Showing{" "}
          <span className="text-on-surface font-semibold">
            {visible.length} accommodations
          </span>
        </p>
        <div className="flex items-center gap-1 text-secondary text-[11px] font-semibold">
          <span className="material-symbols-outlined text-[14px]">
            verified_user
          </span>
          Zero Brokerage
        </div>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-4 px-3 pb-32">
        {loading ? (
          Array(3)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="rounded-2xl bg-surface-mid animate-pulse"
                style={{ height: 320 }}
              />
            ))
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <span className="material-symbols-outlined text-[48px] text-on-surface-muted">
              search_off
            </span>
            <p className="text-sm font-semibold text-on-surface-muted">
              No results match your filters
            </p>
            <button
              onClick={() => onFiltersChange([])}
              className="px-4 py-2 rounded-full bg-primary-dark text-white text-xs font-semibold"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          visible.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              isSaved={savedIds.has(listing.id)}
              onSaveToggle={onSaveToggle}
              onViewDetails={onViewDetails}
            />
          ))
        )}
      </div>

      {/* Floating map toggle */}
      <div className="fixed bottom-20 inset-x-0 flex justify-center z-40 pointer-events-none">
        <button
          onClick={onMapView}
          className="pointer-events-auto h-11 px-6 rounded-full bg-primary-dark text-white shadow-xl flex items-center gap-2 text-sm font-bold active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[20px] text-blue-300">
            map
          </span>
          Map View
          <span className="w-1.5 h-1.5 rounded-full bg-verified ml-0.5" />
        </button>
      </div>
    </div>
  )
}
