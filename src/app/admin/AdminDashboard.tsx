import { useState, useEffect } from "react"

import { Link } from "react-router"

import { adminGetStats } from "../../lib/api"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    owners: 0,
    listings: 0,
    enquiries: 0,
    active_subscriptions: 0,
    estimated_revenue: 0,
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminGetStats()

      .then(setStats)

      .catch(() =>
        setStats({
          owners: 0,
          listings: 0,
          enquiries: 0,
          active_subscriptions: 0,
          estimated_revenue: 0,
        }),
      )

      .finally(() => setLoading(false))
  }, [])

  const statCards = [
    {
      label: "Total Owners",
      value: stats.owners,
      icon: "people",
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },

    {
      label: "Total Listings",
      value: stats.listings,
      icon: "apartment",
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
    },

    {
      label: "Student Enquiries",
      value: stats.enquiries,
      icon: "forum",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },

    {
      label: "Active Subscriptions",
      value: stats.active_subscriptions,
      icon: "workspace_premium",
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
  ]

  const revenue = stats.estimated_revenue

  return (
    <div className="py-6 flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">
          Dashboard
        </h1>
        <p className="text-sm text-white/40 mt-0.5">Platform overview</p>
      </div>

      {/* Revenue banner */}
      <div className="bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/20 rounded-2xl p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-[26px] text-primary">
            currency_rupee
          </span>
        </div>
        <div>
          <p className="text-sm font-semibold text-white/60">
            Estimated Monthly Revenue
          </p>
          <p className="font-display text-2xl font-extrabold text-white">
            ₹{loading ? "—" : revenue.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-white/40">
            {stats.active_subscriptions} active subscriptions × avg ₹999
          </p>
          <p className="text-xs text-white/40">
            Based on the current active plan mix
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {statCards.map((s) => (
          <div
            key={s.label}
            className={`rounded-2xl p-4 border ${s.bg} ${s.border} flex flex-col gap-2`}
          >
            <div
              className={`w-9 h-9 rounded-xl ${s.bg} border ${s.border} flex items-center justify-center`}
            >
              <span
                className={`material-symbols-outlined text-[20px] ${s.color}`}
              >
                {s.icon}
              </span>
            </div>
            {loading ? (
              <div className="h-8 rounded-lg bg-white/5 animate-pulse" />
            ) : (
              <div>
                <p
                  className={`font-display text-2xl font-extrabold ${s.color}`}
                >
                  {s.value}
                </p>
                <p className="text-xs text-white/40">{s.label}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="font-display text-base font-bold text-white mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              label: "Review Pending Listings",
              icon: "pending_actions",
              path: "/admin/listings",
              badge: "New",
            },

            {
              label: "Manage Owners",
              icon: "manage_accounts",
              path: "/admin/owners",
              badge: null,
            },
          ].map((a) => (
            <Link
              key={a.label}
              to={a.path}
              className="bg-[#1a1d27] border border-white/5 rounded-2xl p-4 flex flex-col gap-2 hover:border-white/10 transition-colors group"
            >
              <div className="flex items-start justify-between">
                <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px] text-white/60 group-hover:text-white transition-colors">
                    {a.icon}
                  </span>
                </div>
                {a.badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">
                    {a.badge}
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold text-white/70 group-hover:text-white transition-colors">
                {a.label}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Subscription breakdown */}
      <div className="bg-[#1a1d27] border border-white/5 rounded-2xl p-5">
        <h3 className="font-display text-sm font-bold text-white mb-4">
          Subscription Plans
        </h3>
        <div className="flex flex-col gap-3">
          {[
            { name: "Starter", price: 499, color: "bg-slate-500" },

            { name: "Growth", price: 999, color: "bg-primary" },

            { name: "Pro", price: 1999, color: "bg-purple-500" },
          ].map((p) => (
            <div key={p.name} className="flex items-center gap-3">
              <span className={`w-2 h-2 rounded-full ${p.color} shrink-0`} />
              <span className="text-sm text-white/70 flex-1">{p.name}</span>
              <span className="text-xs font-bold text-white/50">
                ₹{p.price}/mo
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-white/5">
          <p className="text-xs text-white/40">
            Note: Students are never charged. All revenue comes from PG/Flat
            owners.
          </p>
        </div>
      </div>
    </div>
  )
}
