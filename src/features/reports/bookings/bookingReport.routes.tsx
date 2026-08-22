// src/features/reports/bookings/bookingReport.routes.tsx

import { Routes, Route } from "react-router-dom";
import PermissionRoute from "../../../app/router/PermissionRoute";
import BookingReportPage from "./pages/BookingReportPage";

export default function BookingReportRoutes() {
  return (
    <Routes>
      <Route
        index
        element={
          <PermissionRoute menuId="reports.bookings" action="can_view">
            <BookingReportPage />
          </PermissionRoute>
        }
      />
    </Routes>
  );
}
