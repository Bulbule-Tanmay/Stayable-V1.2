import { useEffect, useMemo, useRef, useState } from "react"
import { Circle, CircleMarker, MapContainer, TileLayer, Tooltip, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"

type Props = { savedIds: Set<string>; onSaveToggle: (id: string) => void; onViewDetails: (id: string) => void; onListView: () => void; listings: any[] }

const CAMPUS = { name: "GH Raisoni Pune Campus", lat: 18.5732358, lng: 73.9814749 }
const pointFor = (listing: any) => {
  const lat = Number(listing.latitude)
  const lng = Number(listing.longitude)
  return listing.latitude !== null && listing.latitude !== "" && listing.longitude !== null && listing.longitude !== "" && Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null
}
const distanceInKm = (lat: number, lng: number) => {
  const radians = (value: number) => (value * Math.PI) / 180
  const dLat = radians(lat - CAMPUS.lat), dLng = radians(lng - CAMPUS.lng)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(radians(CAMPUS.lat)) * Math.cos(radians(lat)) * Math.sin(dLng / 2) ** 2
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function MapFocus({ listing }: { listing: any }) {
  const map = useMap()
  useEffect(() => {
    const point = pointFor(listing)
    if (point) map.flyTo([point.lat, point.lng], Math.max(map.getZoom(), 15), { duration: 0.45 })
  }, [listing, map])
  return null
}

export default function MapPage({ savedIds, onSaveToggle, onViewDetails, onListView, listings }: Props) {
  const mapRef = useRef<any>(null)
  const mappedListings = useMemo(() => listings.filter(pointFor), [listings])
  const [selected, setSelected] = useState<any>(() => mappedListings[0] ?? null)
  const [satellite, setSatellite] = useState(false)
  const [locating, setLocating] = useState(false)

  useEffect(() => {
    if (!selected || !mappedListings.some((listing) => listing.id === selected.id)) setSelected(mappedListings[0] ?? null)
  }, [mappedListings, selected])

  const showMyLocation = () => {
    if (!navigator.geolocation || !mapRef.current) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => { mapRef.current.flyTo([coords.latitude, coords.longitude], 16, { duration: 0.5 }); setLocating(false) },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  if (!selected) return <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center"><span className="material-symbols-outlined text-[48px] text-on-surface-muted">location_off</span><p className="font-display text-base font-bold text-on-surface">No mapped properties yet</p><p className="text-sm text-on-surface-muted">Owners need to select their exact property location before it can appear here.</p><button onClick={onListView} className="rounded-full bg-primary-dark px-4 py-2 text-xs font-bold text-white">Back to List</button></div>

  const selectedPoint = pointFor(selected)!
  const mapTiles = satellite ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

  return <div className="flex w-full flex-col">
    <div className="z-30 px-3 pb-2 pt-2"><div className="flex items-center justify-between gap-3 rounded-2xl bg-white/95 p-3 shadow-md backdrop-blur-md"><div className="flex min-w-0 items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-mid text-secondary"><span className="material-symbols-outlined text-[20px]">school</span></div><div className="min-w-0"><div className="flex items-center gap-1.5"><span className="truncate font-display text-sm font-bold text-on-surface">{CAMPUS.name}</span><span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-bold text-white">Center</span></div><p className="truncate text-xs text-on-surface-muted">Showing {mappedListings.length} precisely mapped propert{mappedListings.length === 1 ? "y" : "ies"}</p></div></div><span className="shrink-0 rounded-full bg-surface-low px-3 py-2 text-xs font-semibold text-secondary">2 km radius</span></div></div>

    <div className="relative mx-3 h-[420px] overflow-hidden rounded-2xl border border-surface-high" style={{ width: "calc(100% - 1.5rem)" }}>
      <MapContainer center={[CAMPUS.lat, CAMPUS.lng]} zoom={14} className="h-full w-full" ref={mapRef} zoomControl={false}>
        <TileLayer attribution={satellite ? "Tiles &copy; Esri" : "&copy; OpenStreetMap contributors"} url={mapTiles} />
        <MapFocus listing={selected} />
        <Circle center={[CAMPUS.lat, CAMPUS.lng]} radius={2000} pathOptions={{ color: "#2563eb", fillColor: "#2563eb", fillOpacity: 0.05, dashArray: "7 7", weight: 1.5 }} />
        <CircleMarker center={[CAMPUS.lat, CAMPUS.lng]} radius={10} pathOptions={{ color: "#ffffff", fillColor: "#0051d5", fillOpacity: 1, weight: 3 }}><Tooltip permanent direction="top" offset={[0, -12]} className="!rounded-full !border-0 !bg-primary-dark !px-2 !py-1 !text-[11px] !font-bold !text-white !shadow-lg">GH Raisoni Main Gate</Tooltip></CircleMarker>
        {mappedListings.map((listing) => { const point = pointFor(listing)!; const active = selected.id === listing.id; const price = Number(listing.priceFrom ?? listing.price_from ?? 0); return <CircleMarker key={listing.id} center={[point.lat, point.lng]} radius={active ? 12 : 9} eventHandlers={{ click: () => setSelected(listing) }} pathOptions={{ color: "#ffffff", fillColor: active ? "#0051d5" : "#16a34a", fillOpacity: 1, weight: active ? 4 : 3 }}><Tooltip permanent={active} direction="top" offset={[0, -12]} className="!rounded-full !border-0 !bg-white !px-2 !py-1 !text-xs !font-bold !text-primary-dark !shadow-lg">₹{(price / 1000).toFixed(1)}k</Tooltip><Tooltip sticky={!active}>{listing.name}<br />{point.lat.toFixed(6)}, {point.lng.toFixed(6)}</Tooltip></CircleMarker> })}
      </MapContainer>
      <div className="absolute right-3 top-3 z-[500] flex flex-col gap-2"><button onClick={() => setSatellite((value) => !value)} aria-label="Switch map style" className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md"><span className="material-symbols-outlined text-[20px]">layers</span></button><button onClick={showMyLocation} aria-label="Show my location" disabled={locating} className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md disabled:opacity-60"><span className="material-symbols-outlined text-[20px]">{locating ? "progress_activity" : "my_location"}</span></button></div>
      <div className="absolute left-1/2 top-3 z-[500] -translate-x-1/2"><button onClick={onListView} className="flex h-9 items-center gap-1.5 rounded-full bg-primary-dark px-4 text-xs font-bold text-white shadow-lg"><span className="material-symbols-outlined text-[17px]">format_list_bulleted</span>List View ({listings.length})</button></div>
    </div>

    <div className="px-3 pb-28 pt-3"><div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-xl"><div className="flex items-start gap-3"><div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-surface-mid"><img src={(selected.images ?? [])[0] ?? ""} alt={selected.name} className="h-full w-full object-cover" /></div><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">Exact map location</span><button onClick={() => onSaveToggle(selected.id)} aria-label="Save listing" className="material-symbols-outlined text-[20px] text-on-surface-muted" style={{ fontVariationSettings: savedIds.has(selected.id) ? "'FILL' 1" : "'FILL' 0" }}>favorite</button></div><h2 className="mt-1 truncate font-display text-base font-bold text-on-surface">{selected.name}</h2><p className="truncate text-xs text-on-surface-muted">{selected.address}</p><p className="mt-1 font-display text-lg font-extrabold text-on-surface">₹{Number(selected.priceFrom ?? selected.price_from ?? 0).toLocaleString("en-IN")}<span className="ml-1 font-sans text-xs font-normal text-on-surface-muted">/ month</span></p></div></div><div className="flex flex-wrap gap-2"><span className="rounded-full bg-surface-high px-2 py-1 text-[11px] font-semibold"><span className="material-symbols-outlined mr-1 align-middle text-[14px]">directions_walk</span>{distanceInKm(selectedPoint.lat, selectedPoint.lng).toFixed(2)} km from campus</span><span className="rounded-full bg-surface-low px-2 py-1 text-[11px] font-semibold text-on-surface-muted">{selectedPoint.lat.toFixed(6)}, {selectedPoint.lng.toFixed(6)}</span></div><div className="grid grid-cols-12 gap-2"><a href={`https://wa.me/${String(selected.phone ?? "").replace("+", "")}?text=${selected.waMessage ?? selected.wa_message ?? ""}`} target="_blank" rel="noopener noreferrer" className="col-span-5 flex h-11 items-center justify-center rounded-full bg-whatsapp text-xs font-semibold text-white">WhatsApp</a><a href={`tel:${selected.phone ?? ""}`} className="col-span-3 flex h-11 items-center justify-center rounded-full bg-surface-mid text-xs font-semibold text-on-surface">Call</a><button onClick={() => onViewDetails(selected.id)} className="col-span-4 flex h-11 items-center justify-center rounded-full bg-primary-dark text-xs font-semibold text-white">Details <span className="material-symbols-outlined ml-1 text-[14px]">arrow_forward</span></button></div></div></div>
  </div>
}
