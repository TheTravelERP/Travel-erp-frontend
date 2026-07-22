// src/features/inventory/transportCompany/transportCompany.routes.tsx

import { Routes, Route } from "react-router-dom";
import PermissionRoute from "../../../app/router/PermissionRoute";

import TransportCompanyListPage from "./pages/TransportCompanyListPage";
import TransportCompanyCreatePage from "./pages/TransportCompanyCreatePage";
import TransportCompanyEditPage from "./pages/TransportCompanyEditPage";

export default function TransportCompanyRoutes() {
  return (
    <Routes>
      <Route
        index
        element={
          <PermissionRoute menuId="inventory.vendors" action="can_view">
            <TransportCompanyListPage />
          </PermissionRoute>
        }
      />

      <Route
        path="create"
        element={
          <PermissionRoute menuId="inventory.vendors" action="can_create">
            <TransportCompanyCreatePage />
          </PermissionRoute>
        }
      />

      <Route
        path=":uuid/edit"
        element={
          <PermissionRoute menuId="inventory.vendors" action="can_edit">
            <TransportCompanyEditPage />
          </PermissionRoute>
        }
      />
    </Routes>
  );
}
