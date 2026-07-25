// src/features/settings/branch/branch.routes.tsx

import { Routes, Route } from "react-router-dom";
import PermissionRoute from "../../../app/router/PermissionRoute";

import BranchListPage from "./pages/BranchListPage";
import BranchCreatePage from "./pages/BranchCreatePage";
import BranchEditPage from "./pages/BranchEditPage";
import BranchViewPage from "./pages/BranchViewPage";

export default function BranchRoutes() {
  return (
    <Routes>
      <Route
        index
        element={
          <PermissionRoute menuId="settings.branch_master" action="can_view">
            <BranchListPage />
          </PermissionRoute>
        }
      />

      <Route
        path="create"
        element={
          <PermissionRoute menuId="settings.branch_master" action="can_create">
            <BranchCreatePage />
          </PermissionRoute>
        }
      />

      <Route
        path=":uuid"
        element={
          <PermissionRoute menuId="settings.branch_master" action="can_view">
            <BranchViewPage />
          </PermissionRoute>
        }
      />

      <Route
        path=":uuid/edit"
        element={
          <PermissionRoute menuId="settings.branch_master" action="can_edit">
            <BranchEditPage />
          </PermissionRoute>
        }
      />
    </Routes>
  );
}
