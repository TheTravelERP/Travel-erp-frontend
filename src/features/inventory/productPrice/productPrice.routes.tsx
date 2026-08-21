// src/features/inventory/productPrice/productPrice.routes.tsx

import { Routes, Route } from "react-router-dom";
import PermissionRoute from "../../../app/router/PermissionRoute";

import ProductPriceListPage from "./pages/ProductPriceListPage";
import ProductPriceCreatePage from "./pages/ProductPriceCreatePage";
import ProductPriceEditPage from "./pages/ProductPriceEditPage";
import ProductPriceViewPage from "./pages/ProductPriceViewPage";

export default function ProductPriceRoutes() {
  return (
    <Routes>
      <Route
        index
        element={
          <PermissionRoute menuId="inventory.product_price_list" action="can_view">
            <ProductPriceListPage />
          </PermissionRoute>
        }
      />

      <Route
        path="create"
        element={
          <PermissionRoute menuId="inventory.product_price_list" action="can_create">
            <ProductPriceCreatePage />
          </PermissionRoute>
        }
      />

      <Route
        path=":uuid"
        element={
          <PermissionRoute menuId="inventory.product_price_list" action="can_view">
            <ProductPriceViewPage />
          </PermissionRoute>
        }
      />

      <Route
        path=":uuid/edit"
        element={
          <PermissionRoute menuId="inventory.product_price_list" action="can_edit">
            <ProductPriceEditPage />
          </PermissionRoute>
        }
      />
    </Routes>
  );
}
