// src/features/tasks/tasks.routes.tsx

import { Routes, Route } from "react-router-dom";
import PermissionRoute from "../../app/router/PermissionRoute";

import TaskMyListPage from "./pages/TaskMyListPage";
import TaskTeamListPage from "./pages/TaskTeamListPage";
import TaskCalendarPage from "./pages/TaskCalendarPage";
import TaskCreatePage from "./pages/TaskCreatePage";
import TaskEditPage from "./pages/TaskEditPage";
import TaskViewPage from "./pages/TaskViewPage";

export default function TaskRoutes() {
  return (
    <Routes>
      <Route
        path="my"
        element={
          <PermissionRoute menuId="tasks.my" action="can_view">
            <TaskMyListPage />
          </PermissionRoute>
        }
      />

      <Route
        path="team"
        element={
          <PermissionRoute menuId="tasks.team" action="can_view">
            <TaskTeamListPage />
          </PermissionRoute>
        }
      />

      <Route
        path="calendar"
        element={
          <PermissionRoute menuId="tasks.calendar" action="can_view">
            <TaskCalendarPage />
          </PermissionRoute>
        }
      />

      <Route
        path="create"
        element={
          <PermissionRoute menuId="tasks.my" action="can_create">
            <TaskCreatePage />
          </PermissionRoute>
        }
      />

      <Route
        path=":uuid"
        element={
          <PermissionRoute menuId="tasks.my" action="can_view">
            <TaskViewPage />
          </PermissionRoute>
        }
      />

      <Route
        path=":uuid/edit"
        element={
          <PermissionRoute menuId="tasks.my" action="can_edit">
            <TaskEditPage />
          </PermissionRoute>
        }
      />
    </Routes>
  );
}
