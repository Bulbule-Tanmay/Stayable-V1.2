import { Outlet } from "react-router";
import { AuthProvider } from "./AuthContext";

export function HydrateFallback() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-surface-high border-t-primary animate-spin" />
        <span className="text-sm font-semibold text-on-surface-muted">Loading Stayable…</span>
      </div>
    </div>
  );
}

export default function Root() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}
