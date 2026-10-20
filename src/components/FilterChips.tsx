type Props = {
  active: string[];
  onChange: (filters: string[]) => void;
};

const filters = [
  { id: "all", label: "All Budgets", icon: "tune" },
  { id: "budget", label: "< ₹8,000", icon: "" },
  { id: "single", label: "Single Room", icon: "" },
  { id: "double", label: "Double Sharing", icon: "" },
  { id: "food", label: "Food Included", icon: "restaurant" },
  { id: "ac", label: "AC", icon: "ac_unit" },
  { id: "walking", label: "Walking (<10m)", icon: "directions_walk" },
];

export default function FilterChips({ active, onChange }: Props) {
  const toggle = (id: string) => {
    if (id === "all") {
      onChange([]);
      return;
    }
    const next = active.includes(id) ? active.filter((f) => f !== id) : [...active, id];
    onChange(next);
  };

  return (
    <div className="w-full overflow-x-auto py-2 px-3 flex items-center gap-2">
      {filters.map((f) => {
        const isActive = f.id === "all" ? active.length === 0 : active.includes(f.id);
        return (
          <button
            key={f.id}
            onClick={() => toggle(f.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 flex items-center gap-1 transition-all ${
              isActive
                ? "bg-primary-dark text-white shadow-sm"
                : "bg-white text-on-surface shadow-sm hover:bg-surface-low"
            }`}
          >
            {f.icon && (
              <span
                className="material-symbols-outlined text-[14px]"
                style={{ fontVariationSettings: f.id === "walking" ? "'FILL' 1" : "'FILL' 0" }}
              >
                {f.icon}
              </span>
            )}
            {f.label}
          </button>
        );
      })}
    </div>
  );
}
