import { useState } from "react";
import { useNavigate } from "react-router";
import StayableLogo from "./StayableLogo";
import AuthModal from "../app/AuthModal";
import { useAuth } from "../app/AuthContext";
import { signOut } from "../lib/auth";

type Props = {
  activeSegment?: "pgs" | "flats";
  onSegmentChange?: (s: "pgs" | "flats") => void;
  savedCount?: number;
  onSavedClick?: () => void;
  campus?: string;
  onCampusChange?: () => void;
};

export default function Header({ activeSegment, onSegmentChange, savedCount = 0, onSavedClick, onCampusChange }: Props) {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  const initials = ((profile?.full_name ?? user?.email ?? "S")
    .split(/\s+/)
    .map((p: string) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()) || "S";

  const handleSignOut = async () => {
    await signOut().catch(() => {});
    navigate("/");
  };

  return (
    <>
    <header className="fixed top-0 inset-x-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <button onClick={() => navigate("/")} className="flex-shrink-0">
          <StayableLogo className="h-8 w-auto" />
        </button>
        <nav className="flex items-center gap-6">
          <button
            onClick={() => { onSegmentChange?.("pgs"); onCampusChange?.(); }}
            className={`text-sm font-medium transition-colors ${activeSegment === "pgs" || activeSegment === undefined ? "text-primary font-semibold" : "text-gray-600 hover:text-primary"}`}
          >
            Find PG
          </button>
          <button
            onClick={() => onSegmentChange?.("flats")}
            className={`text-sm font-medium transition-colors ${activeSegment === "flats" ? "text-primary font-semibold" : "text-gray-600 hover:text-primary"}`}
          >
            Flats
          </button>
          <button
            onClick={onSavedClick}
            className="relative text-sm font-medium text-gray-600 hover:text-primary transition-colors"
          >
            Saved
            {savedCount > 0 && (
              <span className="absolute -top-2 -right-3 w-4 h-4 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {savedCount}
              </span>
            )}
          </button>
          <button onClick={() => navigate("/owner/dashboard")} className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">Owner Login</button>
          <button
            onClick={user ? handleSignOut : () => setShowAuth(true)}
            className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
          >
            {initials}
          </button>
        </nav>
      </div>
    </header>
    {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}
