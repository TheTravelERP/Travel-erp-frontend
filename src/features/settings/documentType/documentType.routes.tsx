// src/features/settings/documentType/documentType.routes.tsx

import { Routes, Route } from "react-router-dom";
import PermissionRoute from "../../../app/router/PermissionRoute";

import DocumentTypeListPage from "./pages/DocumentTypeListPage";
import DocumentTypeCreatePage from "./pages/DocumentTypeCreatePage";
import DocumentTypeEditPage from "./pages/DocumentTypeEditPage";

export default function DocumentTypeRoutes() {
  return (
    <Routes>
      <Route
        index
        element={
          <PermissionRoute menuId="settings.document_type_master" action="can_view">
            <DocumentTypeListPage />
          </PermissionRoute>
        }
      />

      <Route
        path="create"
        element={
          <PermissionRoute menuId="settings.document_type_master" action="can_create">
            <DocumentTypeCreatePage />
          </PermissionRoute>
        }
      />

      <Route
        path=":uuid/edit"
        element={
          <PermissionRoute menuId="settings.document_type_master" action="can_edit">
            <DocumentTypeEditPage />
          </PermissionRoute>
        }
      />
    </Routes>
  );
}
