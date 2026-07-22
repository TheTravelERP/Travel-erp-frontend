// src/features/settings/users/users.routes.tsx
import { Routes, Route } from 'react-router-dom';
import PermissionRoute from '../../../app/router/PermissionRoute';

import UsersListPage from './pages/UsersListPage';
import UserCreatePage from './pages/UserCreatePage';
import UserEditPage from './pages/UserEditPage';

export default function UsersRoutes() {
  return (
    <Routes>
      <Route
        index
        element={
          <PermissionRoute menuId="settings.users" action="can_view">
            <UsersListPage />
          </PermissionRoute>
        }
      />

      <Route
        path="create"
        element={
          <PermissionRoute menuId="settings.users" action="can_create">
            <UserCreatePage />
          </PermissionRoute>
        }
      />

      <Route
        path=":uuid/edit"
        element={
          <PermissionRoute menuId="settings.users" action="can_edit">
            <UserEditPage />
          </PermissionRoute>
        }
      />
    </Routes>
  );
}
