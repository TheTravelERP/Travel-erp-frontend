import { Routes, Route, Navigate } from 'react-router-dom';
import EnquiryRoutes from './enquiries/enquiry.routes';

export default function CrmRoutes() {
  return (
    <Routes>
      <Route index element={<Navigate to="enquiries" replace />} />
      <Route path="enquiries/*" element={<EnquiryRoutes />} />
    </Routes>
  );
}
