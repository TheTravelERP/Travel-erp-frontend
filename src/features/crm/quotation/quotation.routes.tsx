// src/features/crm/quotation/quotation.routes.tsx

import { Routes, Route } from "react-router-dom";
import PermissionRoute from "../../../app/router/PermissionRoute";

import QuotationListPage from "./pages/QuotationListPage";
import QuotationCreatePage from "./pages/QuotationCreatePage";
import QuotationEditPage from "./pages/QuotationEditPage";
import QuotationViewPage from "./pages/QuotationViewPage";

export default function QuotationRoutes() {
  return (
    <Routes>
      <Route
        index
        element={
          <PermissionRoute menuId="crm.quotations" action="can_view">
            <QuotationListPage />
          </PermissionRoute>
        }
      />
      <Route
        path="create"
        element={
          <PermissionRoute menuId="crm.quotations" action="can_create">
            <QuotationCreatePage />
          </PermissionRoute>
        }
      />
      <Route
        path=":uuid"
        element={
          <PermissionRoute menuId="crm.quotations" action="can_view">
            <QuotationViewPage />
          </PermissionRoute>
        }
      />
      <Route
        path=":uuid/edit"
        element={
          <PermissionRoute menuId="crm.quotations" action="can_edit">
            <QuotationEditPage />
          </PermissionRoute>
        }
      />
    </Routes>
  );
}
