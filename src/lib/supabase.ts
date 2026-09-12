import { createClient } from "@supabase/supabase-js"

import { projectId, publicAnonKey } from "../../utils/supabase/info"

export const supabase = createClient(
  `https://${projectId}.supabase.co`,

  publicAnonKey,
)

export type UserRole = "student" | "owner" | "admin"

export type Profile = {
  id: string

  role: UserRole

  full_name: string | null

  phone: string | null

  college: string | null

  email: string | null

  avatar_url: string | null

  is_verified: boolean

  created_at: string
}

export type Listing = {
  id: string

  owner_id: string

  name: string

  type: "pg" | "flat"

  gender: "boys" | "girls" | "coed" | "unisex"

  gender_label: string

  address: string

  campus: string

  price_from: number

  price_suffix: string

  deposit: string

  tiers: { label: string; price: number }[];

  amenities: { icon: string; label: string }[];

  highlights: string[]

  images: string[]

  phone: string

  wa_message: string

  rating: number

  review_count: number

  distance: string

  walk_time: string

  instant: boolean

  is_active: boolean

  is_approved: boolean

  badge: string

  pin_x: number | null

  pin_y: number | null

  created_at: string

  profiles?: Profile
}

export type Enquiry = {
  id: string

  listing_id: string

  student_id: string | null

  owner_id: string

  student_name: string

  student_phone: string

  message: string

  status: "pending" | "replied" | "scheduled" | "closed"

  created_at: string

  listings?: Listing
}

export type SubscriptionPlan = {
  id: string

  name: string

  price: number

  max_listings: number

  features: string[]

  is_popular: boolean

  is_active: boolean
}

export type OwnerSubscription = {
  id: string

  owner_id: string

  plan_id: string

  status: "trial" | "active" | "expired" | "cancelled"

  started_at: string

  expires_at: string

  payment_status: "paid" | "pending" | "failed"

  subscription_plans?: SubscriptionPlan
}
