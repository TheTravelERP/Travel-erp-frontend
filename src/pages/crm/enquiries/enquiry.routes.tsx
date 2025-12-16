import { Routes, Route } from 'react-router-dom';
import EnquiryListPage from './EnquiryListPage';
import EnquiryCreatePage from './EnquiryCreatePage';
import EnquiryViewPage from './EnquiryViewPage';
import EnquiryEditPage from './EnquiryEditPage';

export default function EnquiryRoutes() {
  return (
    <Routes>
      <Route index element={<EnquiryListPage />} />
      <Route path="create" element={<EnquiryCreatePage />} />
      <Route path=":id/edit" element={<EnquiryEditPage />} />
      <Route path=":id/view" element={<EnquiryViewPage />} />
    </Routes>
  );
}
