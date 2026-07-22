// src/features/inventory/airline/airline.routes.tsx

import { Routes, Route } from "react-router-dom";
import PermissionRoute from "../../../app/router/PermissionRoute";

import AirlineListPage from "./pages/AirlineListPage";
import AirlineCreatePage from "./pages/AirlineCreatePage";
import AirlineEditPage from "./pages/AirlineEditPage";

export default function AirlineRoutes() {
  return (
    <Routes>
      <Route
        index
        element={
          <PermissionRoute menuId="inventory.airlines" action="can_view">
            <AirlineListPage />
          </PermissionRoute>
        }
      />

      <Route
        path="create"
        element={
          <PermissionRoute menuId="inventory.airlines" action="can_create">
            <AirlineCreatePage />
          </PermissionRoute>
        }
      />

      <Route
        path=":uuid/edit"
        element={
          <PermissionRoute menuId="inventory.airlines" action="can_edit">
            <AirlineEditPage />
          </PermissionRoute>
        }
      />
    </Routes>
  );
}
