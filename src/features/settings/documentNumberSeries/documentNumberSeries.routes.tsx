// src/features/settings/documentNumberSeries/documentNumberSeries.routes.tsx

import { Routes, Route } from "react-router-dom";
import PermissionRoute from "../../../app/router/PermissionRoute";

import DocumentNumberSeriesListPage from "./pages/DocumentNumberSeriesListPage";
import DocumentNumberSeriesCreatePage from "./pages/DocumentNumberSeriesCreatePage";
import DocumentNumberSeriesEditPage from "./pages/DocumentNumberSeriesEditPage";

export default function DocumentNumberSeriesRoutes() {
  return (
    <Routes>
      <Route
        index
        element={
          <PermissionRoute menuId="settings.doc_numbering" action="can_view">
            <DocumentNumberSeriesListPage />
          </PermissionRoute>
        }
      />

      <Route
        path="create"
        element={
          <PermissionRoute menuId="settings.doc_numbering" action="can_create">
            <DocumentNumberSeriesCreatePage />
          </PermissionRoute>
        }
      />

      <Route
        path=":uuid/edit"
        element={
          <PermissionRoute menuId="settings.doc_numbering" action="can_edit">
            <DocumentNumberSeriesEditPage />
          </PermissionRoute>
        }
      />
    </Routes>
  );
}
