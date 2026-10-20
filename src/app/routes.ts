import { createBrowserRouter } from "react-router";
import Root, { HydrateFallback } from "./Root";

const lazyComponent = (load: () => Promise<{ default: React.ComponentType }>) => async () => ({
  Component: (await load()).default,
});

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    HydrateFallback,
    children: [
      { index: true, lazy: lazyComponent(() => import("./LandingPage")) },
      { path: "app", lazy: lazyComponent(() => import("./student/StudentApp")) },
      {
        path: "owner",
        lazy: lazyComponent(() => import("./owner/OwnerLayout")),
        children: [
          { index: true, lazy: lazyComponent(() => import("./owner/OwnerOnboarding")) },
          { path: "dashboard", lazy: lazyComponent(() => import("./owner/OwnerDashboard")) },
          { path: "listings", lazy: lazyComponent(() => import("./owner/OwnerListings")) },
          { path: "listings/new", lazy: lazyComponent(() => import("./owner/OwnerListingForm")) },
          { path: "listings/:id/edit", lazy: lazyComponent(() => import("./owner/OwnerListingForm")) },
          { path: "enquiries", lazy: lazyComponent(() => import("./owner/OwnerEnquiries")) },
          { path: "subscription", lazy: lazyComponent(() => import("./owner/OwnerSubscription")) },
        ],
      },
      {
        path: "admin",
        lazy: lazyComponent(() => import("./admin/AdminLayout")),
        children: [
          { index: true, lazy: lazyComponent(() => import("./admin/AdminLogin")) },
          { path: "dashboard", lazy: lazyComponent(() => import("./admin/AdminDashboard")) },
          { path: "owners", lazy: lazyComponent(() => import("./admin/AdminOwners")) },
          { path: "listings", lazy: lazyComponent(() => import("./admin/AdminListings")) },
        ],
      },
    ],
  },
]);
