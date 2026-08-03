// src/features/settings/termsCondition/termsCondition.routes.tsx

import { Routes, Route } from "react-router-dom";
import PermissionRoute from "../../../app/router/PermissionRoute";

import TermsConditionListPage from "./pages/TermsConditionListPage";
import TermsConditionCreatePage from "./pages/TermsConditionCreatePage";
import TermsConditionEditPage from "./pages/TermsConditionEditPage";
import TermsConditionViewPage from "./pages/TermsConditionViewPage";

export default function TermsConditionRoutes() {
  return (
    <Routes>
      <Route
        index
        element={
          <PermissionRoute menuId="settings.terms_conditions_master" action="can_view">
            <TermsConditionListPage />
          </PermissionRoute>
        }
      />

      <Route
        path="create"
        element={
          <PermissionRoute menuId="settings.terms_conditions_master" action="can_create">
            <TermsConditionCreatePage />
          </PermissionRoute>
        }
      />

      <Route
        path=":uuid"
        element={
          <PermissionRoute menuId="settings.terms_conditions_master" action="can_view">
            <TermsConditionViewPage />
          </PermissionRoute>
        }
      />

      <Route
        path=":uuid/edit"
        element={
          <PermissionRoute menuId="settings.terms_conditions_master" action="can_edit">
            <TermsConditionEditPage />
          </PermissionRoute>
        }
      />
    </Routes>
  );
}
