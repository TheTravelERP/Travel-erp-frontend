// src/features/settings/documentTemplates/documentTemplateConfig.routes.tsx

import { Routes, Route } from "react-router-dom";
import PermissionRoute from "../../../app/router/PermissionRoute";

import DocumentTemplateConfigListPage from "./pages/DocumentTemplateConfigListPage";
import DocumentTemplateConfigCreatePage from "./pages/DocumentTemplateConfigCreatePage";
import DocumentTemplateConfigEditPage from "./pages/DocumentTemplateConfigEditPage";

export default function DocumentTemplateConfigRoutes() {
  return (
    <Routes>
      <Route
        index
        element={
          <PermissionRoute menuId="settings.document_template_config" action="can_view">
            <DocumentTemplateConfigListPage />
          </PermissionRoute>
        }
      />

      <Route
        path="create"
        element={
          <PermissionRoute menuId="settings.document_template_config" action="can_create">
            <DocumentTemplateConfigCreatePage />
          </PermissionRoute>
        }
      />

      <Route
        path=":uuid/edit"
        element={
          <PermissionRoute menuId="settings.document_template_config" action="can_edit">
            <DocumentTemplateConfigEditPage />
          </PermissionRoute>
        }
      />
    </Routes>
  );
}
