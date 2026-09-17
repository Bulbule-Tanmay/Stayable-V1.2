import { useState, useEffect } from "react"

import { useNavigate, useParams } from "react-router"

import { createListing, updateListing, getOwnerListings } from "../../lib/api"
import { CircleMarker, MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet"
const AMENITY_OPTIONS = [
  { icon: "restaurant", label: "Food Included" },

  { icon: "wifi", label: "Wi-Fi" },

  { icon: "ac_unit", label: "AC" },

  { icon: "cleaning_services", label: "Daily Maid" },

  { icon: "local_laundry_service", label: "Laundry" },

  { icon: "videocam", label: "CCTV" },

  { icon: "fitness_center", label: "Gym" },

  { icon: "local_parking", label: "Parking" },

  { icon: "water_drop", label: "RO Water" },

  { icon: "battery_charging_full", label: "Power Backup" },
]

type Tier = { label: string; price: string };

const CAMPUS_LOCATION = { lat: 18.5732358, lng: 73.9814749 }

const Field = ({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold text-on-surface-muted">
      {label}
    </label>
    {children}
  </div>
)

function LocationClickHandler({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (event) => onSelect(event.latlng.lat, event.latlng.lng) })
  return null
}

function MapCenter({ latitude, longitude }: { latitude: string; longitude: string }) {
  const map = useMap()

  useEffect(() => {
    if (latitude && longitude) map.setView([Number(latitude), Number(longitude)])
  }, [latitude, longitude, map])

  return null
}

function distanceInKm(lat: number, lng: number) {
  const earthRadius = 6371
  const latDelta = ((lat - CAMPUS_LOCATION.lat) * Math.PI) / 180
  const lngDelta = ((lng - CAMPUS_LOCATION.lng) * Math.PI) / 180
  const a = Math.sin(latDelta / 2) ** 2
    + Math.cos((CAMPUS_LOCATION.lat * Math.PI) / 180)
      * Math.cos((lat * Math.PI) / 180)
      * Math.sin(lngDelta / 2) ** 2
  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

async function reverseGeocode(lat: number, lng: number) {
  const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`)
  if (!response.ok) throw new Error("Address lookup failed")
  const result = await response.json()
  return result.display_name as string
}

export default function OwnerListingForm() {
  const navigate = useNavigate()

  const { id } = useParams()

  const isEdit = Boolean(id)

  const [saving, setSaving] = useState(false)

  const [error, setError] = useState("")

  const [form, setForm] = useState({
    name: "",

    type: "pg" as "pg" | "flat",

    gender: "coed" as "boys" | "girls" | "coed" | "unisex",

    gender_label: "",

    address: "",

    campus: "GH Raisoni Pune",

    distance: "",

    walk_time: "",

    phone: "",

    deposit: "",

    price_from: "",

    badge: "",

    instant: false,

    pin_x: "",

    pin_y: "",
    latitude: "",
    longitude: "",
  })

  const [tiers, setTiers] = useState<Tier[]>([{ label: "Double", price: "" }])

  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])

  const [imageUrls, setImageUrls] = useState<string[]>(["", "", ""])

  useEffect(() => {
    if (!isEdit || !id) return

    getOwnerListings()
      .then((items) => {
        const item = items.find((l) => l.id === id)

        if (!item) return

        setForm({
          name: item.name ?? "",

          type: item.type ?? "pg",

          gender: item.gender ?? "coed",

          gender_label: item.gender_label ?? "",

          address: item.address ?? "",

          campus: item.campus ?? "GH Raisoni Pune",

          distance: item.distance ?? "",

          walk_time: item.walk_time ?? item.walkTime ?? "",

          phone: item.phone ?? "",

          deposit: item.deposit ?? "",

          price_from: String(item.price_from ?? item.priceFrom ?? ""),

          badge: item.badge ?? "",

          instant: item.instant ?? false,

          pin_x: item.pin_x == null ? "" : String(item.pin_x),

          pin_y: item.pin_y == null ? "" : String(item.pin_y),

          latitude: item.latitude == null ? "" : String(item.latitude),

          longitude: item.longitude == null ? "" : String(item.longitude),
        })

        setTiers(
          (item.tiers ?? []).map((t: any) => ({
            label: t.label,
            price: String(t.price),
          })),
        )

        setSelectedAmenities((item.amenities ?? []).map((a: any) => a.label))

        setImageUrls([...(item.images ?? []), "", ""].slice(0, 3))
      })
      .catch((e: unknown) => {
        setError(
          e instanceof Error
            ? e.message
            : "Unable to load this listing for editing.",
        )
      })
  }, [id, isEdit])

  const update = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }))

  const toggleAmenity = (label: string) =>
    setSelectedAmenities((prev) =>
      prev.includes(label) ? prev.filter((a) => a !== label) : [...prev, label],
    )

  const addTier = () => setTiers((prev) => [...prev, { label: "", price: "" }])

  const removeTier = (i: number) =>
    setTiers((prev) => prev.filter((_, idx) => idx !== i))

  const updateTier = (i: number, k: keyof Tier, v: string) =>
    setTiers((prev) => prev.map((t, idx) => (idx === i ? { ...t, [k]: v } : t)))

  const setLocation = async (latitude: number, longitude: number) => {
    const distanceKm = distanceInKm(latitude, longitude)
    update("latitude", String(latitude))
    update("longitude", String(longitude))
    update("distance", `${distanceKm < 1 ? `${Math.round(distanceKm * 1000)}m` : `${distanceKm.toFixed(1)} km`} from GH Raisoni Pune`)
    update("walk_time", `${Math.max(1, Math.round(distanceKm * 12))} min walk`)
    try {
      update("address", await reverseGeocode(latitude, longitude))
    } catch {
      setError("Location selected, but the address could not be looked up. Please enter the address manually.")
    }
  }

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Location services are not available in this browser.")
      return
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => void setLocation(coords.latitude, coords.longitude),
      () => setError("Unable to access your location. Please allow location access or select a point on the map."),
    )
  }

  const handleSave = async () => {
    if (
      !form.name.trim() ||
      !form.price_from ||
      !form.address.trim() ||
      !form.phone.trim() ||
      !form.latitude ||
      !form.longitude
    ) {
      setError("Name, address, phone, starting price, and map location are required.")

      return
    }

    setSaving(true)

    setError("")

    const payload = {
      ...form,

      pin_x: form.pin_x === "" ? null : Number(form.pin_x),

      pin_y: form.pin_y === "" ? null : Number(form.pin_y),

      latitude: form.latitude === "" ? null : Number(form.latitude),

      longitude: form.longitude === "" ? null : Number(form.longitude),

      gender_label:
        form.gender === "boys"
          ? "Boys Only"
          : form.gender === "girls"
            ? "Girls Only"
            : form.gender === "coed"
              ? "Co-ed"
              : "Unisex",

      price_from: parseInt(form.price_from) || 0,

      tiers: tiers
        .filter((t) => t.label && t.price)
        .map((t) => ({ label: t.label, price: parseInt(t.price) })),

      amenities: AMENITY_OPTIONS.filter((a) =>
        selectedAmenities.includes(a.label),
      ),

      highlights: [],

      images: imageUrls.filter(Boolean),

      wa_message: `Hi%2C%20I%20saw%20${encodeURIComponent(form.name)}%20on%20Stayable`,

      price_suffix: "/month",

      is_active: true,

      is_approved: false,

      rating: 0,

      review_count: 0,
    }

    try {
      if (isEdit && id) {
        await updateListing(id, payload)
      } else {
        await createListing(payload)
      }

      navigate("/owner/listings")
    } catch (e: any) {
      setError(e.message ?? "Unable to save listing. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const inputCls =
    "w-full h-12 px-4 rounded-xl bg-white border border-surface-high text-sm font-medium text-on-surface placeholder:text-on-surface-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"

  return (
    <div className="py-6 flex flex-col gap-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl bg-surface-low flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-[20px]">
            arrow_back
          </span>
        </button>
        <div>
          <h1 className="font-display text-xl font-extrabold text-on-surface">
            {isEdit ? "Edit Listing" : "New Listing"}
          </h1>
          <p className="text-xs text-on-surface-muted">
            {isEdit
              ? "Update your property details"
              : "Fill in your property details"}
          </p>
        </div>
      </div>
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
          {error}
        </div>
      )}

      {/* Basic info */}
      <section className="bg-white rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
        <h2 className="font-display text-base font-bold text-on-surface">
          Basic Information
        </h2>

        <Field label="Property Name *">
          <input
            type="text"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="e.g. Sunrise Premium PG"
            className={inputCls}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Type">
            <select
              value={form.type}
              onChange={(e) => update("type", e.target.value)}
              className={inputCls}
            >
              <option value="pg">PG / Hostel</option>
              <option value="flat">Flat / Apartment</option>
            </select>
          </Field>
          <Field label="Gender">
            <select
              value={form.gender}
              onChange={(e) => update("gender", e.target.value)}
              className={inputCls}
            >
              <option value="boys">Boys Only</option>
              <option value="girls">Girls Only</option>
              <option value="coed">Co-ed</option>
              <option value="unisex">Unisex</option>
            </select>
          </Field>
        </div>

        <Field label="Property location *">
          <div className="flex flex-col gap-3">
            <div className="h-56 overflow-hidden rounded-xl border border-surface-high">
              <MapContainer center={[Number(form.latitude) || CAMPUS_LOCATION.lat, Number(form.longitude) || CAMPUS_LOCATION.lng]} zoom={14} className="h-full w-full">
                <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapCenter latitude={form.latitude} longitude={form.longitude} />
                <LocationClickHandler onSelect={(lat, lng) => void setLocation(lat, lng)} />
                {form.latitude && form.longitude && <CircleMarker center={[Number(form.latitude), Number(form.longitude)]} radius={9} pathOptions={{ color: "#2563eb", fillColor: "#2563eb", fillOpacity: 0.8 }} />}
              </MapContainer>
            </div>
            <button type="button" onClick={useCurrentLocation} className="self-start rounded-xl bg-surface-low px-3 py-2 text-xs font-semibold text-secondary">
              <span className="material-symbols-outlined mr-1 align-middle text-[15px]">my_location</span>
              Use current location
            </button>
            <input
              type="text"
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
              placeholder="Select a point on the map or enter an address"
              className={inputCls}
            />
            {form.latitude && form.longitude && <p className="text-[11px] text-on-surface-muted">Location selected. Distance and walking time are calculated from GH Raisoni Pune.</p>}
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Distance from Campus">
            <input type="text" value={form.distance} readOnly placeholder="Select a map location" className={`${inputCls} bg-surface-low`} />
          </Field>
          <Field label="Walk Time">
            <input type="text" value={form.walk_time} readOnly placeholder="Select a map location" className={`${inputCls} bg-surface-low`} />
          </Field>
        </div>

        <Field label="Contact Phone">
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="+91 98765 43210"
            className={inputCls}
          />
          {form.phone && !/^\+?[\d\s-]{7,15}$/.test(form.phone) && (
            <p className="text-xs text-red-600 mt-1">Enter a valid phone number</p>
          )}
        </Field>

        <div className="flex items-center gap-3">
          <input
            id="instant"
            type="checkbox"
            checked={form.instant}
            onChange={(e) => update("instant", e.target.checked)}
            className="w-4 h-4 accent-primary-dark"
          />
          <label
            htmlFor="instant"
            className="text-sm font-medium text-on-surface"
          >
            Instant Confirmation available
          </label>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-white rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
        <h2 className="font-display text-base font-bold text-on-surface">
          Pricing
        </h2>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Starting Price (₹/month) *">
            <input
              type="number"
              value={form.price_from}
              onChange={(e) => update("price_from", e.target.value)}
              placeholder="7500"
              className={inputCls}
            />
          </Field>
          <Field label="Deposit">
            <input
              type="text"
              value={form.deposit}
              onChange={(e) => update("deposit", e.target.value)}
              placeholder="₹10,000 Refundable"
              className={inputCls}
            />
          </Field>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-on-surface-muted">
              Room / Occupancy Tiers
            </span>
            <button
              onClick={addTier}
              className="text-xs font-semibold text-secondary flex items-center gap-0.5"
            >
              <span className="material-symbols-outlined text-[14px]">add</span>{" "}
              Add tier
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {tiers.map((t, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={t.label}
                  onChange={(e) => updateTier(i, "label", e.target.value)}
                  placeholder="Single / Double / Triple"
                  className="flex-1 h-11 px-3 rounded-xl bg-surface-low border border-surface-high text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <input
                  type="number"
                  value={t.price}
                  onChange={(e) => updateTier(i, "price", e.target.value)}
                  placeholder="₹ Price"
                  className="w-28 h-11 px-3 rounded-xl bg-surface-low border border-surface-high text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button
                  onClick={() => removeTier(i)}
                  className="w-9 h-9 rounded-xl bg-red-50 text-red-500 flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    close
                  </span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Amenities */}
      <section className="bg-white rounded-2xl p-5 flex flex-col gap-3 shadow-sm">
        <h2 className="font-display text-base font-bold text-on-surface">
          Amenities
        </h2>
        <div className="flex flex-wrap gap-2">
          {AMENITY_OPTIONS.map((a) => {
            const on = selectedAmenities.includes(a.label)

            return (
              <button
                key={a.label}
                onClick={() => toggleAmenity(a.label)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold border transition-all ${
                  on
                    ? "border-primary bg-surface-low text-secondary"
                    : "border-surface-high bg-white text-on-surface-muted"
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">
                  {a.icon}
                </span>
                {a.label}
              </button>
            )
          })}
        </div>
      </section>

      {/* Images */}
      <section className="bg-white rounded-2xl p-5 flex flex-col gap-3 shadow-sm">
        <h2 className="font-display text-base font-bold text-on-surface">
          Images
        </h2>
        <p className="text-xs text-on-surface-muted">
          Paste public image URLs (Unsplash, Google Drive, etc.)
        </p>
        {imageUrls.map((url, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input
              type="url"
              value={url}
              onChange={(e) => {
                const next = [...imageUrls]

                next[i] = e.target.value

                setImageUrls(next)
              }}
              placeholder={`Image URL ${i + 1}`}
              className="flex-1 h-11 px-3 rounded-xl bg-surface-low border border-surface-high text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            {url && (
              <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0">
                <img
                  src={url}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              </div>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => setImageUrls((prev) => [...prev, ""])}
          className="self-start text-xs font-semibold text-secondary flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[15px]">add</span>
          Add image
        </button>
      </section>

      {/* Save */}
      <div className="flex gap-3 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex-1 h-12 rounded-xl border border-surface-high text-sm font-semibold text-on-surface-muted"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !form.name || !form.price_from}
          className="flex-1 h-12 rounded-xl bg-primary-dark text-white font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Saving...
            </>
          ) : isEdit ? (
            "Save Changes"
          ) : (
            "Submit Listing"
          )}
        </button>
      </div>
    </div>
  )
}
