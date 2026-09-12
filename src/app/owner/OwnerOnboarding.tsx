import { useState, useEffect } from "react"

import { useNavigate } from "react-router"

import {
  getSubscriptionPlans,
  startOwnerTrial,
  updateProfile,
} from "../../lib/api"

import { useAuth } from "../AuthContext"

export default function OwnerOnboarding() {
  const navigate = useNavigate()

  const { user, profile, refreshProfile } = useAuth()

  const [step, setStep] = useState(1)

  const [form, setForm] = useState({
    full_name: "",

    phone: "",

    email: "",

    propertyType: "",
  })

  const [loading, setLoading] = useState(false)

  const [error, setError] = useState("")

  const [plans, setPlans] = useState<any[]>([])

  const [selectedPlan, setSelectedPlan] = useState("Growth")

  useEffect(() => {
    getSubscriptionPlans()
      .then(setPlans)
      .catch(() => setPlans([]))
  }, [])

  useEffect(() => {
    if (profile) {
      if (profile.full_name && profile.phone) {
        navigate("/owner/dashboard")

        return
      }

      setForm((f) => ({
        ...f,

        full_name: profile.full_name ?? "",

        phone: profile.phone ?? "",

        email: profile.email ?? "",
      }))
    }
  }, [profile, navigate])

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!user) return

    setLoading(true)

    setError("")

    try {
      await updateProfile({
        role: "owner",

        full_name: form.full_name,

        phone: form.phone,

        email: form.email,
      })

      const plan = plans.find((item) => item.name === selectedPlan)

      if (plan) await startOwnerTrial(plan.id)

      await refreshProfile()

      navigate("/owner/dashboard")
    } catch (e: any) {
      setError(e.message ?? "Unable to save your profile. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="material-symbols-outlined text-[32px] text-white">
              apartment
            </span>
          </div>
          <h1 className="font-display text-2xl font-extrabold text-on-surface">
            List Your Property
          </h1>
          <p className="text-sm text-on-surface-muted mt-1">
            Join 500+ verified owners on Stayable
          </p>
        </div>

        {/* Progress bar */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1.5 rounded-full transition-all ${
                s <= step ? "bg-primary" : "bg-surface-high"
              }`}
            />
          ))}
        </div>

        {/* Step 1: Personal info */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <h2 className="font-display text-lg font-bold text-on-surface">
              Your details
            </h2>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-on-surface-muted mb-1 block">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(e) => update("full_name", e.target.value)}
                  placeholder="Rajesh Patil"
                  className="w-full h-12 px-4 rounded-xl bg-white border border-surface-high text-sm font-medium text-on-surface placeholder:text-on-surface-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-on-surface-muted mb-1 block">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full h-12 px-4 rounded-xl bg-white border border-surface-high text-sm font-medium text-on-surface placeholder:text-on-surface-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-on-surface-muted mb-1 block">
                  Email Address
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="rajesh@email.com"
                  className="w-full h-12 px-4 rounded-xl bg-white border border-surface-high text-sm font-medium text-on-surface placeholder:text-on-surface-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!form.full_name || !form.phone}
              className="w-full h-12 rounded-xl bg-primary-dark text-white font-bold text-sm mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 2: Property type */}
        {step === 2 && (
          <div className="flex flex-col gap-4">
            <h2 className="font-display text-lg font-bold text-on-surface">
              What are you listing?
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  id: "pg",
                  icon: "bed",
                  title: "PG / Hostel",
                  sub: "Paying Guest accommodation",
                },

                {
                  id: "flat",
                  icon: "apartment",
                  title: "Flat / Apartment",
                  sub: "1 BHK, 2 BHK, 3 BHK",
                },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => update("propertyType", opt.id)}
                  className={`p-4 rounded-2xl border-2 flex flex-col gap-2 text-left transition-all ${
                    form.propertyType === opt.id
                      ? "border-primary bg-surface-low"
                      : "border-surface-high bg-white hover:border-surface-highest"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      form.propertyType === opt.id
                        ? "bg-primary"
                        : "bg-surface-mid"
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-[22px] ${
                        form.propertyType === opt.id
                          ? "text-white"
                          : "text-secondary"
                      }`}
                    >
                      {opt.icon}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-on-surface">
                      {opt.title}
                    </p>
                    <p className="text-xs text-on-surface-muted mt-0.5">
                      {opt.sub}
                    </p>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex gap-3 mt-2">
              <button
                onClick={() => setStep(1)}
                className="flex-1 h-12 rounded-xl border border-surface-high text-sm font-semibold text-on-surface-muted"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!form.propertyType}
                className="flex-1 h-12 rounded-xl bg-primary-dark text-white font-bold text-sm disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Pricing plan */}
        {step === 3 && (
          <div className="flex flex-col gap-4">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
                {error}
              </div>
            )}
            <h2 className="font-display text-lg font-bold text-on-surface">
              Choose your plan
            </h2>
            <p className="text-xs text-on-surface-muted">
              Start with a 14-day free trial. Cancel anytime.
            </p>

            {[
              { name: "Starter", price: 499, listings: 1, tag: null },

              { name: "Growth", price: 999, listings: 5, tag: "Most Popular" },

              { name: "Pro", price: 1999, listings: 20, tag: null },
            ].map((plan) => (
              <button
                type="button"
                key={plan.name}
                onClick={() => setSelectedPlan(plan.name)}
                className={`relative p-4 rounded-2xl border-2 text-left ${
                  selectedPlan === plan.name
                    ? "border-primary bg-surface-low"
                    : "border-surface-high bg-white"
                }`}
              >
                {plan.tag && (
                  <span className="absolute -top-3 left-4 px-2.5 py-0.5 rounded-full bg-primary text-white text-[11px] font-bold">
                    {plan.tag}
                  </span>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-display text-base font-bold text-on-surface">
                      {plan.name}
                    </p>
                    <p className="text-xs text-on-surface-muted">
                      Up to {plan.listings} listing
                      {plan.listings > 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-display text-xl font-extrabold text-primary-dark">
                      ₹{plan.price}
                    </span>
                    <p className="text-xs text-on-surface-muted">/month</p>
                  </div>
                </div>
              </button>
            ))}

            <div className="flex gap-3 mt-2">
              <button
                onClick={() => setStep(2)}
                className="flex-1 h-12 rounded-xl border border-surface-high text-sm font-semibold text-on-surface-muted"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 h-12 rounded-xl bg-primary-dark text-white font-bold text-sm disabled:opacity-70"
              >
                {loading ? "Setting up..." : "Start Free Trial"}
              </button>
            </div>
          </div>
        )}

        {/* Trust badges */}
        <div className="mt-8 flex items-center justify-center gap-4 text-xs text-on-surface-muted">
          {["verified_user", "lock", "support_agent"].map((icon, i) => (
            <div key={i} className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-verified">
                {icon}
              </span>
              <span>{["Verified", "Secure", "24/7 Support"][i]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
