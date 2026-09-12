import { Hono } from "npm:hono"
import { cors } from "npm:hono/cors"
import { logger } from "npm:hono/logger"
import { createClient } from "jsr:@supabase/supabase-js@2.49.8"

// ─── Supabase client (service role — server only) ─────────────────────────
const adminClient = () =>
  createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  )

// ─── Anon client authenticated with caller's JWT ──────────────────────────
const authedClient = (jwt: string) =>
  createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: `Bearer ${jwt}` } } },
  )

// ─── JWT helper ───────────────────────────────────────────────────────────
function getJwt(c: any): string | null {
  const auth = c.req.header("Authorization") ?? ""
  if (!auth.startsWith("Bearer ")) return null
  return auth.slice(7)
}

async function requireAuth(c: any) {
  const jwt = getJwt(c)
  if (!jwt) return null
  const { data } = await adminClient().auth.getUser(jwt)
  return data.user ?? null
}

async function requireRole(c: any, ...roles: string[]) {
  const user = await requireAuth(c)
  if (!user) return null
  const { data: profile } = await adminClient()
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()
  if (!profile || !roles.includes(profile.role)) return null
  return { user, profile }
}

// ─── App ──────────────────────────────────────────────────────────────────
const app = new Hono()
const BASE = ""

app.use("*", logger(console.log))
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
)

// ─── Health ───────────────────────────────────────────────────────────────
app.get(`${BASE}/health`, (c) => c.json({ status: "ok" }))

// ─── Public: Listings ─────────────────────────────────────────────────────
app.get(`${BASE}/listings`, async (c) => {
  const type = c.req.query("type")
  const campus = c.req.query("campus")
  let q = adminClient()
    .from("listings")
    .select("*, profiles(full_name, phone, avatar_url)")
    .eq("is_approved", true)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
  if (type) q = q.eq("type", type)
  if (campus) q = q.eq("campus", campus)
  const { data, error } = await q
  if (error) return c.json({ error: error.message }, 500)
  return c.json(data ?? [])
})

app.get(`${BASE}/listings/:id`, async (c) => {
  const { data, error } = await adminClient()
    .from("listings")
    .select("*, profiles(full_name, phone, avatar_url)")
    .eq("id", c.req.param("id"))
    .eq("is_approved", true)
    .single()
  if (error || !data) return c.json({ error: "Not found" }, 404)
  return c.json(data)
})

// ─── Enquiries ────────────────────────────────────────────────────────────
app.post(`${BASE}/enquiries`, async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!body?.listing_id || !body?.student_name || !body?.student_phone) {
    return c.json({ error: "Missing required fields" }, 400)
  }
  // Resolve owner_id from listing
  const { data: listing } = await adminClient()
    .from("listings")
    .select("owner_id")
    .eq("id", body.listing_id)
    .single()
  if (!listing) return c.json({ error: "Listing not found" }, 404)

  const jwt = getJwt(c)
  const user = jwt ? (await adminClient().auth.getUser(jwt)).data.user : null

  const { data, error } = await adminClient()
    .from("enquiries")
    .insert({
      listing_id: body.listing_id,
      owner_id: listing.owner_id,
      student_id: user?.id ?? null,
      student_name: body.student_name,
      student_phone: body.student_phone,
      message: body.message ?? "",
      status: "pending",
    })
    .select()
    .single()
  if (error) return c.json({ error: error.message }, 500)
  return c.json(data, 201)
})

app.get(`${BASE}/enquiries`, async (c) => {
  const user = await requireAuth(c)
  if (!user) return c.json({ error: "Unauthorized" }, 401)
  const { data, error } = await adminClient()
    .from("enquiries")
    .select("*, listings(name, images, phone, wa_message)")
    .eq("student_id", user.id)
    .order("created_at", { ascending: false })
  if (error) return c.json({ error: error.message }, 500)
  return c.json(data ?? [])
})

// ─── Owner: Listings ──────────────────────────────────────────────────────
app.get(`${BASE}/owner/listings`, async (c) => {
  const ctx = await requireRole(c, "owner", "admin")
  if (!ctx) return c.json({ error: "Unauthorized" }, 401)
  const { data, error } = await adminClient()
    .from("listings")
    .select("*")
    .eq("owner_id", ctx.user.id)
    .order("created_at", { ascending: false })
  if (error) return c.json({ error: error.message }, 500)
  return c.json(data ?? [])
})

app.post(`${BASE}/owner/listings`, async (c) => {
  const ctx = await requireRole(c, "owner", "admin")
  if (!ctx) return c.json({ error: "Unauthorized" }, 401)
  const body = await c.req.json().catch(() => null)
  if (!body) return c.json({ error: "Invalid body" }, 400)
  const { data, error } = await adminClient()
    .from("listings")
    .insert({ ...body, owner_id: ctx.user.id, is_approved: false })
    .select()
    .single()
  if (error) return c.json({ error: error.message }, 500)
  return c.json(data, 201)
})

app.put(`${BASE}/owner/listings/:id`, async (c) => {
  const ctx = await requireRole(c, "owner", "admin")
  if (!ctx) return c.json({ error: "Unauthorized" }, 401)
  const body = await c.req.json().catch(() => null)
  if (!body) return c.json({ error: "Invalid body" }, 400)
  // Strip owner-immutable fields
  const { owner_id: _o, id: _id, created_at: _ca, ...rest } = body
  const { data, error } = await adminClient()
    .from("listings")
    .update(rest)
    .eq("id", c.req.param("id"))
    .eq("owner_id", ctx.user.id)
    .select()
    .single()
  if (error) return c.json({ error: error.message }, 500)
  return c.json(data)
})

app.delete(`${BASE}/owner/listings/:id`, async (c) => {
  const ctx = await requireRole(c, "owner", "admin")
  if (!ctx) return c.json({ error: "Unauthorized" }, 401)
  const { error } = await adminClient()
    .from("listings")
    .delete()
    .eq("id", c.req.param("id"))
    .eq("owner_id", ctx.user.id)
  if (error) return c.json({ error: error.message }, 500)
  return c.json({ success: true })
})

// ─── Owner: Enquiries ─────────────────────────────────────────────────────
app.get(`${BASE}/owner/enquiries`, async (c) => {
  const ctx = await requireRole(c, "owner", "admin")
  if (!ctx) return c.json({ error: "Unauthorized" }, 401)
  const { data, error } = await adminClient()
    .from("enquiries")
    .select("*, listings(name, images)")
    .eq("owner_id", ctx.user.id)
    .order("created_at", { ascending: false })
  if (error) return c.json({ error: error.message }, 500)
  return c.json(data ?? [])
})

app.put(`${BASE}/owner/enquiries/:id`, async (c) => {
  const ctx = await requireRole(c, "owner", "admin")
  if (!ctx) return c.json({ error: "Unauthorized" }, 401)
  const body = await c.req.json().catch(() => null)
  if (!body?.status) return c.json({ error: "Missing status" }, 400)
  const { data, error } = await adminClient()
    .from("enquiries")
    .update({ status: body.status })
    .eq("id", c.req.param("id"))
    .eq("owner_id", ctx.user.id)
    .select()
    .single()
  if (error) return c.json({ error: error.message }, 500)
  return c.json(data)
})

// ─── Owner: Subscription ──────────────────────────────────────────────────
app.get(`${BASE}/owner/subscription`, async (c) => {
  const ctx = await requireRole(c, "owner", "admin")
  if (!ctx) return c.json({ error: "Unauthorized" }, 401)
  const { data, error } = await adminClient()
    .from("owner_subscriptions")
    .select("*, subscription_plans(*)")
    .eq("owner_id", ctx.user.id)
    .maybeSingle()
  if (error) return c.json({ error: error.message }, 500)
  return c.json(data ?? null)
})

app.post(`${BASE}/owner/subscription/trial`, async (c) => {
  const ctx = await requireRole(c, "owner", "admin")
  if (!ctx) return c.json({ error: "Unauthorized" }, 401)
  const body = await c.req.json().catch(() => null)
  if (!body?.plan_id) return c.json({ error: "Missing plan_id" }, 400)
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 14)
  const { data, error } = await adminClient()
    .from("owner_subscriptions")
    .upsert(
      {
        owner_id: ctx.user.id,
        plan_id: body.plan_id,
        status: "trial",
        started_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        payment_status: "pending",
      },
      { onConflict: "owner_id" },
    )
    .select("*, subscription_plans(*)")
    .single()
  if (error) return c.json({ error: error.message }, 500)
  return c.json(data)
})

app.post(`${BASE}/owner/subscription/create-order`, async (c) => {
  const ctx = await requireRole(c, "owner", "admin")
  if (!ctx) return c.json({ error: "Unauthorized" }, 401)
  const body = await c.req.json().catch(() => null)
  if (!body?.plan_id) return c.json({ error: "Missing plan_id" }, 400)

  const { data: plan } = await adminClient()
    .from("subscription_plans")
    .select("*")
    .eq("id", body.plan_id)
    .single()
  if (!plan) return c.json({ error: "Plan not found" }, 404)

  const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID")
  const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET")
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    return c.json({ error: "Payment not configured" }, 503)
  }

  const credentials = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)
  const resp = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${credentials}`,
    },
    body: JSON.stringify({
      amount: plan.price * 100, // paise
      currency: "INR",
      receipt: `sub_${ctx.user.id.slice(0, 8)}_${Date.now()}`,
    }),
  })
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}))
    return c.json(
      { error: (err as any).error?.description ?? "Razorpay error" },
      502,
    )
  }
  const order = (await resp.json()) as {
    id: string
    amount: number
    currency: string
  }
  return c.json({
    order_id: order.id,
    amount: order.amount,
    currency: order.currency,
    key_id: RAZORPAY_KEY_ID,
  })
})

app.post(`${BASE}/owner/subscription/verify-payment`, async (c) => {
  const ctx = await requireRole(c, "owner", "admin")
  if (!ctx) return c.json({ error: "Unauthorized" }, 401)
  const body = await c.req.json().catch(() => null)
  if (
    !body?.razorpay_order_id ||
    !body?.razorpay_payment_id ||
    !body?.razorpay_signature ||
    !body?.plan_id
  ) {
    return c.json({ error: "Missing payment fields" }, 400)
  }

  const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET")
  if (!RAZORPAY_KEY_SECRET)
    return c.json({ error: "Payment not configured" }, 503)

  // Verify HMAC-SHA256 signature
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(RAZORPAY_KEY_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )
  const payload = `${body.razorpay_order_id}|${body.razorpay_payment_id}`
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload),
  )
  const computed = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")

  if (computed !== body.razorpay_signature) {
    return c.json({ error: "Payment verification failed" }, 400)
  }

  const { data: plan } = await adminClient()
    .from("subscription_plans")
    .select("*")
    .eq("id", body.plan_id)
    .single()
  if (!plan) return c.json({ error: "Plan not found" }, 404)

  const expiresAt = new Date()
  expiresAt.setMonth(expiresAt.getMonth() + 1)

  const { data, error } = await adminClient()
    .from("owner_subscriptions")
    .upsert(
      {
        owner_id: ctx.user.id,
        plan_id: body.plan_id,
        status: "active",
        started_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        payment_status: "paid",
        razorpay_order_id: body.razorpay_order_id,
        razorpay_payment_id: body.razorpay_payment_id,
      },
      { onConflict: "owner_id" },
    )
    .select("*, subscription_plans(*)")
    .single()
  if (error) return c.json({ error: error.message }, 500)
  return c.json(data)
})

// ─── Profile ──────────────────────────────────────────────────────────────
app.get(`${BASE}/profile`, async (c) => {
  const user = await requireAuth(c)
  if (!user) return c.json({ error: "Unauthorized" }, 401)
  const { data, error } = await adminClient()
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()
  if (error) return c.json({ error: error.message }, 500)
  return c.json(data)
})

app.put(`${BASE}/profile`, async (c) => {
  const user = await requireAuth(c)
  if (!user) return c.json({ error: "Unauthorized" }, 401)
  const body = await c.req.json().catch(() => null)
  if (!body) return c.json({ error: "Invalid body" }, 400)
  const { id: _id, created_at: _ca, ...rest } = body
  const { data, error } = await adminClient()
    .from("profiles")
    .update(rest)
    .eq("id", user.id)
    .select()
    .single()
  if (error) return c.json({ error: error.message }, 500)
  return c.json(data)
})

// ─── Admin ────────────────────────────────────────────────────────────────
app.get(`${BASE}/admin/owners`, async (c) => {
  const ctx = await requireRole(c, "admin")
  if (!ctx) return c.json({ error: "Unauthorized" }, 401)
  const { data, error } = await adminClient()
    .from("profiles")
    .select(
      "*, owner_subscriptions(status, expires_at, subscription_plans(name, price))",
    )
    .eq("role", "owner")
    .order("created_at", { ascending: false })
  if (error) return c.json({ error: error.message }, 500)
  return c.json(data ?? [])
})

app.get(`${BASE}/admin/listings`, async (c) => {
  const ctx = await requireRole(c, "admin")
  if (!ctx) return c.json({ error: "Unauthorized" }, 401)
  const { data, error } = await adminClient()
    .from("listings")
    .select("*, profiles(full_name, email)")
    .order("created_at", { ascending: false })
  if (error) return c.json({ error: error.message }, 500)
  return c.json(data ?? [])
})

app.put(`${BASE}/admin/listings/:id/approve`, async (c) => {
  const ctx = await requireRole(c, "admin")
  if (!ctx) return c.json({ error: "Unauthorized" }, 401)
  const body = await c.req.json().catch(() => null)
  if (typeof body?.approved !== "boolean")
    return c.json({ error: "Missing approved field" }, 400)
  const { data, error } = await adminClient()
    .from("listings")
    .update({ is_approved: body.approved, is_active: body.approved })
    .eq("id", c.req.param("id"))
    .select("*, profiles(full_name, email)")
    .single()
  if (error) return c.json({ error: error.message }, 500)
  return c.json(data)
})

app.get(`${BASE}/admin/stats`, async (c) => {
  const ctx = await requireRole(c, "admin")
  if (!ctx) return c.json({ error: "Unauthorized" }, 401)
  const db = adminClient()
  const [owners, listings, enquiries, subs] = await Promise.all([
    db
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "owner"),
    db.from("listings").select("id", { count: "exact", head: true }),
    db.from("enquiries").select("id", { count: "exact", head: true }),
    db
      .from("owner_subscriptions")
      .select("id, plan_id, subscription_plans(price)", { count: "exact" })
      .eq("status", "active"),
  ])
  const revenue = ((subs.data ?? []) as any[]).reduce(
    (sum: number, s: any) => sum + (s.subscription_plans?.price ?? 0),
    0,
  )
  return c.json({
    owners: owners.count ?? 0,
    listings: listings.count ?? 0,
    enquiries: enquiries.count ?? 0,
    active_subscriptions: subs.count ?? 0,
    estimated_revenue: revenue,
  })
})

// ─── Subscription plans (public) ──────────────────────────────────────────
app.get(`${BASE}/subscription/plans`, async (c) => {
  const { data, error } = await adminClient()
    .from("subscription_plans")
    .select("*")
    .eq("is_active", true)
    .order("price", { ascending: true })
  if (error) return c.json({ error: error.message }, 500)
  return c.json(data ?? [])
})

Deno.serve((request) => {
  const url = new URL(request.url)
  const functionName = "make-server-132ba7b2"
  const gatewayPrefix = `/functions/v1/${functionName}`
  const runtimePrefix = `/${functionName}`

  // The hosted runtime removes `/functions/v1` before invoking the function,
  // while local callers keep it. Normalise both forms to the Hono route path.
  if (url.pathname.startsWith(gatewayPrefix)) {
    url.pathname = url.pathname.slice(gatewayPrefix.length) || "/"
  } else if (url.pathname.startsWith(runtimePrefix)) {
    url.pathname = url.pathname.slice(runtimePrefix.length) || "/"
  }

  return app.fetch(new Request(url, request))
})
