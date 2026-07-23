// src/features/inventory/inventoryStock/inventoryStock.routes.tsx

import { Routes, Route } from "react-router-dom";
import PermissionRoute from "../../../app/router/PermissionRoute";

import InventoryStockListPage from "./pages/InventoryStockListPage";
import InventoryStockCreatePage from "./pages/InventoryStockCreatePage";
import InventoryStockEditPage from "./pages/InventoryStockEditPage";
import InventoryStockViewPage from "./pages/InventoryStockViewPage";

export default function InventoryStockRoutes() {
  return (
    <Routes>
      <Route
        index
        element={
          <PermissionRoute menuId="inventory.stock" action="can_view">
            <InventoryStockListPage />
          </PermissionRoute>
        }
      />

      <Route
        path="create"
        element={
          <PermissionRoute menuId="inventory.stock" action="can_create">
            <InventoryStockCreatePage />
          </PermissionRoute>
        }
      />

      <Route
        path=":uuid"
        element={
          <PermissionRoute menuId="inventory.stock" action="can_view">
            <InventoryStockViewPage />
          </PermissionRoute>
        }
      />

      <Route
        path=":uuid/edit"
        element={
          <PermissionRoute menuId="inventory.stock" action="can_edit">
            <InventoryStockEditPage />
          </PermissionRoute>
        }
      />
    </Routes>
  );
}
