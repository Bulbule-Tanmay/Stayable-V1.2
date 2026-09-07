import { useState, useEffect } from "react";
import { getSubscriptionPlans, getOwnerSubscription, createRazorpayOrder, verifyRazorpayPayment } from "../../lib/api";

declare global {
  interface Window {
    Razorpay: any;
  }
}

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function OwnerSubscription() {
  const [plans, setPlans] = useState<any[]>([]);
  const [current, setCurrent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState("");

  useEffect(() => {
    Promise.all([
      getSubscriptionPlans().catch(() => []),
      getOwnerSubscription().catch(() => null),
    ]).then(([p, s]) => {
      setPlans(p);
      setCurrent(s);
    }).finally(() => setLoading(false));
  }, []);

  const handleSubscribe = async (plan: any) => {
    setSubscribing(plan.id);
    setPaymentError("");

    try {
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error("Razorpay failed to load. Check your connection.");

      const { order_id, amount, currency, key_id } = await createRazorpayOrder(plan.id);

      await new Promise<void>((resolve, reject) => {
        const options = {
          key: key_id,
          amount,
          currency,
          name: "Stayable",
          description: `${plan.name} Plan — ₹${plan.price}/month`,
          order_id,
          handler: async (response: any) => {
            try {
              const data = await verifyRazorpayPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan_id: plan.id,
              });
              setCurrent(data);
              resolve();
            } catch (e: any) {
              reject(e);
            }
          },
          prefill: {},
          theme: { color: "#0F172A" },
          modal: {
            ondismiss: () => reject(new Error("Payment cancelled")),
          },
        };
        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", (response: any) => {
          reject(new Error(response.error?.description ?? "Payment failed"));
        });
        rzp.open();
      });
    } catch (e: any) {
      if (e.message !== "Payment cancelled") {
        setPaymentError(e.message ?? "Payment failed. Please try again.");
      }
    } finally {
      setSubscribing(null);
    }
  };

  const isCurrentPlan = (plan: any) => current?.subscription_plans?.name === plan.name && current?.status === "active";

  return (
    <div className="py-6 flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-on-surface">Subscription</h1>
        <p className="text-sm text-on-surface-muted">Choose the right plan for your listing needs</p>
      </div>

      {paymentError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-2">
          <span className="material-symbols-outlined text-[18px] text-red-500 shrink-0 mt-0.5">error</span>
          <p className="text-sm text-red-700">{paymentError}</p>
        </div>
      )}

      {/* Current subscription */}
      {current && current.status === "active" && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[26px] text-emerald-600" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
            </div>
            <div className="flex-1">
              <p className="font-display text-base font-bold text-emerald-900">
                {current.subscription_plans?.name} Plan — Active
              </p>
              <p className="text-sm text-emerald-700">
                ₹{current.subscription_plans?.price}/month • Renews {current.expires_at ? new Date(current.expires_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—"}
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full">Paid</span>
          </div>
        </div>
      )}

      {/* Plans */}
      {loading ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-48 rounded-2xl bg-surface-high animate-pulse" />)}
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-12 text-on-surface-muted">
          <span className="material-symbols-outlined text-[48px] mb-3">subscriptions</span>
          <p className="text-sm font-semibold">No subscription plans available yet.</p>
          <p className="text-xs mt-1">Please run the database migration to seed plans.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {plans.map((plan) => {
            const active = isCurrentPlan(plan);
            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl overflow-hidden shadow-sm border-2 transition-all ${
                  plan.is_popular ? "border-primary" : "border-transparent"
                } ${active ? "ring-2 ring-emerald-400" : ""}`}
              >
                {plan.is_popular && !active && (
                  <div className="bg-primary text-white text-center py-1.5 text-xs font-bold tracking-wide">
                    MOST POPULAR
                  </div>
                )}
                {active && (
                  <div className="bg-emerald-500 text-white text-center py-1.5 text-xs font-bold tracking-wide">
                    YOUR CURRENT PLAN
                  </div>
                )}

                <div className="p-5 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-display text-xl font-extrabold text-on-surface">{plan.name}</h3>
                      <p className="text-xs text-on-surface-muted">Up to {plan.max_listings} listing{plan.max_listings > 1 ? "s" : ""}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-display text-3xl font-extrabold text-primary-dark">₹{plan.price}</span>
                      <p className="text-xs text-on-surface-muted">/month + GST</p>
                    </div>
                  </div>

                  <ul className="flex flex-col gap-2">
                    {(Array.isArray(plan.features) ? plan.features : []).map((f: string) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-on-surface">
                        <span className="material-symbols-outlined text-[16px] text-verified shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSubscribe(plan)}
                    disabled={active || subscribing === plan.id}
                    className={`w-full h-12 rounded-xl font-bold text-sm transition-all ${
                      active
                        ? "bg-surface-mid text-on-surface-muted cursor-not-allowed"
                        : plan.is_popular
                        ? "bg-primary text-white shadow-sm active:scale-[0.98]"
                        : "bg-primary-dark text-white active:scale-[0.98]"
                    } flex items-center justify-center gap-2 disabled:opacity-60`}
                  >
                    {subscribing === plan.id ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Opening payment...
                      </>
                    ) : active ? (
                      "Current Plan"
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[16px]">payment</span>
                        Subscribe — ₹{plan.price}/mo
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-surface-low rounded-2xl p-5 flex flex-col gap-3">
        <h3 className="font-display text-sm font-bold text-on-surface">Billing Notes</h3>
        {[
          "Students are never charged — listing fees are owner-only.",
          "Cancel anytime. No cancellation fee.",
          "All plans include a 14-day free trial for new owners.",
          "Payments via UPI, Net Banking, Credit/Debit card through Razorpay.",
          "GST (18%) applicable on all subscription amounts.",
          "Payment is secured by Razorpay — PCI DSS compliant.",
        ].map((note) => (
          <div key={note} className="flex items-start gap-2 text-xs text-on-surface-muted">
            <span className="material-symbols-outlined text-[14px] text-secondary mt-0.5 shrink-0">info</span>
            {note}
          </div>
        ))}
      </div>
    </div>
  );
}
