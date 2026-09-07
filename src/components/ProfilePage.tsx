type Props = {
  savedCount: number;
  enquiryCount: number;
  onOwnerPortal?: () => void;
};

const settingsItems = [
  { icon: "notifications", label: "Notifications", sub: "Manage alerts for new listings", action: true },
  { icon: "tune", label: "Search Preferences", sub: "Budget, distance, amenities", action: true },
  { icon: "help_outline", label: "Help & Support", sub: "FAQs, chat with our team", action: true },
  { icon: "info_outline", label: "About Stayable", sub: "Version 2.1.0 • Zero-brokerage platform", action: false },
  { icon: "logout", label: "Log Out", sub: "Signed in as Aryan Kumar", action: false, danger: true },
];

export default function ProfilePage({ savedCount, enquiryCount, onOwnerPortal }: Props) {
  return (
    <div className="flex flex-col w-full pb-28">
      {/* Hero card */}
      <div className="mx-4 mt-4 bg-gradient-to-br from-primary to-primary-dark rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -translate-y-8 translate-x-8" />
        <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/5 translate-y-8 -translate-x-8" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-300 to-blue-500 flex items-center justify-center text-white font-extrabold text-2xl shadow-inner font-display">
              AK
            </div>
            <div>
              <h2 className="font-display text-xl font-extrabold">Aryan Kumar</h2>
              <p className="text-blue-200 text-sm">aryan.kumar@mitwpu.edu.in</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="material-symbols-outlined text-[14px] text-blue-300">school</span>
                <span className="text-xs text-blue-200">MIT-WPU, Pune • 2nd Year CSE</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "PGs Viewed", value: "12" },
              { label: "Saved", value: String(savedCount) },
              { label: "Enquiries", value: String(enquiryCount) },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 rounded-xl py-2 flex flex-col items-center">
                <span className="font-display text-2xl font-extrabold">{stat.value}</span>
                <span className="text-[10px] text-blue-200 font-medium">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Campus badge */}
      <div className="mx-4 mt-3 bg-surface-low rounded-2xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-secondary text-white flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="font-display text-sm font-bold text-on-surface">MIT-WPU, Kothrud</span>
            <span className="material-symbols-outlined text-[15px] text-verified" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
          </div>
          <p className="text-xs text-on-surface-muted">Scanned via campus QR • Active session</p>
        </div>
        <button className="text-secondary text-xs font-semibold">Change</button>
      </div>

      {/* Owner portal CTA */}
      {onOwnerPortal && (
        <button
          onClick={onOwnerPortal}
          className="mx-4 mt-3 w-[calc(100%-2rem)] bg-gradient-to-r from-primary to-secondary text-white rounded-2xl p-4 flex items-center gap-3 shadow-lg active:scale-[0.98] transition-transform"
        >
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-[22px]">apartment</span>
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-bold">List Your PG or Flat</p>
            <p className="text-xs text-white/70">Owner portal • Manage listings & enquiries</p>
          </div>
          <span className="material-symbols-outlined text-[20px]">chevron_right</span>
        </button>
      )}

      {/* Settings list */}
      <div className="mx-4 mt-3 bg-white rounded-2xl overflow-hidden shadow-sm divide-y divide-surface-high">
        {settingsItems.map((item) => (
          <button
            key={item.label}
            className={`w-full flex items-center gap-3 px-4 py-4 text-left active:bg-surface-low transition-colors ${
              item.danger ? "opacity-80" : ""
            }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${item.danger ? "bg-red-50" : "bg-surface-low"}`}>
              <span className={`material-symbols-outlined text-[20px] ${item.danger ? "text-red-500" : "text-secondary"}`}>
                {item.icon}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${item.danger ? "text-red-500" : "text-on-surface"}`}>{item.label}</p>
              <p className="text-xs text-on-surface-muted truncate">{item.sub}</p>
            </div>
            {item.action && (
              <span className="material-symbols-outlined text-[20px] text-on-surface-muted">chevron_right</span>
            )}
          </button>
        ))}
      </div>

      {/* Stayable brand footer */}
      <div className="flex flex-col items-center gap-1 mt-6 px-4">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center">
            <svg viewBox="0 0 28 28" className="w-4 h-4">
              <path d="M8 18L14 7L20 18" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M10.5 14.5H17.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <span className="font-display text-sm font-bold text-on-surface">
            Stay<span className="text-primary">able</span>
          </span>
        </div>
        <p className="text-[11px] text-on-surface-muted">Zero brokerage • Student-first platform</p>
      </div>
    </div>
  );
}
