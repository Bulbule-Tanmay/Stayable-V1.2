import ListingCard from "./ListingCard";

type Props = {
  savedIds: Set<string>;
  onSaveToggle: (id: string) => void;
  onViewDetails: (id: string) => void;
  listings: any[];
};

export default function SavedPage({ savedIds, onSaveToggle, onViewDetails, listings }: Props) {
  const saved = listings.filter((l) => savedIds.has(l.id));

  return (
    <div className="flex flex-col w-full pt-1 pb-28">
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-extrabold text-on-surface">Saved</h2>
          <p className="text-xs text-on-surface-muted">
            {saved.length > 0 ? `${saved.length} saved accommodation${saved.length > 1 ? "s" : ""}` : "None saved yet"}
          </p>
        </div>
        {saved.length > 0 && (
          <span className="px-3 py-1 rounded-full bg-secondary text-white text-xs font-bold">{saved.length}</span>
        )}
      </div>

      {saved.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 px-8 text-center">
          <div className="w-20 h-20 rounded-full bg-surface-mid flex items-center justify-center">
            <span className="material-symbols-outlined text-[40px] text-on-surface-muted">bookmark_border</span>
          </div>
          <h3 className="font-display text-lg font-bold text-on-surface">No saved listings yet</h3>
          <p className="text-sm text-on-surface-muted leading-relaxed">
            Tap the heart icon on any PG or flat to save it here for quick access later.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 px-3">
          {saved.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              isSaved={true}
              onSaveToggle={onSaveToggle}
              onViewDetails={onViewDetails}
              compact={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}
