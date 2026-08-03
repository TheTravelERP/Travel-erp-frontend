// src/features/departure/departure.routes.tsx

import { Routes, Route } from "react-router-dom";
import PermissionRoute from "../../app/router/PermissionRoute";

import DepartureListPage from "./pages/DepartureListPage";
import DepartureCreatePage from "./pages/DepartureCreatePage";
import DepartureEditPage from "./pages/DepartureEditPage";
import DepartureViewPage from "./pages/DepartureViewPage";

export default function DepartureRoutes() {
  return (
    <Routes>
      <Route
        index
        element={
          <PermissionRoute menuId="packages.departures" action="can_view">
            <DepartureListPage />
          </PermissionRoute>
        }
      />

      <Route
        path="create"
        element={
          <PermissionRoute menuId="packages.departures" action="can_create">
            <DepartureCreatePage />
          </PermissionRoute>
        }
      />

      <Route
        path=":uuid"
        element={
          <PermissionRoute menuId="packages.departures" action="can_view">
            <DepartureViewPage />
          </PermissionRoute>
        }
      />

      <Route
        path=":uuid/edit"
        element={
          <PermissionRoute menuId="packages.departures" action="can_edit">
            <DepartureEditPage />
          </PermissionRoute>
        }
      />
    </Routes>
  );
}
