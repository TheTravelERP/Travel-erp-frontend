// src/features/tasks/pages/TaskMyListPage.tsx
import TaskListPage from "./TaskListPage";

export default function TaskMyListPage() {
  return <TaskListPage menuKey="tasks.my" titleKey="menu.tasks.my" showAssignedTo={false} />;
}
