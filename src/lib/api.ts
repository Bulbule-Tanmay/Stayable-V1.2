import { projectId } from "../../utils/supabase/info";
import { supabase } from "./supabase";

const BASE = `https://${projectId}.supabase.co/functions/v1/make-server-132ba7b2`;

async function getAuthHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const authHeaders = await getAuthHeader();
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? res.statusText);
  }
  return res.json();
}

// ─── Listings ─────────────────────────────────────────────────────────────────
export const getListings = (type?: string, campus?: string) => {
  const p = new URLSearchParams();
  if (type) p.set("type", type);
  if (campus) p.set("campus", campus);
  return req<any[]>(`/listings?${p}`);
};

export const getListing = (id: string) => req<any>(`/listings/${id}`);

// ─── Enquiries ────────────────────────────────────────────────────────────────
export const createEnquiry = (body: {
  listing_id: string;
  student_name: string;
  student_phone: string;
  message?: string;
}) => req<any>("/enquiries", { method: "POST", body: JSON.stringify(body) });

// ─── Owner ────────────────────────────────────────────────────────────────────
export const getOwnerListings = () => req<any[]>("/owner/listings");
export const createListing = (body: any) => req<any>("/owner/listings", { method: "POST", body: JSON.stringify(body) });
export const updateListing = (id: string, body: any) => req<any>(`/owner/listings/${id}`, { method: "PUT", body: JSON.stringify(body) });
export const deleteListing = (id: string) => req<any>(`/owner/listings/${id}`, { method: "DELETE" });

export const getOwnerEnquiries = () => req<any[]>("/owner/enquiries");
export const updateEnquiryStatus = (id: string, status: string) =>
  req<any>(`/owner/enquiries/${id}`, { method: "PUT", body: JSON.stringify({ status }) });

export const getOwnerSubscription = () => req<any>("/owner/subscription");

export const createRazorpayOrder = (plan_id: string) =>
  req<any>("/owner/subscription/create-order", { method: "POST", body: JSON.stringify({ plan_id }) });

export const verifyRazorpayPayment = (payload: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  plan_id: string;
}) => req<any>("/owner/subscription/verify-payment", { method: "POST", body: JSON.stringify(payload) });

// ─── Profile ──────────────────────────────────────────────────────────────────
export const getProfile = () => req<any>("/profile");
export const updateProfile = (body: any) => req<any>("/profile", { method: "PUT", body: JSON.stringify(body) });

// ─── Admin ────────────────────────────────────────────────────────────────────
export const adminGetOwners = () => req<any[]>("/admin/owners");
export const adminGetListings = () => req<any[]>("/admin/listings");
export const adminApproveListing = (id: string, approved: boolean) =>
  req<any>(`/admin/listings/${id}/approve`, { method: "PUT", body: JSON.stringify({ approved }) });
export const adminGetStats = () => req<any>("/admin/stats");

// ─── Subscription plans ───────────────────────────────────────────────────────
export const getSubscriptionPlans = () => req<any[]>("/subscription/plans");
