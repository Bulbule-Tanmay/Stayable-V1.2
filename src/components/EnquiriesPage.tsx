type Enquiry = {
  id: string;
  listingId: string;
  listingName: string;
  sentAt: string;
  status: "pending" | "replied" | "scheduled";
  lastMessage: string;
  phone: string;
  waMessage: string;
  image: string;
};

type Props = {
  onViewDetails: (id: string) => void;
  extraIds: string[];
  listings: any[];
};

const statusConfig = {
  replied: { label: "Replied", bg: "bg-emerald-100", text: "text-emerald-700", icon: "reply" },
  pending: { label: "Pending", bg: "bg-amber-100", text: "text-amber-700", icon: "schedule" },
  scheduled: { label: "Visit Scheduled", bg: "bg-blue-100", text: "text-blue-700", icon: "event_available" },
};

const WA_ICON = (
  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.299.144.347.491 1.2.534 1.288.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.861.174.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086.159.058 1.011.477 1.184.564.173.086.289.13.332.202.043.073.043.419-.101.824z" />
  </svg>
);

export default function EnquiriesPage({ onViewDetails, extraIds, listings }: Props) {
  const allEnquiries: Enquiry[] = extraIds.map((id, i) => {
    const listing = listings.find((l) => l.id === id);
    if (!listing) return null;
    return {
      id: `extra-${i}`,
      listingId: listing.id,
      listingName: listing.name,
      sentAt: "Just now",
      status: "pending" as const,
      lastMessage: "You requested a visit. Waiting for owner to confirm.",
      phone: listing.phone ?? "",
      waMessage: listing.wa_message ?? listing.waMessage ?? "",
      image: (listing.images ?? [])[0] ?? "",
    };
  }).filter(Boolean) as Enquiry[];

  return (
    <div className="flex flex-col w-full pb-28">
      <div className="px-4 py-3 flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-extrabold text-on-surface">Enquiries</h2>
          <p className="text-xs text-on-surface-muted">{allEnquiries.length} active conversations</p>
        </div>
        <span className="px-3 py-1 rounded-full bg-secondary text-white text-xs font-bold">{allEnquiries.length}</span>
      </div>

      {/* Info strip */}
      <div className="mx-4 mb-4 bg-surface-mid rounded-2xl px-4 py-3 flex items-center gap-3">
        <span className="material-symbols-outlined text-[24px] text-secondary">verified_user</span>
        <p className="text-xs text-on-surface font-medium leading-relaxed">
          All enquiries are direct — no middlemen. Chat with owners directly on WhatsApp.
        </p>
      </div>

      <div className="flex flex-col gap-3 px-3">
        {allEnquiries.map((enq) => {
          const cfg = statusConfig[enq.status];
          return (
            <div key={enq.id} className="bg-white rounded-2xl overflow-hidden shadow-sm">
              {/* Top row */}
              <div className="flex gap-3 p-4">
                <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-surface-mid">
                  <img src={enq.image} alt={enq.listingName} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-display text-sm font-bold text-on-surface truncate flex-1">{enq.listingName}</h4>
                    <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${cfg.bg} ${cfg.text}`}>
                      <span className="material-symbols-outlined text-[12px]">{cfg.icon}</span>
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-on-surface-muted mt-0.5">{enq.sentAt}</p>
                  <p className="text-xs text-on-surface mt-1 leading-relaxed line-clamp-2">{enq.lastMessage}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-12 gap-2 px-4 pb-4">
                <a
                  href={`https://wa.me/${enq.phone.replace("+", "")}?text=${enq.waMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="col-span-5 h-10 rounded-full bg-whatsapp text-white flex items-center justify-center gap-1.5 text-xs font-semibold"
                >
                  {WA_ICON}
                  Chat Now
                </a>
                <a
                  href={`tel:${enq.phone}`}
                  className="col-span-3 h-10 rounded-full bg-surface-mid text-on-surface flex items-center justify-center gap-1 text-xs font-semibold"
                >
                  <span className="material-symbols-outlined text-[16px]">call</span>
                  Call
                </a>
                <button
                  onClick={() => onViewDetails(enq.listingId)}
                  className="col-span-4 h-10 rounded-full bg-surface-low text-on-surface flex items-center justify-center gap-1 text-xs font-semibold"
                >
                  View
                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
