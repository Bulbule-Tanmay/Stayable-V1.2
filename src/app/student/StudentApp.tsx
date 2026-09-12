import { useState, useEffect } from "react"

import { useNavigate } from "react-router"

import Header from "../../components/Header"

import BottomNav from "../../components/BottomNav"

import ExplorePage from "../../components/ExplorePage"

import MapPage from "../../components/MapPage"

import DetailPage from "../../components/DetailPage"

import SavedPage from "../../components/SavedPage"

import EnquiriesPage from "../../components/EnquiriesPage"

import ProfilePage from "../../components/ProfilePage"

import { createEnquiry, getListings, getStudentEnquiries } from "../../lib/api"

import { useAuth } from "../AuthContext"

type Tab = "explore" | "saved" | "qr" | "enquiries" | "profile"

type ExploreView = "list" | "map" | "detail"

export default function StudentApp() {
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState<Tab>("explore")

  const [exploreView, setExploreView] = useState<ExploreView>("list")

  const [selectedId, setSelectedId] = useState<string | null>(null)

  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())

  const [segment, setSegment] = useState<"pgs" | "flats">("pgs")

  const [filters, setFilters] = useState<string[]>([])

  const [enquiredIds, setEnquiredIds] = useState<string[]>([])

  const [showQrModal, setShowQrModal] = useState(false)

  const [dbListings, setDbListings] = useState<any[] | null>(null)

  const [loadingListings, setLoadingListings] = useState(true)

  const [enquiries, setEnquiries] = useState<any[]>([])

  const [campusIndex, setCampusIndex] = useState(0)

  const { user, profile } = useAuth()

  const campuses = ["GH Raisoni Pune", "Symbiosis Pune", "VIT Pune"]

  const changeCampus = () =>
    setCampusIndex((index) => (index + 1) % campuses.length)

  useEffect(() => {
    getListings()

      .then((data) => setDbListings(data && data.length > 0 ? data : null))

      .catch(() => setDbListings(null))

      .finally(() => setLoadingListings(false))
  }, [])

  useEffect(() => {
    getStudentEnquiries()
      .then(setEnquiries)
      .catch(() => setEnquiries([]))
  }, [user])

  const activeListings = dbListings ?? []

  const toggleSave = (id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev)

      next.has(id) ? next.delete(id) : next.add(id)

      return next
    })
  }

  const handleViewDetails = (id: string) => {
    setSelectedId(id)

    setExploreView("detail")

    setActiveTab("explore")
  }

  const handleEnquire = async (id: string) => {
    const listing = activeListings.find((item) => item.id === id)

    if (!listing) return

    try {
      const enquiry = await createEnquiry({
        listing_id: id,

        student_name: profile?.full_name ?? user?.email ?? "Student",

        student_phone: profile?.phone ?? "Not provided",

        message: "I am interested in scheduling a visit.",
      })

      setEnquiries((prev) => [
        enquiry,
        ...prev.filter((item) => item.id !== enquiry.id),
      ])

      setEnquiredIds((prev) => (prev.includes(id) ? prev : [...prev, id]))

      setActiveTab("enquiries")
    } catch {
      setActiveTab("enquiries")
    }
  }

  const handleTabChange = (tab: Tab) => {
    if (tab === "qr") {
      setShowQrModal(true)
      return
    }

    setActiveTab(tab)

    if (tab === "explore" && exploreView === "detail") setExploreView("list")
  }

  const isDetail = activeTab === "explore" && exploreView === "detail"

  const renderMain = () => {
    if (activeTab === "saved")
      return (
        <SavedPage
          savedIds={savedIds}
          onSaveToggle={toggleSave}
          onViewDetails={handleViewDetails}
          listings={activeListings}
        />
      )

    if (activeTab === "enquiries")
      return (
        <EnquiriesPage
          onViewDetails={handleViewDetails}
          enquiries={enquiries}
          extraIds={enquiredIds}
          listings={activeListings}
        />
      )

    if (activeTab === "profile")
      return (
        <ProfilePage
          savedCount={savedIds.size}
          enquiryCount={enquiredIds.length}
          onOwnerPortal={() => navigate("/owner")}
        />
      )

    if (exploreView === "detail" && selectedId)
      return (
        <DetailPage
          listingId={selectedId}
          isSaved={savedIds.has(selectedId)}
          onSaveToggle={toggleSave}
          onBack={() => setExploreView("list")}
          onEnquire={handleEnquire}
          listings={activeListings}
        />
      )

    if (exploreView === "map")
      return (
        <MapPage
          savedIds={savedIds}
          onSaveToggle={toggleSave}
          onViewDetails={handleViewDetails}
          onListView={() => setExploreView("list")}
          listings={activeListings}
        />
      )

    return (
      <ExplorePage
        segment={segment}
        onSegmentChange={setSegment}
        filters={filters}
        onFiltersChange={setFilters}
        savedIds={savedIds}
        onSaveToggle={toggleSave}
        onViewDetails={handleViewDetails}
        onMapView={() => setExploreView("map")}
        listings={activeListings}
        loading={loadingListings}
        campus={campuses[campusIndex]}
        onCampusChange={changeCampus}
      />
    )
  }

  const isMapView = activeTab === "explore" && exploreView === "map"

  return (
    <div
      className={`min-h-screen bg-surface flex flex-col relative mx-auto w-full ${
        isMapView ? "max-w-none" : "max-w-lg"
      }`}
    >
      {!isDetail && (
        <Header campus={campuses[campusIndex]} onCampusChange={changeCampus} />
      )}
      <main className={`flex-1 overflow-y-auto ${isDetail ? "pt-0" : "pt-16"}`}>
        {renderMain()}
      </main>
      <BottomNav
        active={activeTab}
        onChange={handleTabChange}
        savedCount={savedIds.size}
        enquiryCount={enquiries.length || enquiredIds.length}
      />

      {showQrModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-end justify-center"
          onClick={() => setShowQrModal(false)}
        >
          <div
            className="bg-white rounded-t-3xl w-full max-w-lg p-8 flex flex-col items-center gap-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1 rounded-full bg-surface-highest" />
            <h3 className="font-display text-xl font-extrabold text-on-surface">
              Scan Campus QR
            </h3>
            <p className="text-sm text-on-surface-muted text-center leading-relaxed">
              Point your camera at any Stayable QR code near your campus gate to
              instantly load verified accommodations in that zone.
            </p>
            <div className="w-48 h-48 rounded-2xl bg-surface-low flex items-center justify-center border-2 border-dashed border-surface-high">
              <span className="material-symbols-outlined text-[80px] text-on-surface-muted">
                qr_code_scanner
              </span>
            </div>
            <button
              onClick={() => setShowQrModal(false)}
              className="w-full h-12 rounded-full bg-primary-dark text-white font-bold text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
