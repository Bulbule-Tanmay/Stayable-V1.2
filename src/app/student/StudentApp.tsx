import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Header from "../../components/Header";
import MapPage from "../../components/MapPage";
import DetailPage from "../../components/DetailPage";
import ProfilePage from "../../components/ProfilePage";
import BottomNav from "../../components/BottomNav";
import SavedPage from "../../components/SavedPage";
import EnquiriesPage from "../../components/EnquiriesPage";
import { createEnquiry, getListings, getStudentEnquiries } from "../../lib/api";
import { useAuth } from "../AuthContext";
import { listings as staticListings } from "../../data/listings";

type AppView = "college-select" | "pg-list" | "pg-map" | "pg-detail" | "flats" | "saved" | "profile" | "enquiries";

const COLLEGES = [
  { abbr: "MI", name: "MIT World Peace University", location: "Kothrud, Pune", pgs: 47, lat: 18.5204, lng: 73.8567 },
  { abbr: "CO", name: "COEP Technological University", location: "Shivajinagar, Pune", pgs: 63, lat: 18.5310, lng: 73.8487 },
  { abbr: "Fe", name: "Fergusson College", location: "Shivajinagar, Pune", pgs: 55, lat: 18.5196, lng: 73.8453 },
  { abbr: "SP", name: "Savitribai Phule Pune University", location: "Ganeshkhind, Pune", pgs: 72, lat: 18.5590, lng: 73.8076 },
  { abbr: "Sy", name: "Symbiosis International University", location: "Lavale, Pune", pgs: 38, lat: 18.5195, lng: 73.7257 },
  { abbr: "PI", name: "Pune Institute of Computer Technology", location: "Dhankawadi, Pune", pgs: 41, lat: 18.4574, lng: 73.8516 },
  { abbr: "DY", name: "DY Patil College of Engineering", location: "Pimpri, Pune", pgs: 29, lat: 18.6524, lng: 73.8009 },
  { abbr: "BV", name: "Bharati Vidyapeeth University", location: "Dhankawadi, Pune", pgs: 33, lat: 18.4574, lng: 73.8516 },
  { abbr: "VI", name: "Vishwakarma Institute of Technology", location: "Bibwewadi, Pune", pgs: 25, lat: 18.4735, lng: 73.8622 },
  { abbr: "II", name: "IIIT Pune", location: "Pune, Pune", pgs: 18, lat: 18.5732, lng: 73.9814 },
];

const GH_RAISONI = { name: "GH Raisoni Pune Campus", lat: 18.5732358, lng: 73.9814749 };

const POPULAR_COLLEGES = COLLEGES.slice(3, 7);

const SAVED_KEY = "stayable_saved";

export default function StudentApp() {
  const navigate = useNavigate();
  const [view, setView] = useState<AppView>("college-select");
  const [selectedCollege, setSelectedCollege] = useState(COLLEGES[0]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(SAVED_KEY);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [segment, setSegment] = useState<"pgs" | "flats">("pgs");
  const [enquiredIds, setEnquiredIds] = useState<string[]>([]);
  const [dbListings, setDbListings] = useState<any[] | null>(null);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [collegeSearch, setCollegeSearch] = useState("");
  const [pgSearch, setPgSearch] = useState("");
  const [mapOrList, setMapOrList] = useState<"map" | "list">("map");
  const [recentColleges, setRecentColleges] = useState<typeof COLLEGES>([]);
  const [error, setError] = useState<string | null>(null);
  const [bhkFilter, setBhkFilter] = useState<string>("All");
  const { user, profile } = useAuth();

  useEffect(() => {
    getListings()
      .then((data) => setDbListings(data && data.length > 0 ? data : null))
      .catch(() => { setDbListings(null); setError("Could not load live listings. Showing demo data."); });
  }, []);

  useEffect(() => {
    if (!user) { setEnquiries([]); return; }
    getStudentEnquiries().then(setEnquiries).catch(() => setEnquiries([]));
  }, [user]);

  // Persist saved to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify([...savedIds]));
    } catch { /* ignore */ }
  }, [savedIds]);

  const activeListings = (dbListings ?? staticListings) as any[];

  const toggleSave = (id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleEnquire = async (id: string) => {
    const listing = activeListings.find((item) => item.id === id);
    if (!listing) return;
    try {
      const enquiry = await createEnquiry({
        listing_id: id,
        student_name: profile?.full_name ?? user?.email ?? "Student",
        student_phone: profile?.phone ?? "Not provided",
        message: "I am interested in scheduling a visit.",
      });
      setEnquiries((prev) => [enquiry, ...prev.filter((item) => item.id !== enquiry.id)]);
      setEnquiredIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    } catch { /* silent */ }
  };

  const handleSelectCollege = (college: typeof COLLEGES[0]) => {
    setSelectedCollege(college);
    setView("pg-list");
    setMapOrList("map");
    setRecentColleges((prev) => {
      const filtered = prev.filter((c) => c.abbr !== college.abbr);
      return [college, ...filtered].slice(0, 3);
    });
  };

  const filteredColleges = COLLEGES.filter((c) =>
    !collegeSearch || c.name.toLowerCase().includes(collegeSearch.toLowerCase())
  );

  const pgListings = activeListings.filter((l: any) => l.type === "pg");
  const flatListings = activeListings.filter((l: any) => l.type === "flat");

  const filteredFlatListings = bhkFilter === "All"
    ? flatListings
    : flatListings.filter((f: any) =>
        (f.name ?? "").toLowerCase().includes(bhkFilter.toLowerCase()) ||
        (f.badge ?? "").toLowerCase().includes(bhkFilter.toLowerCase())
      );

  const campusProp = { name: selectedCollege.name, lat: selectedCollege.lat ?? GH_RAISONI.lat, lng: selectedCollege.lng ?? GH_RAISONI.lng };

  const bottomNavHandler = (tab: "explore" | "saved" | "qr" | "enquiries" | "profile") => {
    if (tab === "explore") setView("college-select");
    else if (tab === "saved") setView("saved");
    else if (tab === "qr") alert("Coming soon!");
    else if (tab === "enquiries") setView("enquiries");
    else if (tab === "profile") setView("profile");
  };

  const activeBottomTab = (() => {
    if (view === "college-select" || view === "pg-list" || view === "pg-map" || view === "pg-detail") return "explore";
    if (view === "saved") return "saved";
    if (view === "enquiries") return "enquiries";
    if (view === "profile") return "profile";
    if (view === "flats") return "explore";
    return "explore";
  })() as "explore" | "saved" | "qr" | "enquiries" | "profile";

  // ── COLLEGE SELECT ──
  if (view === "college-select") {
    return (
      <div className="min-h-screen bg-white pt-16">
        <Header
          activeSegment={segment}
          onSegmentChange={(s) => { setSegment(s); if (s === "flats") setView("flats"); }}
          savedCount={savedIds.size}
          onSavedClick={() => setView("saved")}
          onCampusChange={() => {}}
        />
        <div className="max-w-xl mx-auto px-4 py-4 pb-24">
          {error && (
            <div className="mb-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 font-medium">
              {error}
            </div>
          )}
          {/* Search bar */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-xl">
              <span className="material-symbols-outlined text-gray-400 text-[18px]">search</span>
              <input
                value={collegeSearch}
                onChange={(e) => setCollegeSearch(e.target.value)}
                placeholder="Search college..."
                className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400"
              />
            </div>
          </div>

          <h1 className="font-display text-xl font-extrabold text-on-surface mb-5">Select Your College</h1>

          {!collegeSearch && (
            <>
              {/* Recently Viewed */}
              {recentColleges.length > 0 && (
                <div className="mb-6">
                  <p className="text-xs font-bold text-gray-400 tracking-widest mb-3">RECENTLY VIEWED</p>
                  <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                    {recentColleges.map((c, i) => (
                      <button
                        key={c.abbr}
                        onClick={() => handleSelectCollege(c)}
                        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left ${i < recentColleges.length - 1 ? "border-b border-gray-100" : ""}`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-surface-mid flex items-center justify-center text-xs font-extrabold text-primary flex-shrink-0">{c.abbr}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-on-surface truncate">{c.name}</div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <span className="material-symbols-outlined text-[11px]">location_on</span>
                            <span className="text-primary font-medium">{c.location.split(",")[0]}</span>,&nbsp;{c.location.split(",")[1]}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-right">
                          <span className="text-sm font-bold text-primary">{c.pgs} PGs</span>
                          <span className="material-symbols-outlined text-gray-400 text-[18px]">chevron_right</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Colleges */}
              <div className="mb-6">
                <p className="text-xs font-bold text-gray-400 tracking-widest mb-3">POPULAR COLLEGES</p>
                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                  {POPULAR_COLLEGES.map((c, i) => (
                    <button
                      key={c.abbr}
                      onClick={() => handleSelectCollege(c)}
                      className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left ${i < POPULAR_COLLEGES.length - 1 ? "border-b border-gray-100" : ""}`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-surface-mid flex items-center justify-center text-xs font-extrabold text-primary flex-shrink-0">{c.abbr}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-on-surface truncate">{c.name}</div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <span className="material-symbols-outlined text-[11px]">location_on</span>
                          <span className="text-primary font-medium">{c.location.split(",")[0]}</span>,&nbsp;{c.location.split(",")[1]}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-bold text-primary">{c.pgs} PGs</span>
                        <span className="material-symbols-outlined text-gray-400 text-[18px]">chevron_right</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* All Colleges */}
          <div>
            <p className="text-xs font-bold text-gray-400 tracking-widest mb-3">ALL COLLEGES</p>
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
              {filteredColleges.map((c, i) => (
                <button
                  key={c.abbr}
                  onClick={() => handleSelectCollege(c)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left ${i < filteredColleges.length - 1 ? "border-b border-gray-100" : ""}`}
                >
                  <div className="w-10 h-10 rounded-xl bg-surface-mid flex items-center justify-center text-xs font-extrabold text-primary flex-shrink-0">{c.abbr}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-on-surface truncate">{c.name}</div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <span className="material-symbols-outlined text-[11px]">location_on</span>
                      <span className="text-primary font-medium">{c.location.split(",")[0]}</span>,&nbsp;{c.location.split(",")[1]}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-bold text-primary">{c.pgs} PGs</span>
                    <span className="material-symbols-outlined text-gray-400 text-[18px]">chevron_right</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
        <BottomNav active={activeBottomTab} onChange={bottomNavHandler} savedCount={savedIds.size} enquiryCount={enquiries.length} />
      </div>
    );
  }

  // ── PG LIST + MAP ──
  if (view === "pg-list") {
    const isMapView = mapOrList === "map";
    if (isMapView) {
      return (
        <div className="min-h-screen bg-white flex flex-col">
          <Header
            activeSegment="pgs"
            onSegmentChange={(s) => { setSegment(s); if (s === "flats") setView("flats"); }}
            savedCount={savedIds.size}
            onSavedClick={() => setView("saved")}
          />
          <div className="pt-16 flex-1 flex flex-col">
            {/* Top bar with back + college + filters + toggle */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-white">
              <button onClick={() => setView("college-select")} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
                <span className="material-symbols-outlined text-[20px] text-gray-600">arrow_back</span>
              </button>
              <div className="flex-1 flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl">
                <span className="material-symbols-outlined text-primary text-[18px]">school</span>
                <span className="text-sm font-semibold text-on-surface">{selectedCollege.name}</span>
              </div>
              <button onClick={() => alert("Filters coming soon!")} className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-xl">
                <span className="material-symbols-outlined text-[20px] text-gray-600">tune</span>
              </button>
              <div className="flex border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setMapOrList("map")}
                  className={`px-3 py-2 text-xs font-semibold ${isMapView ? "bg-on-surface text-white" : "text-gray-600"}`}
                >
                  Map
                </button>
                <button
                  onClick={() => setMapOrList("list")}
                  className={`px-3 py-2 text-xs font-semibold ${!isMapView ? "bg-on-surface text-white" : "text-gray-600"}`}
                >
                  List
                </button>
              </div>
            </div>

            {/* Split layout: hide list on mobile, show map */}
            <div className="flex flex-1 overflow-hidden">
              {/* Left: PG cards (hidden on mobile) */}
              <div className="hidden md:flex w-[340px] flex-shrink-0 flex-col border-r border-gray-100 overflow-y-auto">
                <div className="p-3 border-b border-gray-100">
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-xl">
                    <span className="material-symbols-outlined text-gray-400 text-[18px]">search</span>
                    <input
                      value={pgSearch}
                      onChange={(e) => setPgSearch(e.target.value)}
                      placeholder="Search PGs..."
                      className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{pgListings.length} PGs near {selectedCollege.name.split(" ")[0]}</p>
                </div>
                <div className="flex flex-col gap-0 overflow-y-auto">
                  {pgListings.map((listing: any) => (
                    <div key={listing.id} className="border-b border-gray-100 bg-white">
                      <div className="relative">
                        <img
                          src={(listing.images ?? [])[0] ?? ""}
                          alt={listing.name}
                          className="w-full h-40 object-cover"
                        />
                        <div className="absolute top-2 left-2 flex gap-1">
                          <span className="px-2 py-0.5 rounded-full bg-green-500 text-white text-[10px] font-bold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[10px]">verified</span> Verified
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-blue-500 text-white text-[10px] font-bold">{listing.genderLabel ?? "Boys"}</span>
                        </div>
                        <button
                          onClick={() => toggleSave(listing.id)}
                          className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow"
                        >
                          <span className="material-symbols-outlined text-[16px] text-gray-500" style={{ fontVariationSettings: savedIds.has(listing.id) ? "'FILL' 1" : "'FILL' 0", color: savedIds.has(listing.id) ? "#ef4444" : undefined }}>favorite</span>
                        </button>
                        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-green-600 text-white text-[10px] font-bold">
                          {listing.tiers?.length ?? 3} rooms available
                        </div>
                      </div>
                      <div className="p-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-semibold text-sm text-on-surface">{listing.name}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{listing.address ?? listing.distance}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-display text-sm font-extrabold text-primary">₹{Number(listing.priceFrom ?? listing.price_from ?? 0).toLocaleString("en-IN")}</div>
                            <div className="text-[10px] text-gray-400">/ month</div>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => { setSelectedId(listing.id); setView("pg-detail"); }}
                            className="flex-1 py-2 rounded-full bg-primary text-white text-xs font-bold"
                          >
                            View Details
                          </button>
                          <button onClick={() => alert("Compare feature coming soon!")} className="px-4 py-2 rounded-full border border-gray-200 text-xs font-semibold text-gray-600">
                            Compare
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Map (full on mobile) */}
              <div className="flex-1 overflow-hidden">
                <MapPage
                  savedIds={savedIds}
                  onSaveToggle={toggleSave}
                  onViewDetails={(id) => { setSelectedId(id); setView("pg-detail"); }}
                  onListView={() => setMapOrList("list")}
                  listings={pgListings}
                  campus={campusProp}
                />
              </div>
            </div>
          </div>
          <BottomNav active={activeBottomTab} onChange={bottomNavHandler} savedCount={savedIds.size} enquiryCount={enquiries.length} />
        </div>
      );
    }

    // List view
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header
          activeSegment="pgs"
          onSegmentChange={(s) => { setSegment(s); if (s === "flats") setView("flats"); }}
          savedCount={savedIds.size}
          onSavedClick={() => setView("saved")}
        />
        <div className="pt-16 pb-24">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-white">
            <button onClick={() => setView("college-select")} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
              <span className="material-symbols-outlined text-[20px] text-gray-600">arrow_back</span>
            </button>
            <div className="flex-1 flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl">
              <span className="material-symbols-outlined text-primary text-[18px]">school</span>
              <span className="text-sm font-semibold text-on-surface">{selectedCollege.name}</span>
            </div>
            <button onClick={() => alert("Filters coming soon!")} className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-xl">
              <span className="material-symbols-outlined text-[20px] text-gray-600">tune</span>
            </button>
            <div className="flex border border-gray-200 rounded-xl overflow-hidden">
              <button onClick={() => setMapOrList("map")} className={`px-3 py-2 text-xs font-semibold ${isMapView ? "bg-on-surface text-white" : "text-gray-600"}`}>Map</button>
              <button onClick={() => setMapOrList("list")} className={`px-3 py-2 text-xs font-semibold ${!isMapView ? "bg-on-surface text-white" : "text-gray-600"}`}>List</button>
            </div>
          </div>
          <div className="px-4 py-4 flex flex-col gap-4 max-w-2xl mx-auto">
            {pgListings.map((listing: any) => (
              <div key={listing.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <img src={(listing.images ?? [])[0] ?? ""} alt={listing.name} className="w-full h-48 object-cover" />
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="font-display text-base font-bold text-on-surface">{listing.name}</div>
                    <div className="font-display text-base font-extrabold text-primary">₹{Number(listing.priceFrom ?? listing.price_from ?? 0).toLocaleString("en-IN")}<span className="text-xs font-normal text-gray-400">/mo</span></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{listing.distance}</p>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => { setSelectedId(listing.id); setView("pg-detail"); }} className="flex-1 py-2.5 bg-primary text-white text-sm font-bold rounded-xl">View Details</button>
                    <button onClick={() => alert("Compare feature coming soon!")} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600">Compare</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <BottomNav active={activeBottomTab} onChange={bottomNavHandler} savedCount={savedIds.size} enquiryCount={enquiries.length} />
      </div>
    );
  }

  // ── PG DETAIL ──
  if (view === "pg-detail" && selectedId) {
    return (
      <div className="min-h-screen bg-white">
        <Header activeSegment="pgs" savedCount={savedIds.size} />
        <div className="pt-16">
          <DetailPage
            listingId={selectedId}
            isSaved={savedIds.has(selectedId)}
            onSaveToggle={toggleSave}
            onBack={() => setView("pg-list")}
            onEnquire={handleEnquire}
            listings={activeListings}
            collegeName={selectedCollege.name}
          />
        </div>
      </div>
    );
  }

  // ── SAVED ──
  if (view === "saved") {
    return (
      <div className="min-h-screen bg-white">
        <Header activeSegment={segment} savedCount={savedIds.size} onSavedClick={() => setView("saved")} />
        <div className="pt-16">
          <SavedPage
            savedIds={savedIds}
            onSaveToggle={toggleSave}
            onViewDetails={(id) => { setSelectedId(id); setView("pg-detail"); }}
            listings={activeListings}
          />
        </div>
        <BottomNav active="saved" onChange={bottomNavHandler} savedCount={savedIds.size} enquiryCount={enquiries.length} />
      </div>
    );
  }

  // ── ENQUIRIES ──
  if (view === "enquiries") {
    return (
      <div className="min-h-screen bg-white">
        <Header activeSegment={segment} savedCount={savedIds.size} onSavedClick={() => setView("saved")} />
        <div className="pt-16">
          <EnquiriesPage
            onViewDetails={(id) => { setSelectedId(id); setView("pg-detail"); }}
            enquiries={enquiries}
            extraIds={enquiredIds}
            listings={activeListings}
          />
        </div>
        <BottomNav active="enquiries" onChange={bottomNavHandler} savedCount={savedIds.size} enquiryCount={enquiries.length} />
      </div>
    );
  }

  // ── FLATS ──
  if (view === "flats") {
    const flatBhkTypes = ["All", "Studio", "1 BHK", "2 BHK", "3 BHK", "4 BHK"];
    return (
      <div className="min-h-screen bg-white">
        <Header activeSegment="flats" onSegmentChange={(s) => { setSegment(s); if (s === "pgs") setView("college-select"); }} savedCount={savedIds.size} />
        <div className="pt-16 pb-24">
          {/* Green header */}
          <div className="bg-teal-600 px-6 py-8 text-white">
            <div className="flex items-center gap-2 mb-2 text-teal-200 text-sm font-medium">
              <span className="material-symbols-outlined text-[16px]">apartment</span>
              Pune Flat Finder
            </div>
            <h1 className="font-display text-2xl font-extrabold mb-1">Find Flats Near<br />Your College</h1>
            <p className="text-teal-100 text-sm mb-4">Discover flats and apartments near your college.</p>
            <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl">
              <span className="material-symbols-outlined text-gray-400 text-[18px]">search</span>
              <input placeholder="Search flats, areas..." className="flex-1 text-sm text-gray-700 outline-none placeholder-gray-400" />
            </div>
          </div>

          <div className="px-4 py-3 bg-white border-b border-gray-100 flex items-center justify-between">
            <p className="text-sm font-semibold text-on-surface">{filteredFlatListings.length} flats found</p>
            <div className="flex gap-2">
              <button className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600">
                <span className="material-symbols-outlined text-[14px]">map</span> Map View
              </button>
              <button onClick={() => alert("Filters coming soon!")} className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600">
                <span className="material-symbols-outlined text-[14px]">tune</span> Filters
              </button>
            </div>
          </div>

          {/* BHK type filter */}
          <div className="px-4 py-2 flex gap-2 overflow-x-auto bg-white border-b border-gray-100">
            {flatBhkTypes.map((t) => (
              <button
                key={t}
                onClick={() => setBhkFilter(t)}
                className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold ${bhkFilter === t ? "bg-gray-800 text-white" : "border border-gray-200 text-gray-600"}`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Flat grid */}
          <div className="grid grid-cols-2 gap-3 p-4">
            {filteredFlatListings.length > 0 ? filteredFlatListings.map((flat: any) => (
              <div key={flat.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <div className="relative">
                  <img src={(flat.images ?? [])[0] ?? ""} alt={flat.name} className="w-full h-36 object-cover" />
                  <div className="absolute top-2 left-2">
                    <span className="px-1.5 py-0.5 rounded-full bg-green-500 text-white text-[9px] font-bold">Verified</span>
                  </div>
                  <button onClick={() => toggleSave(flat.id)} className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow">
                    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: savedIds.has(flat.id) ? "'FILL' 1" : "'FILL' 0", color: savedIds.has(flat.id) ? "#ef4444" : "#9ca3af" }}>favorite</span>
                  </button>
                </div>
                <div className="p-2.5">
                  <div className="text-xs font-bold text-on-surface truncate">{flat.name}</div>
                  <div className="text-[10px] text-gray-500 truncate">{flat.distance}</div>
                  <div className="text-xs font-extrabold text-teal-600 mt-1">₹{Number(flat.priceFrom ?? flat.price_from ?? 0).toLocaleString("en-IN")}<span className="font-normal text-gray-400">/mo</span></div>
                  <div className="flex gap-1 mt-2">
                    <button onClick={() => { setSelectedId(flat.id); setView("pg-detail"); }} className="flex-1 py-1.5 bg-teal-600 text-white text-[10px] font-bold rounded-lg">View Details</button>
                    <button onClick={() => alert("Compare feature coming soon!")} className="px-2 py-1.5 border border-gray-200 text-[10px] font-semibold text-gray-600 rounded-lg">Compare</button>
                  </div>
                </div>
              </div>
            )) : (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-2xl h-52 animate-pulse" />
              ))
            )}
          </div>

          {/* CTA */}
          <div className="mx-4 mb-8 rounded-2xl bg-teal-600 p-6 text-center text-white">
            <span className="material-symbols-outlined text-[32px] mb-2 block">apartment</span>
            <div className="font-display text-base font-extrabold mb-1">List Your Flat</div>
            <p className="text-teal-100 text-xs mb-4">Own a flat near campus? Reach thousands of students.</p>
            <button className="px-5 py-2 border-2 border-white rounded-full text-sm font-bold">List on Stayable</button>
          </div>
        </div>
        <BottomNav active={activeBottomTab} onChange={bottomNavHandler} savedCount={savedIds.size} enquiryCount={enquiries.length} />
      </div>
    );
  }

  // ── PROFILE ──
  if (view === "profile") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header activeSegment={segment} savedCount={savedIds.size} onSavedClick={() => setView("saved")} />
        <div className="pt-16">
          <ProfilePage
            savedCount={savedIds.size}
            enquiryCount={enquiredIds.length}
            onOwnerPortal={() => navigate("/owner")}
            onSavedClick={() => setView("saved")}
            onEnquiriesClick={() => setView("enquiries")}
            listings={activeListings}
            savedIds={savedIds}
          />
        </div>
        <BottomNav active="profile" onChange={bottomNavHandler} savedCount={savedIds.size} enquiryCount={enquiries.length} />
      </div>
    );
  }

  return null;
}
