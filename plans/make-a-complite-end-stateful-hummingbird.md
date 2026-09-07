# Plan: Stayable — Complete End-to-End Student Accommodation App

## Context

The user attached the Stayable logo SVG (brand: blue `#2563EB` + dark `#0F172A`) alongside a fully designed HTML reference — a mobile-first Indian student accommodation finder built around MIT-WPU Pune. The reference shows two screens: an Explore listing page and an interactive Map view. The task is to port this into a complete, stateful React + Vite + Tailwind v4 app with all 5 navigation tabs working end-to-end.

---

## Design tokens & fonts

Add to `src/index.css` (before all other CSS):

```css
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap');
```

Define Tailwind v4 theme tokens in `src/index.css` `@theme` block:

```
--color-primary: #2563EB          (Stayable blue)
--color-primary-dark: #0F172A     (rent-accent / dark navy)
--color-surface: #f8f9ff
--color-surface-low: #eff4ff
--color-surface-mid: #e5eeff
--color-surface-high: #dce9ff
--color-surface-highest: #d3e4fe
--color-surface-white: #ffffff
--color-on-surface: #0b1c30
--color-on-surface-muted: #45464d
--color-verified: #059669
--color-whatsapp: #25D366
--color-secondary: #0051d5
--color-slate: #1E293B
--font-display: "Plus Jakarta Sans", sans-serif
--font-body: "Inter", sans-serif
```

---

## File structure

```
src/
  App.tsx                     — root: view state + bottom nav
  index.css                   — font imports + Tailwind v4 + theme tokens
  data/
    listings.ts               — mock listings (PGs + Flats) with Unsplash URLs
    enquiries.ts              — mock enquiries
  components/
    Header.tsx                — fixed top bar: logo + campus selector + avatar
    BottomNav.tsx             — 5-tab fixed bottom bar (Explore/Saved/QR/Enquiries/Profile)
    ExplorePage.tsx           — segmented PGs/Flats feed + filter chips + list
    MapPage.tsx               — SVG campus map + price pins + docked card
    DetailPage.tsx            — full listing detail: gallery strip, amenities, pricing tiers, CTA bar
    SavedPage.tsx             — saved bookmarks grid with empty state
    EnquiriesPage.tsx         — list of sent enquiries with status badges
    ProfilePage.tsx           — user card + college info + settings items
    ListingCard.tsx           — shared card for Explore + Saved
    FilterChips.tsx           — horizontal-scroll filter chips with active state
    StayableLogo.tsx          — inline SVG logo component
```

---

## Key state

In `App.tsx`:
- `activeTab: 'explore' | 'saved' | 'qr' | 'enquiries' | 'profile'`
- `activeView: 'list' | 'map' | 'detail'` (inside Explore)
- `selectedListingId: string | null`
- `savedIds: Set<string>` (bookmark toggle)
- `activeSegment: 'pgs' | 'flats'`
- `activeFilters: string[]`

---

## Screens

### 1. Explore (list) — default
- Campus context banner (MIT-WPU • verified • QR scanned)
- PGs / Flats segment toggle
- Filter chips: All Budgets, < ₹8k, Single Room, Double Sharing, Food Included, AC, Walking
- Section meta: "Showing N accommodations • Zero Brokerage"
- Feed of `<ListingCard>` components
- Floating "Map View" pill at bottom

### 2. Map view
- SVG Pune/Kothrud map with campus polygon
- Animated price pins for each listing
- Walking-route dashed line for selected listing
- Docked bottom card for the active pin
- "List View" pill switcher at top

### 3. Detail page
- Back button → returns to list
- Image gallery strip (4 Unsplash photos, horizontal scroll)
- Badges: distance, occupancy type, verified host, instant confirmation
- Price tiers grid (Triple / Double / Single)
- Amenities chips grid
- Landlord profile row with verified badge
- Sticky action bar: WhatsApp + Call + Schedule Visit

### 4. Saved
- Bookmarked listings as compact cards
- Empty state when nothing saved

### 5. Enquiries
- List of 3 sample enquiries with status (Replied / Pending / Scheduled)
- Quick re-contact via WhatsApp button

### 6. Profile
- Student avatar + name + college
- Stats: PGs viewed, Saved, Enquiries sent
- Settings rows: Notifications, Help & Support, About Stayable, Logout

---

## Mock data (src/data/listings.ts)

6 listings total (4 PGs + 2 Flats) with:
- id, name, type, gender, distance, walkTime, priceFrom
- tiers: [{label, price}]
- amenities: [{icon, label}]
- badge: string
- rating, reviewCount
- instant: boolean
- images: Unsplash URLs (w=800&h=500&fit=crop)
- phone, waMessage
- lat/lng (pixel coords for SVG map)

Unsplash images to use:
- Room 1: `photo-1702295297205-700e205030d0` (neat bed room)
- Room 2: `photo-1628827365572-59aed2ca044c` (warm bedroom)
- Room 3: `photo-1629737273704-5c96a46f63e6` (bright sofa room)
- Room 4: `photo-1785402231092-859d0a6c4397` (modern living room)
- Room 5: `photo-1555930112-0159bcdc3fe5` (laptop study setup)
- Room 6: `photo-1627460751404-bb10f9c23dcf` (glass door room)

---

## Implementation notes

- No react-router; navigation is pure `useState` for simplicity
- Material Symbols via `<span className="material-symbols-outlined">icon_name</span>` — load via Google Fonts CSS
- Logo: `StayableLogo.tsx` renders the SVG inline (from the attachment)
- Save toggle: clicking heart on any card updates `savedIds` in App state, passed down as props
- Map pins are absolutely positioned over the SVG using `left` / `top` percentages
- WhatsApp links open in new tab: `https://wa.me/91XXXXXXXXXX?text=...`
- Phone links: `href="tel:+91..."`
- Scrollbar hidden globally: `[&::-webkit-scrollbar]{display:none}` in `index.css`
- All text avoids unescaped apostrophes; use HTML entities or double-quoted JSX strings

---

## Verification

After implementing:
1. All 5 bottom-nav tabs render distinct content
2. PG/Flat toggle changes the listing count and content
3. Filter chips toggle their active styling
4. Heart/bookmark icon toggles saved state and Saved tab reflects it
5. "View Details" and map pin tap opens DetailPage with the correct listing
6. Back arrow returns to list view
7. WhatsApp and Call links have correct `href` attributes
