// src/features/reports/travelers/travelerReport.routes.tsx

import { Routes, Route } from "react-router-dom";
import PermissionRoute from "../../../app/router/PermissionRoute";
import TravelerReportPage from "./pages/TravelerReportPage";

export default function TravelerReportRoutes() {
  return (
    <Routes>
      <Route
        index
        element={
          <PermissionRoute menuId="reports.travelers" action="can_view">
            <TravelerReportPage />
          </PermissionRoute>
        }
      />
    </Routes>
  );
}
