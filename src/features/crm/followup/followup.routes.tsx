// src/features/crm/followup/followup.routes.tsx

import { Routes, Route } from "react-router-dom";
import PermissionRoute from "../../../app/router/PermissionRoute";

import FollowupListPage from "./pages/FollowupListPage";
import FollowupCreatePage from "./pages/FollowupCreatePage";
import FollowupEditPage from "./pages/FollowupEditPage";
import FollowupViewPage from "./pages/FollowupViewPage";

export default function FollowupRoutes() {
  return (
    <Routes>
      <Route
        index
        element={
          <PermissionRoute menuId="crm.followups" action="can_view">
            <FollowupListPage />
          </PermissionRoute>
        }
      />

      <Route
        path="create"
        element={
          <PermissionRoute menuId="crm.followups" action="can_create">
            <FollowupCreatePage />
          </PermissionRoute>
        }
      />

      <Route
        path=":uuid"
        element={
          <PermissionRoute menuId="crm.followups" action="can_view">
            <FollowupViewPage />
          </PermissionRoute>
        }
      />

      <Route
        path=":uuid/edit"
        element={
          <PermissionRoute menuId="crm.followups" action="can_edit">
            <FollowupEditPage />
          </PermissionRoute>
        }
      />
    </Routes>
  );
}
