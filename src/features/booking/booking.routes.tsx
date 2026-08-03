// src/features/booking/booking.routes.tsx

import { Routes, Route } from "react-router-dom";
import PermissionRoute from "../../app/router/PermissionRoute";

import BookingListPage from "./pages/BookingListPage";
import BookingCreatePage from "./pages/BookingCreatePage";
import BookingEditPage from "./pages/BookingEditPage";
import BookingViewPage from "./pages/BookingViewPage";

export default function BookingRoutes() {
  return (
    <Routes>
      <Route
        index
        element={
          <PermissionRoute menuId="packages.bookings" action="can_view">
            <BookingListPage />
          </PermissionRoute>
        }
      />
      <Route
        path="create"
        element={
          <PermissionRoute menuId="packages.bookings" action="can_create">
            <BookingCreatePage />
          </PermissionRoute>
        }
      />
      <Route
        path=":uuid"
        element={
          <PermissionRoute menuId="packages.bookings" action="can_view">
            <BookingViewPage />
          </PermissionRoute>
        }
      />
      <Route
        path=":uuid/edit"
        element={
          <PermissionRoute menuId="packages.bookings" action="can_edit">
            <BookingEditPage />
          </PermissionRoute>
        }
      />
    </Routes>
  );
}
