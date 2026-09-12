# Stayable v1.2 — Full-Stack Issue Audit

> Inspected: All frontend, backend (Edge Function), database schema, auth, routing, UI/UX, and security layers.

---

## P0 — Completely Broken

---

### P0-1 · Edge Function has NO actual API routes

**File:** [`supabase/functions/server/index.tsx`](file:///X:/stayable-v1.2/supabase/functions/server/index.tsx)

**Problem:** The server file only registers a `/health` endpoint. There are zero route handlers for `/listings`, `/enquiries`, `/owner/*`, `/admin/*`, `/profile`, or `/subscription/plans`. The frontend makes ~15 distinct API calls — every single one returns a 404.

**Root Cause:** `index.tsx` was scaffolded with only a health check and imports `kv_store.tsx`, but never wired up any business routes. The actual API logic was never written.

**Impact:** The entire app is non-functional. No listings load, no enquiries can be created, no owner/admin data is fetched. Every `req<T>()` call in `src/lib/api.ts` will throw `"Not Found"`.

**Fix:** Implement all API routes in `index.tsx` using Hono, connecting to Supabase via the service role key. Needed routes: `GET /listings`, `GET /listings/:id`, `POST /enquiries`, `GET|POST|PUT|DELETE /owner/listings`, `GET|PUT /owner/enquiries/:id`, `GET /owner/subscription`, `POST /owner/subscription/create-order`, `POST /owner/subscription/verify-payment`, `GET|PUT /profile`, `GET /admin/owners`, `GET|PUT /admin/listings`, `GET /admin/stats`, `GET /subscription/plans`.

---

### P0-2 · Admin route protection has a logic gap — unauthenticated users can visit all admin pages

**File:** [`src/app/admin/AdminLayout.tsx`](file:///X:/stayable-v1.2/src/app/admin/AdminLayout.tsx) L20–24

**Problem:** The guard condition is:
```ts
if (!loading && !isLogin && user && profile && profile.role !== "admin") {
  navigate("/admin");
}
```
This redirects **non-admin authenticated users**, but does **nothing** when `user` is `null`. A logged-out visitor at `/admin/dashboard` is never redirected.

**Root Cause:** Missing `||` branch: `!user` case is not handled.

**Impact:** Any unauthenticated visitor can access `/admin/dashboard`, `/admin/owners`, `/admin/listings` (pages render, data fetching just returns 404 from the broken API — but the UI shell and intent are fully exposed).

**Fix:**
```ts
if (!loading && !isLogin && (!user || !profile || profile.role !== "admin")) {
  navigate("/admin");
}
```

---

### P0-3 · `supabase/functions/server/index.tsx` never exports the Hono app's routes — imports `kv_store` but never uses it

**File:** [`supabase/functions/server/index.tsx`](file:///X:/stayable-v1.2/supabase/functions/server/index.tsx)

**Problem:** `kv_store.tsx` is imported but never called. The app only handles one route. All 404s from the frontend are explained by this.

**Root Cause:** Routes were never implemented; only scaffolding exists.

**Impact:** See P0-1. All data APIs are broken.

**Fix:** Implement routes (see P0-1).

---

### P0-4 · `ProfilePage` — hardcoded user data; `Log Out` button does nothing

**File:** [`src/components/ProfilePage.tsx`](file:///X:/stayable-v1.2/src/components/ProfilePage.tsx)

**Problem:** The profile card hardcodes "Aryan Kumar", "aryan.kumar@mitwpu.edu.in", "MIT-WPU, Pune • 2nd Year CSE". The settings list "Log Out" item is a `<button>` with no `onClick` — tapping it does nothing.

**Root Cause:** `ProfilePage` receives no `user`/`profile` props from `AuthContext`. It was never wired up to auth.

**Impact:** Every logged-in user sees fake data. Sign-out is non-functional from the student app.

**Fix:** Accept `useAuth()` inside `ProfilePage` or pass `profile` as a prop. Call `signOut()` in the logout `onClick`. Display actual `profile.full_name`, `profile.college`, `user.email`.

---

## P1 — Major Functionality Problem

---

### P1-1 · `AuthContext` — `loading` never resets to `false` after `onAuthStateChange` fires (only after initial `getSession`)

**File:** [`src/app/AuthContext.tsx`](file:///X:/stayable-v1.2/src/app/AuthContext.tsx) L55–63

**Problem:** `setLoading(false)` is only called inside the `getSession().then(...)` promise. When `onAuthStateChange` fires (e.g., after OTP verification or sign-in from another tab), `loading` stays `true` indefinitely because `fetchProfile` is called without `.finally(() => setLoading(false))`.

**Root Cause:** `loading` state isn't managed in the auth state change listener.

**Impact:** After OTP sign-in or magic link, `OwnerLayout` and `AdminLayout` guards see `loading === true` and never redirect, leaving users stranded.

**Fix:** Add `setLoading(false)` in the `onAuthStateChange` callback after `fetchProfile` resolves, same as done in `getSession`.

---

### P1-2 · `signUpStudent` uses email+password but the student flow shows no password field for OTP users

**File:** [`src/lib/auth.ts`](file:///X:/stayable-v1.2/src/lib/auth.ts) L3–14 + [`src/app/AuthModal.tsx`](file:///X:/stayable-v1.2/src/app/AuthModal.tsx) L30–52

**Problem:** Students have two auth paths: (a) email+password via `signUpStudent` / `signInWithEmail`, and (b) OTP magic link via `signInStudent`. But `signUpStudent` in `auth.ts` calls `supabase.auth.signUp({ email, password })` and then manually upserts a profile — while the DB trigger in migration 002 *also* fires on `auth.users` insert. This creates a double-upsert race condition, and the profile may be created before the client-side upsert reaches the DB.

**Root Cause:** Two profile-creation paths exist simultaneously: client-side `signUpStudent` AND the `on_auth_user_created` trigger.

**Impact:** Potential profile duplication, silent failures on upsert conflict, inconsistent `role` assignment.

**Fix:** Remove the client-side profile upsert from `signUpStudent` and `signUpOwner`; rely solely on the DB trigger. The trigger reads `raw_user_meta_data` which `signUpOwner` already sets.

---

### P1-3 · `OwnerOnboarding` — error on profile update silently navigates to dashboard instead of showing error

**File:** [`src/app/owner/OwnerOnboarding.tsx`](file:///X:/stayable-v1.2/src/app/owner/OwnerOnboarding.tsx) L47–48

**Problem:**
```ts
} catch {
  navigate("/owner/dashboard"); // silently swallows error
}
```
If `updateProfile` fails (API broken, network issue), the user is sent to the dashboard with an incomplete profile, and the onboarding is considered "done".

**Root Cause:** No error state displayed to the user.

**Impact:** Owner profiles may be permanently incomplete. The catch also catches API errors from the P0 broken backend.

**Fix:** Show an error toast/banner on failure; do not navigate on error.

---

### P1-4 · `OwnerListingForm` — save errors are silently swallowed, navigating away regardless

**File:** [`src/app/owner/OwnerListingForm.tsx`](file:///X:/stayable-v1.2/src/app/owner/OwnerListingForm.tsx) L108–109

**Problem:**
```ts
} catch {
  navigate("/owner/listings"); // same as success path
}
```
Failed creates/updates navigate the same as success. The user has no idea the listing wasn't saved.

**Root Cause:** Copy-paste error handling pattern.

**Impact:** Owner submits a listing, gets a network error, sees "My Listings" — assumes it worked. Listing is lost.

**Fix:** Display inline error message on failure, do not navigate.

---

### P1-5 · `EnquiriesPage` — entirely frontend-only, never submits enquiries to the API

**File:** [`src/components/EnquiriesPage.tsx`](file:///X:/stayable-v1.2/src/components/EnquiriesPage.tsx)

**Problem:** `EnquiriesPage` only renders `extraIds` (a local array of listing IDs the student clicked "Schedule Visit" on). There is no call to `createEnquiry()` from `api.ts`. Student enquiries are purely local state — lost on refresh, not visible to owners.

**Root Cause:** The `createEnquiry` API function was built but never called. The enquiry flow was implemented as a UI demo only.

**Impact:** Owners receive zero enquiries through the platform. The entire enquiry funnel is broken.

**Fix:** When `handleEnquire` is called in `StudentApp.tsx`, call `createEnquiry({ listing_id, student_name, student_phone, message })`. Fetch and display real enquiries from the API in `EnquiriesPage`.

---

### P1-6 · `MapPage` — map pins have no `pinX`/`pinY` data; all pins render at `50% / 50%`

**File:** [`src/components/MapPage.tsx`](file:///X:/stayable-v1.2/src/components/MapPage.tsx) L98

**Problem:**
```ts
style={{ left: `${l.pinX ?? 50}%`, top: `${l.pinY ?? 50}%` }}
```
`pinX` and `pinY` are not in the DB schema, the `Listing` type, or the API response. All map pins pile up at the center of the map canvas.

**Root Cause:** Map pin coordinates were never added to the data model.

**Impact:** Map view is useless — every property appears at the same location.

**Fix:** Add `pin_x` and `pin_y` (numeric, 0–100) columns to the `listings` table and the listing form. Or compute coordinates from `distance` + campus geolocation.

---

### P1-7 · Map price pin displays wrong price formula

**File:** [`src/components/MapPage.tsx`](file:///X:/stayable-v1.2/src/components/MapPage.tsx) L112

**Problem:**
```ts
₹{(l.priceFrom ?? l.price_from ?? 0 / 1000).toFixed(1)}k
```
Due to operator precedence, `0 / 1000` is evaluated first, so this computes `(l.priceFrom ?? l.price_from ?? 0) / 1000` only when the value is falsy `0`. For real prices it just shows `8.0k` instead of `8.0k`. Should be:
```ts
₹{((l.priceFrom ?? l.price_from ?? 0) / 1000).toFixed(1)}k
```

**Root Cause:** Missing parentheses.

**Impact:** Price pins display "0.0k" when `price_from` is falsy, wrong math otherwise.

**Fix:** Wrap the expression: `((l.priceFrom ?? l.price_from ?? 0) / 1000).toFixed(1)`.

---

### P1-8 · `AdminDashboard` quick-action links use `<a href>` instead of React Router `<Link>` — causes full page reload in SPA

**File:** [`src/app/admin/AdminDashboard.tsx`](file:///X:/stayable-v1.2/src/app/admin/AdminDashboard.tsx) L72

**Problem:** Quick actions use `<a href="/admin/listings">` which triggers a full browser navigation, resetting all React state and re-running auth.

**Root Cause:** Should use `<Link to="...">` or `useNavigate()`.

**Impact:** Every click in the admin quick actions reloads the entire app.

**Fix:** Replace `<a href={a.path}>` with `<Link to={a.path}>` from `react-router`.

---

### P1-9 · `StudentApp` — `enquiryCount` badge always adds +3 to the real count

**File:** [`src/app/student/StudentApp.tsx`](file:///X:/stayable-v1.2/src/app/student/StudentApp.tsx) L100

**Problem:**
```tsx
<BottomNav ... enquiryCount={enquiredIds.length + 3} />
```
A hardcoded `+ 3` inflates the enquiry badge.

**Root Cause:** Debugging artifact left in production code.

**Impact:** Users always see "3" badge even with zero enquiries. Misleading.

**Fix:** Remove `+ 3`.

---

### P1-10 · `Header` — user avatar is always hardcoded "AK" regardless of logged-in user

**File:** [`src/components/Header.tsx`](file:///X:/stayable-v1.2/src/components/Header.tsx) L21

**Problem:** `<span className="text-white text-xs font-bold">AK</span>` — hardcoded initials.

**Root Cause:** `Header` doesn't consume `AuthContext`.

**Impact:** Every user sees "AK" as their avatar in the student app header.

**Fix:** Pass `profile.full_name` or `user.email` to derive real initials.

---

## P2 — Important Bug

---

### P2-1 · Anon key exposed in source code committed to git

**File:** [`utils/supabase/info.tsx`](file:///X:/stayable-v1.2/utils/supabase/info.tsx)

**Problem:** The Supabase project ID and anon key are hardcoded in a committed file. While the anon key is designed for client-side use, embedding it in source means it's visible in the bundle, git history, and anyone with repo access.

**Root Cause:** Figma Make auto-generates this file and commits it.

**Impact:** Anyone can construct direct Supabase queries with the anon key, bypassing the API layer entirely. Without strict RLS policies, this could expose all data.

**Fix:** Ensure RLS policies are enabled on all tables. Move env-sensitive values to `.env` / Vite's `VITE_` env vars where practical, or document that RLS is the security boundary.

---

### P2-2 · No Row-Level Security (RLS) policies exist in migrations

**Files:** [`supabase/migrations/001_stayable_schema.sql`](file:///X:/stayable-v1.2/supabase/migrations/001_stayable_schema.sql), [`002_razorpay_columns.sql`](file:///X:/stayable-v1.2/supabase/migrations/002_razorpay_columns.sql)

**Problem:** Zero `CREATE POLICY` or `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` statements in either migration. The Supabase anon key (exposed client-side) can directly query/mutate all tables.

**Root Cause:** RLS was not configured.

**Impact:** Students can read all owner phone numbers, prices, and messages. Anyone can insert fake enquiries or modify listings directly via Supabase client. Admin data fully readable.

**Fix:** Add `ALTER TABLE public.X ENABLE ROW LEVEL SECURITY;` and appropriate policies for each table (owners can only see own listings, students read only approved listings, admin reads all, etc.).

---

### P2-3 · `OwnerLayout` — guard allows users with `profile === null` (profile fetch failed) to proceed

**File:** [`src/app/owner/OwnerLayout.tsx`](file:///X:/stayable-v1.2/src/app/owner/OwnerLayout.tsx) L19

**Problem:**
```ts
if (!loading && (!user || (profile && profile.role !== "owner" && profile.role !== "admin"))) {
  navigate("/");
}
```
When `profile` is `null` (DB fetch failed, network error), the `(profile && ...)` condition is `false`, so the redirect is skipped. A logged-in user with no profile bypasses the guard.

**Root Cause:** Null-check on `profile` is missing.

**Fix:**
```ts
if (!loading && (!user || !profile || (profile.role !== "owner" && profile.role !== "admin"))) {
  navigate("/");
}
```

---

### P2-4 · `OwnerListings.handleToggle` — `updateListing` returns updated listing from API but the catch fallback uses the wrong toggled value

**File:** [`src/app/owner/OwnerListings.tsx`](file:///X:/stayable-v1.2/src/app/owner/OwnerListings.tsx) L28

**Problem:**
```ts
const updated = await updateListing(l.id, { is_active: !l.is_active }).catch(() => ({ ...l, is_active: !l.is_active }));
setItems((prev) => prev.map((x) => (x.id === l.id ? updated : x)));
```
The catch fallback optimistically applies the toggle. But if the API is broken (P0), the toggle appears to work locally while the DB is never updated. On next refresh, the old state returns.

**Root Cause:** Optimistic update without confirmation.

**Impact:** Silent data inconsistency. Owners think listings are paused but they're still live.

**Fix:** Show an error toast on failure and revert the optimistic update.

---

### P2-5 · `AdminListings.handleApprove` — result `updated` is fetched but never used; optimistic update ignores server response

**File:** [`src/app/admin/AdminListings.tsx`](file:///X:/stayable-v1.2/src/app/admin/AdminListings.tsx) L20–26

**Problem:**
```ts
const updated = await adminApproveListing(id, approved).catch(() => null);
setItems((prev) => prev.map((l) => l.id === id ? { ...l, is_approved: approved, is_active: approved } : l));
```
`updated` is assigned but never used. The UI is updated regardless of whether the API call failed (`null` catch). `is_active` is toggled server-side but the local state sets both to `approved`, which may not match server logic.

**Fix:** Use `updated` to set state; show error if `updated === null`.

---

### P2-6 · `DetailPage` — owner info ("Rajesh Patil", "Verified Owner") is entirely hardcoded

**File:** [`src/components/DetailPage.tsx`](file:///X:/stayable-v1.2/src/components/DetailPage.tsx) L169–176

**Problem:** The landlord section renders `"R"` avatar, `"Rajesh Patil"`, and `"Verified Owner • Responds within 2 hours"` regardless of which listing is viewed.

**Root Cause:** `listing.profiles` is never displayed; owner data from `profiles` join was never wired to the UI.

**Impact:** Every listing shows the same fake owner. Breaks trust entirely.

**Fix:** Use `listing.profiles?.full_name` and `listing.phone` for the owner row.

---

### P2-7 · `DetailPage` — `listing.highlights` accessed without null-guard, crashes if empty

**File:** [`src/components/DetailPage.tsx`](file:///X:/stayable-v1.2/src/components/DetailPage.tsx) L144

**Problem:**
```tsx
{listing.highlights.map((h: any) => ...)}
```
No `?? []` guard. If `highlights` is `null`/`undefined` from the API (which is possible since listings created via the form set `highlights: []` but DB default is `[]::jsonb`), this crashes with `TypeError`.

**Fix:** Use `(listing.highlights ?? []).map(...)`.

---

### P2-8 · `ListingCard` — `listing.images[imgIdx]` crashes if `images` is null/undefined

**File:** [`src/components/ListingCard.tsx`](file:///X:/stayable-v1.2/src/components/ListingCard.tsx) L25

**Problem:**
```tsx
src={listing.images[imgIdx] || listing.images[0]}
```
If `images` is `null`, `undefined`, or an empty array, this throws `TypeError: Cannot read properties of null`.

**Root Cause:** No null guard on images array.

**Fix:** `src={(listing.images ?? [])[imgIdx] || (listing.images ?? [])[0] || ""}`.

---

### P2-9 · `MapPage` — crashes if `listings` is empty (default selected is `listings[0] ?? null`, then early return `null`)

**File:** [`src/components/MapPage.tsx`](file:///X:/stayable-v1.2/src/components/MapPage.tsx) L18–20

**Problem:**
```ts
const [selected, setSelected] = useState<any>(() => listings[0] ?? null);
if (!selected) return null;
```
When there are no listings, `MapPage` renders nothing — no empty state, no back button, no "no listings" message. The user is stranded.

**Root Cause:** No empty state for Map view.

**Impact:** If the API returns 0 listings (or fails, P0), opening Map view shows a blank screen with no way to go back (the list-view button is inside the component that returns null).

**Fix:** Render an empty state with a "Back to List" button when `listings.length === 0`.

---

### P2-10 · `OwnerSubscription` — Razorpay key_id returned from unverified API; no CSP protection

**File:** [`src/app/owner/OwnerSubscription.tsx`](file:///X:/stayable-v1.2/src/app/owner/OwnerSubscription.tsx) L46

**Problem:** `key_id` is obtained from the API response `const { order_id, amount, currency, key_id } = await createRazorpayOrder(plan.id)`. If the API is compromised or returns a crafted response, a malicious key could load a phishing Razorpay checkout.

**Root Cause:** Razorpay key is dynamically loaded from server; no environment variable validation.

**Fix:** Embed the Razorpay publishable key as a `VITE_RAZORPAY_KEY_ID` env variable and use it directly on the client. Never trust the key from an API response.

---

### P2-11 · `OwnerSubscription` — Razorpay script loaded dynamically at subscribe time, not preloaded

**File:** [`src/app/owner/OwnerSubscription.tsx`](file:///X:/stayable-v1.2/src/app/owner/OwnerSubscription.tsx) L10–19

**Problem:** `loadRazorpay()` dynamically appends a `<script>` tag to `document.body` when the user clicks Subscribe. If the CDN is slow, checkout popup is delayed. Also, repeated clicks on Subscribe append multiple script tags.

**Root Cause:** Script loading deferred until interaction.

**Fix:** Load the Razorpay script in `index.html` or use a `useEffect` on component mount. Add a `if (document.querySelector('script[src*="razorpay"]'))` guard.

---

### P2-12 · Duplicate `Profile` type definitions — `AuthContext.tsx` and `supabase.ts` define different shapes

**Files:** [`src/app/AuthContext.tsx`](file:///X:/stayable-v1.2/src/app/AuthContext.tsx) L6–15, [`src/lib/supabase.ts`](file:///X:/stayable-v1.2/src/lib/supabase.ts) L11–19

**Problem:** `AuthContext.tsx` defines `Profile` with `email: string | null` and `is_verified: boolean`. `supabase.ts` defines `Profile` without `email` or `is_verified`. These diverge silently.

**Root Cause:** Types defined in two places.

**Impact:** TypeScript type errors if one file imports from the other; runtime mismatches in data shape.

**Fix:** Export `Profile` from `supabase.ts` as the single source of truth and import it in `AuthContext.tsx`.

---

### P2-13 · `OwnerOnboarding` — selecting a plan in Step 3 has no effect; plans are displayed but not clickable/selectable

**File:** [`src/app/owner/OwnerOnboarding.tsx`](file:///X:/stayable-v1.2/src/app/owner/OwnerOnboarding.tsx) L160–180

**Problem:** The 3 plan cards are rendered as static `<div>` elements with no `onClick` or selection state. Clicking "Start Free Trial" proceeds regardless of which plan the user saw.

**Root Cause:** Plan selection was not implemented.

**Impact:** No plan is associated with the trial subscription. Onboarding data is incomplete.

**Fix:** Make each plan card selectable; pass selected plan ID to `handleSubmit`.

---

### P2-14 · `OwnerOnboarding` — error on profile save navigates to dashboard silently (see also P1-3)

Already captured in P1-3. *(Duplicate noted for completeness.)*

---

### P2-15 · `AdminListings` — filter type `"rejected"` is defined in the state type but never used

**File:** [`src/app/admin/AdminListings.tsx`](file:///X:/stayable-v1.2/src/app/admin/AdminListings.tsx) L8, L30–32

**Problem:**
```ts
const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
```
The filter type includes `"rejected"`, but the filter buttons only render `["all", "pending", "approved"]`. There's also no `if (filter === "rejected") ...` branch.

**Root Cause:** Incomplete implementation.

**Impact:** `"rejected"` state is unreachable dead code. No way to see rejected listings in admin.

**Fix:** Either add a "Rejected" filter button and filter logic, or remove `"rejected"` from the type. The DB also has no `is_rejected` field; rejection is currently represented by `is_approved: false`.

---

## P3 — Minor / UI Issue

---

### P3-1 · `ExplorePage` — "Change" campus button has no `onClick` handler

**File:** [`src/components/ExplorePage.tsx`](file:///X:/stayable-v1.2/src/components/ExplorePage.tsx) L59

**Problem:** `<button className="...">Change<span .../></button>` — no `onClick`.

**Impact:** Tapping "Change" campus does nothing. Campus is hardcoded to "MIT-WPU Kothrud" with no switching mechanism.

---

### P3-2 · `Header` campus button has no `onClick` handler

**File:** [`src/components/Header.tsx`](file:///X:/stayable-v1.2/src/components/Header.tsx) L13

**Problem:** The campus picker button in the student header has no `onClick`. Same as above — decorative only.

---

### P3-3 · Profile settings items (Notifications, Search Preferences, Help & Support) have no handlers

**File:** [`src/components/ProfilePage.tsx`](file:///X:/stayable-v1.2/src/components/ProfilePage.tsx) L87–107

**Problem:** All settings buttons render but have no `onClick` — they appear interactive (with `chevron_right`) but do nothing.

---

### P3-4 · Map controls (Layers, My Location, Traffic) are decorative buttons with no implementation

**File:** [`src/components/MapPage.tsx`](file:///X:/stayable-v1.2/src/components/MapPage.tsx) L124–133

**Problem:** Three map control buttons exist but do nothing.

---

### P3-5 · `FilterChips` "walking" filter uses `parseInt` on walk_time strings like "6 min walk" — will always return NaN or wrong value

**File:** [`src/components/ExplorePage.tsx`](file:///X:/stayable-v1.2/src/components/ExplorePage.tsx) L39

**Problem:**
```ts
if (filters.includes("walking")) visible = visible.filter((l) => parseInt(l.walkTime ?? l.walk_time ?? "99") <= 10);
```
`walk_time` is stored as `"6 min walk"`. `parseInt("6 min walk")` returns `6` (works by accident because of leading digit). But `"walking distance"`, `"~8 min"`, or any other format breaks. This is fragile.

**Fix:** Store `walk_time_minutes` as an integer in DB, or normalize the walk_time string.

---

### P3-6 · `OwnerListingForm` — only 3 image URL slots; cannot add more; no validation of URL format

**File:** [`src/app/owner/OwnerListingForm.tsx`](file:///X:/stayable-v1.2/src/app/owner/OwnerListingForm.tsx) L44, L260–283

**Problem:** Image array is fixed at `["", "", ""]`. Cannot add a 4th image. Also no validation that entered URLs are actually images.

**Fix:** Make the image array dynamic (add/remove slots), validate URL format client-side.

---

### P3-7 · `OwnerListingForm` — `gender_label` field is in the form state but has no input in the UI

**File:** [`src/app/owner/OwnerListingForm.tsx`](file:///X:/stayable-v1.2/src/app/owner/OwnerListingForm.tsx) L31

**Problem:** `gender_label` (displayed prominently in listing cards) is part of the form state and payload, but there is no `<input>` for it in the form. It will always be saved as an empty string.

**Fix:** Auto-derive `gender_label` from the `gender` select value (e.g., `"boys"` → `"Boys Only"`).

---

### P3-8 · `OwnerListingForm` — no validation before save (only name + price_from checked)

**File:** [`src/app/owner/OwnerListingForm.tsx`](file:///X:/stayable-v1.2/src/app/owner/OwnerListingForm.tsx) L290

**Problem:** `disabled={saving || !form.name || !form.price_from}` — address, phone, campus, and all other required fields have no validation.

**Fix:** Add validation for all required fields before submission.

---

### P3-9 · `AuthModal` — closing modal by clicking backdrop fires `onClose` even during loading

**File:** [`src/app/AuthModal.tsx`](file:///X:/stayable-v1.2/src/app/AuthModal.tsx) L100

**Problem:** The backdrop `onClick={onClose}` fires even while an auth operation is in progress (`loading === true`). The modal closes mid-request.

**Fix:** Prevent backdrop close during loading: `onClick={loading ? undefined : onClose}`.

---

### P3-10 · `AuthModal` magic link sent state shows no resend option; user must go back to re-enter email

**File:** [`src/app/AuthModal.tsx`](file:///X:/stayable-v1.2/src/app/AuthModal.tsx) L195–223

**Problem:** Magic link sent screen only shows "go back" which resets the form. No "Resend email" button.

**Fix:** Add a "Resend" button that calls `signInStudent(email)` again with a cooldown.

---

### P3-11 · `AdminDashboard` revenue estimate uses a fixed ₹999 multiplier regardless of actual plan mix

**File:** [`src/app/admin/AdminDashboard.tsx`](file:///X:/stayable-v1.2/src/app/admin/AdminDashboard.tsx) L22

**Problem:** `const revenue = stats.active_subscriptions * 999` assumes every subscriber is on Growth (₹999). Starter (₹499) and Pro (₹1999) subscribers are miscounted.

**Fix:** Return per-plan subscription counts from `adminGetStats` API and compute weighted revenue.

---

### P3-12 · `AdminDashboard` falls back to hardcoded fake stats on API failure

**File:** [`src/app/admin/AdminDashboard.tsx`](file:///X:/stayable-v1.2/src/app/admin/AdminDashboard.tsx) L11

**Problem:**
```ts
.catch(() => setStats({ owners: 12, listings: 34, enquiries: 87, active_subscriptions: 9 }))
```
When the API fails (which it always does, P0), fake stats `12 owners, 34 listings, 87 enquiries` are shown as if real.

**Fix:** Show an error state or zeros; do not display fake data as real.

---

### P3-13 · `OwnerLayout` mobile bottom nav missing "Back to Home" / sign-out; only desktop top bar has them

**File:** [`src/app/owner/OwnerLayout.tsx`](file:///X:/stayable-v1.2/src/app/owner/OwnerLayout.tsx) L73–98

**Problem:** The mobile bottom nav only shows Dashboard, My Listings, Enquiries, Subscription. There's no logout or home navigation on mobile.

**Fix:** Add a long-press or swipe menu, or include a logout button in the bottom nav or dashboard page for mobile users.

---

### P3-14 · `EnquiriesPage` (student) — empty state never shows because no real enquiries are fetched

**File:** [`src/components/EnquiriesPage.tsx`](file:///X:/stayable-v1.2/src/components/EnquiriesPage.tsx)

Already captured in P1-5. Enquiries are frontend-only.

---

### P3-15 · CORS configured with `origin: "*"` in the Edge Function — overly permissive

**File:** [`supabase/functions/server/index.tsx`](file:///X:/stayable-v1.2/supabase/functions/server/index.tsx) L13

**Problem:** `origin: "*"` allows any website to call the API. Since authorization relies on the JWT, this is partially mitigated, but credentialed cross-origin requests should restrict origin to the app domain.

**Fix:** Set `origin` to the production domain (`https://stayable.in` or equivalent). Allow `localhost` in development.

---

## Summary Table

| ID | Area | Priority | File |
|---|---|---|---|
| P0-1 | Backend/API | P0 | `supabase/functions/server/index.tsx` |
| P0-2 | Auth/Security | P0 | `src/app/admin/AdminLayout.tsx` |
| P0-3 | Backend | P0 | `supabase/functions/server/index.tsx` |
| P0-4 | UI/Auth | P0 | `src/components/ProfilePage.tsx` |
| P1-1 | Auth | P1 | `src/app/AuthContext.tsx` |
| P1-2 | Auth | P1 | `src/lib/auth.ts` + `AuthModal.tsx` |
| P1-3 | UX/Error Handling | P1 | `src/app/owner/OwnerOnboarding.tsx` |
| P1-4 | UX/Error Handling | P1 | `src/app/owner/OwnerListingForm.tsx` |
| P1-5 | Functionality | P1 | `src/components/EnquiriesPage.tsx` |
| P1-6 | Data/Map | P1 | `src/components/MapPage.tsx` |
| P1-7 | Bug/Math | P1 | `src/components/MapPage.tsx` |
| P1-8 | Routing | P1 | `src/app/admin/AdminDashboard.tsx` |
| P1-9 | UX/Debug Artifact | P1 | `src/app/student/StudentApp.tsx` |
| P1-10 | UI/Auth | P1 | `src/components/Header.tsx` |
| P2-1 | Security | P2 | `utils/supabase/info.tsx` |
| P2-2 | Security/Database | P2 | `supabase/migrations/*` |
| P2-3 | Auth | P2 | `src/app/owner/OwnerLayout.tsx` |
| P2-4 | Data Integrity | P2 | `src/app/owner/OwnerListings.tsx` |
| P2-5 | Data Integrity | P2 | `src/app/admin/AdminListings.tsx` |
| P2-6 | UI/Data | P2 | `src/components/DetailPage.tsx` |
| P2-7 | Bug/Crash | P2 | `src/components/DetailPage.tsx` |
| P2-8 | Bug/Crash | P2 | `src/components/ListingCard.tsx` |
| P2-9 | UX/Crash | P2 | `src/components/MapPage.tsx` |
| P2-10 | Security | P2 | `src/app/owner/OwnerSubscription.tsx` |
| P2-11 | Performance | P2 | `src/app/owner/OwnerSubscription.tsx` |
| P2-12 | Types/Maintainability | P2 | `AuthContext.tsx` + `supabase.ts` |
| P2-13 | UX/Functionality | P2 | `src/app/owner/OwnerOnboarding.tsx` |
| P2-15 | UX/Bug | P2 | `src/app/admin/AdminListings.tsx` |
| P3-1 | UX | P3 | `src/components/ExplorePage.tsx` |
| P3-2 | UX | P3 | `src/components/Header.tsx` |
| P3-3 | UX | P3 | `src/components/ProfilePage.tsx` |
| P3-4 | UX | P3 | `src/components/MapPage.tsx` |
| P3-5 | Data | P3 | `src/components/ExplorePage.tsx` |
| P3-6 | UX | P3 | `src/app/owner/OwnerListingForm.tsx` |
| P3-7 | Data | P3 | `src/app/owner/OwnerListingForm.tsx` |
| P3-8 | Validation | P3 | `src/app/owner/OwnerListingForm.tsx` |
| P3-9 | UX | P3 | `src/app/AuthModal.tsx` |
| P3-10 | UX | P3 | `src/app/AuthModal.tsx` |
| P3-11 | Logic | P3 | `src/app/admin/AdminDashboard.tsx` |
| P3-12 | UX/Trust | P3 | `src/app/admin/AdminDashboard.tsx` |
| P3-13 | UX/Mobile | P3 | `src/app/owner/OwnerLayout.tsx` |
| P3-15 | Security | P3 | `supabase/functions/server/index.tsx` |
