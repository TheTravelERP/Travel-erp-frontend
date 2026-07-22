// src/features/inventory/guide/guide.routes.tsx

import { Routes, Route } from "react-router-dom";
import PermissionRoute from "../../../app/router/PermissionRoute";

import GuideListPage from "./pages/GuideListPage";
import GuideCreatePage from "./pages/GuideCreatePage";
import GuideEditPage from "./pages/GuideEditPage";

export default function GuideRoutes() {
  return (
    <Routes>
      <Route
        index
        element={
          <PermissionRoute menuId="inventory.guides" action="can_view">
            <GuideListPage />
          </PermissionRoute>
        }
      />

      <Route
        path="create"
        element={
          <PermissionRoute menuId="inventory.guides" action="can_create">
            <GuideCreatePage />
          </PermissionRoute>
        }
      />

      <Route
        path=":uuid/edit"
        element={
          <PermissionRoute menuId="inventory.guides" action="can_edit">
            <GuideEditPage />
          </PermissionRoute>
        }
      />
    </Routes>
  );
}
