// src/features/enquiry/enquiry.routes.tsx

import { Routes, Route } from "react-router-dom";
import PermissionRoute from "../../app/router/PermissionRoute";

import EnquiryListPage from "./pages/EnquiryListPage";
import EnquiryCreatePage from "./pages/EnquiryCreatePage";
import EnquiryEditPage from "./pages/EnquiryEditPage";
import EnquiryViewPage from "./pages/EnquiryViewPage";

export default function EnquiryRoutes() {
  return (
    <Routes>
      <Route
        index
        element={
          <PermissionRoute menuId="enquiries" action="can_view">
            <EnquiryListPage />
          </PermissionRoute>
        }
      />

      <Route
        path="create"
        element={
          <PermissionRoute menuId="enquiries" action="can_create">
            <EnquiryCreatePage />
          </PermissionRoute>
        }
      />

      <Route
        path=":id"
        element={
          <PermissionRoute menuId="enquiries" action="can_view">
            <EnquiryViewPage />
          </PermissionRoute>
        }
      />

      <Route
        path=":id/edit"
        element={
          <PermissionRoute menuId="enquiries" action="can_edit">
            <EnquiryEditPage />
          </PermissionRoute>
        }
      />
    </Routes>
  );
}
