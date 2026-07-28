// src/features/settings/eventAutomation/eventAutomation.routes.tsx

import { Routes, Route } from "react-router-dom";
import PermissionRoute from "../../../app/router/PermissionRoute";
import EventAutomationListPage from "./pages/EventAutomationListPage";

export default function EventAutomationRoutes() {
  return (
    <Routes>
      <Route
        index
        element={
          <PermissionRoute menuId="settings.event_automation" action="can_view">
            <EventAutomationListPage />
          </PermissionRoute>
        }
      />
    </Routes>
  );
}
