// src/features/customer/customer.routes.tsx

import { Routes, Route } from "react-router-dom";
import PermissionRoute from "../../app/router/PermissionRoute";

import CustomerListPage from "./pages/CustomerListPage";
import CustomerCreatePage from "./pages/CustomerCreatePage";
import CustomerEditPage from "./pages/CustomerEditPage";
import CustomerViewPage from "./pages/CustomerViewPage";

export default function CustomerRoutes() {
  return (
    <Routes>
      <Route
        index
        element={
          <PermissionRoute menuId="crm.customers" action="can_view">
            <CustomerListPage />
          </PermissionRoute>
        }
      />

      <Route
        path="create"
        element={
          <PermissionRoute menuId="crm.customers" action="can_create">
            <CustomerCreatePage />
          </PermissionRoute>
        }
      />

      <Route
        path=":uuid"
        element={
          <PermissionRoute menuId="crm.customers" action="can_view">
            <CustomerViewPage />
          </PermissionRoute>
        }
      />

      <Route
        path=":uuid/edit"
        element={
          <PermissionRoute menuId="crm.customers" action="can_edit">
            <CustomerEditPage />
          </PermissionRoute>
        }
      />
    </Routes>
  );
}
