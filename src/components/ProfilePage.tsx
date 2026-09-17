import { useAuth } from "../app/AuthContext";
import { signOut } from "../lib/auth";
import { useNavigate } from "react-router";

type Props = {
  savedCount: number;
  enquiryCount: number;
  onOwnerPortal?: () => void;
  onSavedClick?: () => void;
  onEnquiriesClick?: () => void;
  listings?: any[];
  savedIds?: Set<string>;
};

export default function ProfilePage({ savedCount, enquiryCount, onOwnerPortal, onSavedClick, onEnquiriesClick, listings = [], savedIds = new Set() }: Props) {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const displayName = profile?.full_name ?? user?.email?.split("@")[0] ?? "Student User";
  const initials = displayName.split(/\s+/).map((p: string) => p[0]).join("").slice(0, 2).toUpperCase();
  const phone = profile?.phone ?? "+91 9XXXXXXXXX";

  const handleSignOut = async () => {
    await signOut().catch(() => {});
    navigate("/");
  };

  const menuItems = [
    { icon: "favorite", label: "Saved PGs", onClick: onSavedClick ?? (() => alert("Coming soon!")) },
    { icon: "schedule", label: "Recently Viewed", onClick: () => alert("Coming soon!") },
    { icon: "mail", label: "My Enquiries", onClick: onEnquiriesClick ?? (() => alert("Coming soon!")) },
    { icon: "settings", label: "Settings", onClick: () => alert("Coming soon!") },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Purple banner */}
      <div className="bg-gradient-to-br from-[#3B1FA8] to-[#6D28D9] px-6 pt-8 pb-20">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/30 flex items-center justify-center text-white text-2xl font-extrabold">
            {initials}
          </div>
          <div>
            <div className="font-display text-xl font-extrabold text-white">{displayName}</div>
            <div className="text-white/80 text-sm">{phone}</div>
            <div className="text-white/60 text-xs mt-0.5">{(profile as any)?.city ?? (profile as any)?.location ?? "Pune, Maharashtra"}</div>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-12 flex flex-col gap-4 pb-8">
        {/* Stats card */}
        <div className="bg-white rounded-2xl shadow-md p-4">
          <div className="grid grid-cols-3 divide-x divide-gray-100">
            {[
              { val: savedCount || 2, label: "Saved PGs" },
              { val: enquiryCount || 3, label: "Enquiries Sent" },
              { val: 12, label: "PGs Viewed" },
            ].map(({ val, label }) => (
              <div key={label} className="flex flex-col items-center py-2">
                <div className="font-display text-xl font-extrabold text-primary">{val}</div>
                <div className="text-xs text-gray-500 mt-0.5 text-center">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Menu items */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {menuItems.map((item, i) => (
            <button
              key={item.label}
              onClick={item.onClick}
              className={`w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors text-left ${i < menuItems.length - 1 ? "border-b border-gray-100" : ""}`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px] text-gray-500">{item.icon}</span>
                <span className="text-sm font-medium text-on-surface">{item.label}</span>
              </div>
              <span className="material-symbols-outlined text-[20px] text-gray-400">chevron_right</span>
            </button>
          ))}
        </div>

        {/* Saved PGs preview */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="font-display text-base font-bold text-on-surface">Saved PGs</div>
            <button onClick={onSavedClick} className="text-sm font-semibold text-primary">View all →</button>
          </div>
          {savedIds.size === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">No saved PGs yet.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {listings.filter((l) => savedIds.has(l.id)).slice(0, 4).map((pg) => (
                <div key={pg.id} className="rounded-xl overflow-hidden border border-gray-100">
                  <div className="h-24 bg-surface-mid overflow-hidden">
                    {(pg.images ?? [])[0] && <img src={pg.images[0]} alt={pg.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="p-2">
                    <div className="text-xs font-semibold text-on-surface truncate">{pg.name}</div>
                    <div className="text-xs font-bold text-primary">₹{(pg.priceFrom ?? pg.price_from ?? 0).toLocaleString("en-IN")}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Logout */}
        <div className="bg-white rounded-2xl shadow-sm">
          <button onClick={handleSignOut} className="w-full py-4 text-center text-red-500 text-sm font-bold">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
