// src/features/settings/communicationProviders/communicationProvider.routes.tsx

import { Routes, Route } from "react-router-dom";
import PermissionRoute from "../../../app/router/PermissionRoute";

import CommunicationProviderListPage from "./pages/CommunicationProviderListPage";
import CommunicationProviderCreatePage from "./pages/CommunicationProviderCreatePage";
import CommunicationProviderEditPage from "./pages/CommunicationProviderEditPage";

export default function CommunicationProviderRoutes() {
  return (
    <Routes>
      <Route
        index
        element={
          <PermissionRoute menuId="settings.communication_settings" action="can_view">
            <CommunicationProviderListPage />
          </PermissionRoute>
        }
      />
      <Route
        path="create"
        element={
          <PermissionRoute menuId="settings.communication_settings" action="can_create">
            <CommunicationProviderCreatePage />
          </PermissionRoute>
        }
      />
      <Route
        path=":uuid/edit"
        element={
          <PermissionRoute menuId="settings.communication_settings" action="can_edit">
            <CommunicationProviderEditPage />
          </PermissionRoute>
        }
      />
    </Routes>
  );
}
