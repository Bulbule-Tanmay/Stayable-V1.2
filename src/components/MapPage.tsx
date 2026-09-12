import { useState } from "react"

type Props = {
  savedIds: Set<string>

  onSaveToggle: (id: string) => void

  onViewDetails: (id: string) => void

  onListView: () => void

  listings: any[]
}

const WA_ICON = (
  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.299.144.347.491 1.2.534 1.288.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.861.174.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086.159.058 1.011.477 1.184.564.173.086.289.13.332.202.043.073.043.419-.101.824z" />
  </svg>
)

export default function MapPage({
  savedIds,
  onSaveToggle,
  onViewDetails,
  onListView,
  listings,
}: Props) {
  const [selected, setSelected] = useState<any>(() => listings[0] ?? null)

  if (!selected) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center">
        <span className="material-symbols-outlined text-[48px] text-on-surface-muted">
          location_off
        </span>
        <p className="font-display text-base font-bold text-on-surface">
          No properties found
        </p>
        <button
          onClick={onListView}
          className="rounded-full bg-primary-dark px-4 py-2 text-xs font-bold text-white"
        >
          Back to List
        </button>
      </div>
    )
  }

  const positionFor = (listing: any) => {
    const source = String(listing.id ?? listing.name ?? "listing")

    const hash = source
      .split("")
      .reduce((total, character) => total + character.charCodeAt(0), 0)

    return {
      x: listing.pin_x ?? listing.pinX ?? 25 + (hash % 50),
      y: listing.pin_y ?? listing.pinY ?? 30 + ((hash * 7) % 45),
    }
  }

  return (
    <div className="flex flex-col w-full relative">
      {/* Top anchor bar */}
      <div className="px-3 pt-2 pb-2 z-30">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-md flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-surface-mid flex items-center justify-center text-secondary shrink-0">
              <span
                className="material-symbols-outlined text-[20px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                school
              </span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-display text-sm font-bold text-on-surface truncate">
                  MIT-WPU Campus
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-secondary text-white shrink-0">
                  Center
                </span>
              </div>
              <p className="text-xs text-on-surface-muted truncate">
                Showing {listings.length} properties within 2 km
              </p>
            </div>
          </div>
          <button className="h-9 px-3 rounded-full bg-surface-low text-secondary flex items-center gap-1 text-xs font-semibold shrink-0">
            1.5 km
            <span className="material-symbols-outlined text-[16px]">tune</span>
          </button>
        </div>
      </div>

      {/* Map canvas */}
      <div
        className="relative w-full h-[420px] overflow-hidden bg-surface-mid mx-3 rounded-2xl"
        style={{ width: "calc(100% - 1.5rem)" }}
      >
        {/* SVG map background */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 400 420"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
        >
          <rect width="400" height="420" fill="#E8EDF5" />
          <path
            d="M-20 40 Q 60 70 110 30 T 220 50 L 250 -20 L -30 -20 Z"
            fill="#D9ECD9"
            opacity="0.8"
          />
          <path
            d="M300 360 Q 340 320 410 340 L 420 440 L 280 430 Z"
            fill="#D9ECD9"
            opacity="0.7"
          />
          {/* Campus polygon */}
          <path
            d="M120 155 L 220 147 L 238 218 L 135 236 Z"
            fill="#2563EB"
            fillOpacity="0.12"
          />
          <path
            d="M120 155 L 220 147 L 238 218 L 135 236 Z"
            stroke="#0051D5"
            strokeWidth="2"
            strokeDasharray="4 3"
            opacity="0.6"
          />
          <text
            x="138"
            y="194"
            fill="#0051D5"
            fontFamily="Plus Jakarta Sans"
            fontSize="9"
            fontWeight="700"
            letterSpacing="1"
            opacity="0.85"
          >
            MIT-WPU ZONE
          </text>
          {/* Roads */}
          <path
            d="M-20 108 C 100 118, 260 90, 420 65"
            stroke="#FFFFFF"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M-20 108 C 100 118, 260 90, 420 65"
            stroke="#CBD5E1"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <text
            x="30"
            y="100"
            fill="#76777D"
            fontFamily="Inter"
            fontSize="9"
            fontWeight="600"
            letterSpacing="0.5"
          >
            PAUD ROAD
          </text>
          <path
            d="M178 60 L 168 290 L 110 420"
            stroke="#FFFFFF"
            strokeWidth="9"
            strokeLinecap="round"
          />
          <path
            d="M178 60 L 168 290 L 110 420"
            stroke="#CBD5E1"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M30 228 C 110 228, 200 248, 420 240"
            stroke="#FFFFFF"
            strokeWidth="7"
          />
          <path d="M80 118 L 80 390" stroke="#FFFFFF" strokeWidth="6" />
          <path d="M250 80 L 275 350" stroke="#FFFFFF" strokeWidth="7" />
          <path d="M275 238 L 400 300" stroke="#FFFFFF" strokeWidth="5" />
          {/* Walking route from pin 0 to campus */}
          <path
            d="M 128 272 L 148 272 L 158 225 L 172 210"
            stroke="#0051D5"
            strokeDasharray="5 4"
            strokeLinecap="round"
            strokeWidth="3.5"
          />
          <circle cx="128" cy="272" fill="#0051D5" r="4" />
          {/* Radius ring */}
          <circle
            cx="178"
            cy="192"
            r="130"
            fill="none"
            stroke="#2563EB"
            strokeDasharray="6 6"
            strokeWidth="1.5"
            opacity="0.35"
          />
        </svg>

        {/* Campus marker */}
        <div className="absolute left-[44.5%] top-[43%] -translate-x-1/2 -translate-y-full z-20 flex flex-col items-center">
          <div className="bg-secondary text-white px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1 text-[11px] font-semibold">
            <span
              className="material-symbols-outlined text-[14px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              verified
            </span>
            MIT-WPU Main Gate
          </div>
          <div className="w-2.5 h-2.5 bg-secondary rotate-45 -mt-1 rounded-sm" />
        </div>

        {/* Price pins */}
        {listings.map((l) => {
          const isSelected = selected.id === l.id

          return (
            <button
              key={l.id}
              aria-label={`${l.name} ₹${l.priceFrom ?? l.price_from ?? 0}`}
              onClick={() => setSelected(l)}
              className="absolute -translate-x-1/2 -translate-y-full focus:outline-none"
              style={{
                left: `${positionFor(l).x}%`,
                top: `${positionFor(l).y}%`,
              }}
            >
              <div className="relative flex flex-col items-center">
                {isSelected && (
                  <span className="absolute -top-1 w-full h-full rounded-full bg-secondary/30 animate-ping" />
                )}
                <div
                  className={`relative px-2.5 py-1.5 rounded-full shadow-md flex items-center gap-1 transition-all text-[12px] font-bold ${
                    isSelected
                      ? "bg-primary-dark text-white ring-2 ring-secondary scale-110"
                      : "bg-white text-primary-dark"
                  }`}
                >
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-verified animate-pulse" />
                  )}
                  ₹{((l.priceFrom ?? l.price_from ?? 0) / 1000).toFixed(1)}k
                  <span
                    className={`text-[10px] font-normal ${
                      isSelected ? "text-white/70" : "text-on-surface-muted"
                    }`}
                  >
                    {l.name.split(" ")[0]}
                  </span>
                </div>
                <div
                  className={`w-2.5 h-2.5 rotate-45 -mt-1 ${
                    isSelected ? "bg-primary-dark" : "bg-white"
                  }`}
                />
              </div>
            </button>
          )
        })}

        {/* Map controls */}
        <div className="absolute right-3 top-3 z-30 flex flex-col gap-2">
          {["layers", "my_location", "traffic"].map((icon) => (
            <button
              key={icon}
              className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-on-surface hover:bg-surface-low active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-[20px]">
                {icon}
              </span>
            </button>
          ))}
        </div>

        {/* List view pill */}
        <div className="absolute left-1/2 -translate-x-1/2 top-3 z-30">
          <button
            onClick={onListView}
            className="h-9 px-4 rounded-full bg-primary-dark text-white shadow-lg flex items-center gap-1.5 text-xs font-bold active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-[17px]">
              format_list_bulleted
            </span>
            List View ({listings.length})
          </button>
        </div>
      </div>

      {/* Selected listing docked card */}
      <div className="px-3 mt-3 pb-28">
        <div className="bg-white rounded-2xl p-4 shadow-xl flex flex-col gap-3">
          <div className="flex gap-3 items-start">
            <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-surface-mid">
              <img
                src={(selected.images ?? [])[0] ?? ""}
                alt={selected.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-1 left-1 bg-primary-dark/80 rounded-full px-1.5 py-0.5 flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[11px] text-white">
                  photo_camera
                </span>
                <span className="text-[9px] text-white font-bold">
                  {selected.images.length}
                </span>
              </div>
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1 bg-surface-low px-2 py-0.5 rounded-full">
                  <span
                    className="material-symbols-outlined text-[13px] text-verified"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    verified
                  </span>
                  <span className="text-[11px] text-verified font-semibold">
                    Verified Listing
                  </span>
                </div>
                <button
                  onClick={() => onSaveToggle(selected.id)}
                  className="w-7 h-7 rounded-full bg-surface-low flex items-center justify-center"
                >
                  <span
                    className="material-symbols-outlined text-[16px]"
                    style={{
                      fontVariationSettings: savedIds.has(selected.id)
                        ? "'FILL' 1"
                        : "'FILL' 0",

                      color: savedIds.has(selected.id) ? "#ef4444" : "#45464d",
                    }}
                  >
                    favorite
                  </span>
                </button>
              </div>
              <h2 className="font-display text-base font-bold text-on-surface mt-1 truncate">
                {selected.name}
              </h2>
              <p className="text-xs text-on-surface-muted truncate">
                {selected.address}
              </p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-display text-lg font-extrabold text-on-surface">
                  ₹
                  {(
                    selected.priceFrom ??
                    selected.price_from ??
                    0
                  ).toLocaleString("en-IN")}
                </span>
                <span className="text-xs text-on-surface-muted">/ month</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1 bg-surface-high px-2 py-1 rounded-full">
              <span className="material-symbols-outlined text-[14px]">
                directions_walk
              </span>
              <span className="text-[11px] font-semibold">
                {selected.distance}
              </span>
              <span className="text-on-surface-muted text-[10px]">
                • {selected.walkTime ?? selected.walk_time ?? ""}
              </span>
            </div>
            <div className="bg-surface-low text-on-surface-muted px-2 py-1 rounded-full text-[11px] font-semibold">
              {selected.genderLabel}
            </div>
          </div>

          <div className="grid grid-cols-12 gap-2">
            <a
              href={`https://wa.me/${selected.phone.replace("+", "")}?text=${selected.waMessage ?? selected.wa_message ?? ""}`}
              target="_blank"
              rel="noopener noreferrer"
              className="col-span-5 h-11 rounded-full bg-whatsapp text-white flex items-center justify-center gap-1.5 text-xs font-semibold shadow-sm"
            >
              {WA_ICON}
              WhatsApp
            </a>
            <a
              href={`tel:${selected.phone}`}
              className="col-span-3 h-11 rounded-full bg-surface-mid text-on-surface flex items-center justify-center gap-1 text-xs font-semibold"
            >
              <span className="material-symbols-outlined text-[18px]">
                call
              </span>
              Call
            </a>
            <button
              onClick={() => onViewDetails(selected.id)}
              className="col-span-4 h-11 rounded-full bg-primary-dark text-white flex items-center justify-center gap-1 text-xs font-semibold shadow-sm"
            >
              Details
              <span className="material-symbols-outlined text-[14px]">
                arrow_forward
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
