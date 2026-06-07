// src/app/router/PermissionRoute.tsx
import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { usePermission } from '../../hooks/usePermission';
import { useMenu } from '../../context/MenuContext';
import Loader from '../../components/common/Loader';

type PermissionAction =
  | 'can_view'
  | 'can_create'
  | 'can_edit'
  | 'can_delete'
  | 'can_export'
  | 'can_import'
  | 'can_print';

interface PermissionRouteProps {
  menuId: string;
  action?: PermissionAction;
  children: ReactNode;
}

export default function PermissionRoute({
  menuId,
  action = 'can_view',
  children,
}: PermissionRouteProps) {
  const location = useLocation();

  // 🔥 IMPORTANT
  const { loading } = useMenu();
  const permissions = usePermission(menuId);

  // 1️⃣ Wait until menu is loaded
  if (loading) {
    return <Loader />;
  }

  // 2️⃣ Permission check AFTER menu loaded
  if (!permissions[action]) {
    return (
      <Navigate
        to="/app/unauthorized"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  // 3️⃣ Permission OK
  return <>{children}</>;
}
