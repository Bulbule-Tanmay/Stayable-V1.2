import { createBrowserRouter } from "react-router";
import Root from "./Root";
import LandingPage from "./LandingPage";
import StudentApp from "./student/StudentApp";
import OwnerLayout from "./owner/OwnerLayout";
import OwnerOnboarding from "./owner/OwnerOnboarding";
import OwnerDashboard from "./owner/OwnerDashboard";
import OwnerListings from "./owner/OwnerListings";
import OwnerListingForm from "./owner/OwnerListingForm";
import OwnerEnquiries from "./owner/OwnerEnquiries";
import OwnerSubscription from "./owner/OwnerSubscription";
import AdminLayout from "./admin/AdminLayout";
import AdminLogin from "./admin/AdminLogin";
import AdminDashboard from "./admin/AdminDashboard";
import AdminOwners from "./admin/AdminOwners";
import AdminListings from "./admin/AdminListings";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: LandingPage },
      { path: "app", Component: StudentApp },
      {
        path: "owner",
        Component: OwnerLayout,
        children: [
          { index: true, Component: OwnerOnboarding },
          { path: "dashboard", Component: OwnerDashboard },
          { path: "listings", Component: OwnerListings },
          { path: "listings/new", Component: OwnerListingForm },
          { path: "listings/:id/edit", Component: OwnerListingForm },
          { path: "enquiries", Component: OwnerEnquiries },
          { path: "subscription", Component: OwnerSubscription },
        ],
      },
      {
        path: "admin",
        Component: AdminLayout,
        children: [
          { index: true, Component: AdminLogin },
          { path: "dashboard", Component: AdminDashboard },
          { path: "owners", Component: AdminOwners },
          { path: "listings", Component: AdminListings },
        ],
      },
    ],
  },
]);
