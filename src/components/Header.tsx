import StayableLogo from "./StayableLogo"

import { useAuth } from "../app/AuthContext"

type Props = {
  campus: string

  onCampusChange?: () => void
}

export default function Header({ campus, onCampusChange }: Props) {
  const { user, profile } = useAuth()

  const displayName =
    profile?.full_name ?? user?.email?.split("@")[0] ?? "Student"

  const initials = displayName
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(15,23,42,0.06)]">
      <div className="h-16 px-3 flex items-center justify-between gap-2">
        <StayableLogo className="h-8 w-auto flex-shrink-0" />

        <button
          onClick={onCampusChange}
          className="flex items-center gap-1.5 h-11 px-3 bg-surface-low rounded-full transition-colors active:bg-surface-mid flex-1 max-w-[180px]"
        >
          <span className="material-symbols-outlined text-secondary text-[18px]">
            school
          </span>
          <span className="text-xs font-semibold text-on-surface truncate">
            {campus}
          </span>
          <span className="material-symbols-outlined text-outline text-[16px]">
            unfold_more
          </span>
        </button>

        <button className="w-11 h-11 flex items-center justify-end rounded-full focus:outline-none flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center ring-2 ring-surface-high">
            <span className="text-white text-xs font-bold">{initials}</span>
          </div>
        </button>
      </div>
    </header>
  )
}
