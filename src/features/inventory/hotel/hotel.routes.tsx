// src/features/inventory/hotel/hotel.routes.tsx

import { Routes, Route } from "react-router-dom";
import PermissionRoute from "../../../app/router/PermissionRoute";

import HotelListPage from "./pages/HotelListPage";
import HotelCreatePage from "./pages/HotelCreatePage";
import HotelEditPage from "./pages/HotelEditPage";

export default function HotelRoutes() {
  return (
    <Routes>
      <Route
        index
        element={
          <PermissionRoute menuId="inventory.hotels" action="can_view">
            <HotelListPage />
          </PermissionRoute>
        }
      />

      <Route
        path="create"
        element={
          <PermissionRoute menuId="inventory.hotels" action="can_create">
            <HotelCreatePage />
          </PermissionRoute>
        }
      />

      <Route
        path=":uuid/edit"
        element={
          <PermissionRoute menuId="inventory.hotels" action="can_edit">
            <HotelEditPage />
          </PermissionRoute>
        }
      />
    </Routes>
  );
}
