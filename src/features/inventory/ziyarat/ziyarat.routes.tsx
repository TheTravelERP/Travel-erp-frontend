// src/features/inventory/ziyarat/ziyarat.routes.tsx

import { Routes, Route } from "react-router-dom";
import PermissionRoute from "../../../app/router/PermissionRoute";

import ZiyaratListPage from "./pages/ZiyaratListPage";
import ZiyaratCreatePage from "./pages/ZiyaratCreatePage";
import ZiyaratEditPage from "./pages/ZiyaratEditPage";

export default function ZiyaratRoutes() {
  return (
    <Routes>
      <Route
        index
        element={
          <PermissionRoute menuId="inventory.ziyarat" action="can_view">
            <ZiyaratListPage />
          </PermissionRoute>
        }
      />

      <Route
        path="create"
        element={
          <PermissionRoute menuId="inventory.ziyarat" action="can_create">
            <ZiyaratCreatePage />
          </PermissionRoute>
        }
      />

      <Route
        path=":uuid/edit"
        element={
          <PermissionRoute menuId="inventory.ziyarat" action="can_edit">
            <ZiyaratEditPage />
          </PermissionRoute>
        }
      />
    </Routes>
  );
}
