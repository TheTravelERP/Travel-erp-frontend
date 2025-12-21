import { Routes, Route } from 'react-router-dom';
import EnquiryListPage from './EnquiryListPage';
import EnquiryCreatePage from './EnquiryCreatePage';
import EnquiryViewPage from './EnquiryViewPage';
import EnquiryEditPage from './EnquiryEditPage';
import PermissionRoute from '../../../app/router/PermissionRoute';

export default function EnquiryRoutes() {
  return (
    <Routes>
      <Route
        index
        element={
          <PermissionRoute menuId="crm_enquiries" action="can_view">
            <EnquiryListPage />
          </PermissionRoute>
        }
      />

      <Route
        path="create"
        element={
          <PermissionRoute menuId="crm_enquiries" action="can_create">
            <EnquiryCreatePage />
          </PermissionRoute>
        }
      />


      <Route
        path=":id/edit"
        element={
          <PermissionRoute menuId="crm_enquiries" action="can_edit">
            <EnquiryEditPage />
          </PermissionRoute>
        }
      />
      <Route
        path=":id/view"
        element={
          <PermissionRoute menuId="crm_enquiries" action="can_view">
            <EnquiryViewPage />
          </PermissionRoute>
        }
      />
    </Routes>
  );
}
