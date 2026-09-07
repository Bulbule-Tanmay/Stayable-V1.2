import { Outlet } from "react-router";
import { AuthProvider } from "./AuthContext";

export default function Root() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}
