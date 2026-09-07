type Tab = "explore" | "saved" | "qr" | "enquiries" | "profile";

type Props = {
  active: Tab;
  onChange: (tab: Tab) => void;
  savedCount: number;
  enquiryCount: number;
};

const tabs = [
  { id: "explore" as Tab, icon: "explore", label: "Explore" },
  { id: "saved" as Tab, icon: "bookmark", label: "Saved" },
  { id: "qr" as Tab, icon: "qr_code_scanner", label: "QR Scan" },
  { id: "enquiries" as Tab, icon: "forum", label: "Enquiries" },
  { id: "profile" as Tab, icon: "person", label: "Profile" },
];

export default function BottomNav({ active, onChange, savedCount, enquiryCount }: Props) {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-xl shadow-[0_-4px_20px_rgba(15,23,42,0.06)]">
      <div className="flex justify-around items-center h-16 px-1">
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          const isQr = tab.id === "qr";
          const badge = tab.id === "saved" ? savedCount : tab.id === "enquiries" ? enquiryCount : 0;

          if (isQr) {
            return (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className="flex flex-col items-center justify-center min-w-[56px] h-11 gap-0.5 -mt-3"
              >
                <div className="w-11 h-11 rounded-full bg-primary-dark text-white flex items-center justify-center shadow-[0_4px_12px_rgba(15,23,42,0.25)] transition-transform active:scale-95">
                  <span className="material-symbols-outlined text-[24px]">{tab.icon}</span>
                </div>
                <span className="text-[10px] font-semibold text-on-surface-muted">{tab.label}</span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`flex flex-col items-center justify-center min-w-[56px] h-11 gap-0.5 transition-colors ${
                isActive ? "text-secondary" : "text-on-surface-muted"
              }`}
            >
              <div className="relative flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-[22px]"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {tab.icon}
                </span>
                {badge > 0 && (
                  <span className="absolute -top-1 -right-2.5 min-w-[16px] h-4 px-1 bg-secondary text-white rounded-full text-[10px] font-bold leading-4 flex items-center justify-center">
                    {badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-semibold ${isActive ? "text-secondary" : ""}`}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
