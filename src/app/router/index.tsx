// src/app/router/index.tsx

import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import LoginPage from '../../auth/pages/LoginPage';
import RegisterPage from '../../auth/pages/RegisterPage';
import AppLayout from '../../layout/AppLayout';
import DashboardPage from '../../features/dashboard/pages/DashboardPage';
import PermissionRoute from './PermissionRoute';
import UnauthorizedPage from '../../pages/errors/UnauthorizedPage';
import ForgotPasswordPage from '../../auth/pages/ForgotPasswordPage';
import EnquiryRoutes from '../../features/enquiry/enquiry.routes';
import FollowupRoutes from '../../features/crm/followup/followup.routes';
import QuotationRoutes from '../../features/crm/quotation/quotation.routes';
import CustomerRoutes from '../../features/customer/customer.routes';
import PackageTypeRoutes from '../../features/package/packageType/packageType.routes';
import PackageDetailRoutes from '../../features/package/packageDetail/packageDetail.routes';
import PackageRoutes from '../../features/package/package.routes';
import PackagePricingRoutes from '../../features/package/packagePricing/packagePricing.routes';
import PackageServiceRoutes from '../../features/package/packageService/packageService.routes';
import HotelRoutes from '../../features/inventory/hotel/hotel.routes';
import AirlineRoutes from '../../features/inventory/airline/airline.routes';
import VendorRoutes from '../../features/inventory/vendor/vendor.routes';
import VendorContractRoutes from '../../features/inventory/vendorContract/vendorContract.routes';
import InventoryStockRoutes from '../../features/inventory/inventoryStock/inventoryStock.routes';
import ZiyaratRoutes from '../../features/inventory/ziyarat/ziyarat.routes';
import SettingsPage from '../../features/settings';
import ChangePasswordPage from '../../features/profile/pages/ChangePasswordPage';
import NotificationPreferencesPage from '../../features/notificationPreferences/pages/NotificationPreferencesPage';
import OrganizationSettingsPage from '../../features/settings/pages/OrganizationSettingsPage';
import UsersRoutes from '../../features/settings/users/users.routes';
import RoleRoutes from '../../features/settings/role/role.routes';
import DocumentTemplateSettingsPage from '../../features/settings/documentTemplates/pages/DocumentTemplateSettingsPage';
import DocumentTemplateConfigRoutes from '../../features/settings/documentTemplates/documentTemplateConfig.routes';
import BranchRoutes from '../../features/settings/branch/branch.routes';
import DocumentTypeRoutes from '../../features/settings/documentType/documentType.routes';
import CurrencyMasterRoutes from '../../features/settings/currencyMaster/currencyMaster.routes';
import ExchangeRateRoutes from '../../features/settings/exchangeRate/exchangeRate.routes';
import CurrencyRatePolicyRoutes from '../../features/settings/currencyRatePolicy/currencyRatePolicy.routes';
import TaxRegistrationRoutes from '../../features/settings/taxRegistration/taxRegistration.routes';
import LocalizationProfileRoutes from '../../features/settings/localizationProfile/localizationProfile.routes';
import DocumentNumberSeriesRoutes from '../../features/settings/documentNumberSeries/documentNumberSeries.routes';
import AuditLogRoutes from '../../features/settings/auditLog/auditLog.routes';
import CommunicationProviderRoutes from '../../features/settings/communicationProviders/communicationProvider.routes';
import NotificationTemplateRoutes from '../../features/settings/notificationTemplates/notificationTemplate.routes';
import EventAutomationRoutes from '../../features/settings/eventAutomation/eventAutomation.routes';
import NotificationLogRoutes from '../../features/reports/notificationLogs/notificationLog.routes';
import NotificationAnalyticsPage from '../../features/reports/notificationAnalytics/pages/NotificationAnalyticsPage';
import ProviderHealthPage from '../../features/reports/providerHealth/pages/ProviderHealthPage';
import NotificationCenterRoutes from '../../features/notifications/notificationCenter.routes';
import ComingSoonPage from '../../components/common/ComingSoonPage';

// Menu items with no built page yet — each renders a translated "Coming
// soon" placeholder behind the same permission gate a real page would use.
// Keep this in sync with app/seeds/system/menu_data.py on the backend.
const COMING_SOON_ROUTES: { menuId: string; path: string }[] = [
  { menuId: 'packages.departures', path: '/app/packages/departures' },
  { menuId: 'packages.bookings', path: '/app/bookings/list' },
  { menuId: 'packages.itinerary', path: '/app/bookings/services' },
  { menuId: 'packages.room_allocation', path: '/app/bookings/room-allocation' },
  { menuId: 'visa.travelers', path: '/app/ops/travelers' },
  { menuId: 'visa.management', path: '/app/ops/visa' },
  { menuId: 'visa.group_processing', path: '/app/ops/visa-batches' },
  { menuId: 'visa.insurance_mofa', path: '/app/ops/insurance-mofa' },
  { menuId: 'finance.invoices', path: '/app/finance/invoices' },
  { menuId: 'finance.vouchers', path: '/app/finance/vouchers' },
  { menuId: 'finance.receipts', path: '/app/finance/receipts' },
  { menuId: 'finance.receipt_allocation', path: '/app/finance/receipt-allocation' },
  { menuId: 'finance.vendor_bills', path: '/app/finance/vendor-bills' },
  { menuId: 'finance.expenses', path: '/app/banking/expenses' },
  { menuId: 'finance.customer_ledger', path: '/app/finance/customer-ledger' },
  { menuId: 'finance.agent_ledger', path: '/app/finance/agent-ledger' },
  { menuId: 'finance.coa', path: '/app/finance/chart-of-accounts' },
  { menuId: 'finance.journal', path: '/app/finance/journal' },
  { menuId: 'finance.tax_summary', path: '/app/finance/tax-summary' },
  { menuId: 'agents.list', path: '/app/agents/list' },
  { menuId: 'agents.branding', path: '/app/agents/branding' },
  { menuId: 'agents.bookings', path: '/app/agents/bookings' },
  { menuId: 'agents.invoices', path: '/app/agents/invoices' },
  { menuId: 'agents.commission', path: '/app/agents/commission' },
  { menuId: 'tasks.my', path: '/app/tasks/my' },
  { menuId: 'tasks.team', path: '/app/tasks/team' },
  { menuId: 'tasks.calendar', path: '/app/tasks/calendar' },
  { menuId: 'support.tickets', path: '/app/support/tickets' },
  { menuId: 'support.knowledge_base', path: '/app/support/kb' },
  { menuId: 'ai.chatbot', path: '/app/ai/chat' },
  { menuId: 'ai.insights', path: '/app/ai/insights' },
  { menuId: 'ai.document_autofill', path: '/app/ai/document-scan' },
  { menuId: 'reports.sales', path: '/app/reports/sales' },
  { menuId: 'reports.bookings', path: '/app/reports/bookings' },
  { menuId: 'reports.package_occupancy', path: '/app/reports/package-occupancy' },
  { menuId: 'reports.enquiry_conversion', path: '/app/reports/enquiry-conversion' },
  { menuId: 'reports.agent_performance', path: '/app/reports/agent-performance' },
  { menuId: 'reports.agent_commission', path: '/app/reports/agent-commission' },
  { menuId: 'reports.financial', path: '/app/reports/financial' },
  { menuId: 'reports.receivables', path: '/app/reports/receivables' },
  { menuId: 'reports.payables', path: '/app/reports/payables' },
  { menuId: 'reports.pnl', path: '/app/reports/pnl' },
  { menuId: 'reports.balance_sheet', path: '/app/reports/balance-sheet' },
  { menuId: 'reports.trial_balance', path: '/app/reports/trial-balance' },
  { menuId: 'reports.tax', path: '/app/reports/tax' },
  { menuId: 'reports.expenses', path: '/app/reports/expenses' },
  { menuId: 'reports.vendor_purchase', path: '/app/reports/vendor-purchase' },
  { menuId: 'reports.hotel_occupancy', path: '/app/reports/hotel-occupancy' },
  { menuId: 'reports.flight_manifest', path: '/app/reports/flight-manifest' },
  { menuId: 'reports.room_allocation', path: '/app/reports/room-allocation' },
  { menuId: 'reports.visa_status', path: '/app/reports/visa-status' },
  { menuId: 'reports.passport_expiry', path: '/app/reports/passport-expiry' },
  { menuId: 'reports.travelers', path: '/app/reports/travelers' },
  { menuId: 'reports.support', path: '/app/reports/support' },
  { menuId: 'reports.tasks', path: '/app/reports/tasks' },
  { menuId: 'reports.custom_builder', path: '/app/reports/custom' },
  { menuId: 'settings.dropdown', path: '/app/settings/dropdown' },
  { menuId: 'settings.subscription', path: '/app/settings/subscription' },
];

export default function AppRouter() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Protected Layout */}
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>

        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/app/dashboard" replace />} />

        {/* Dashboard (permission protected) */}
        <Route
          path="/app/dashboard"
          element={
            <PermissionRoute menuId="dashboard">
              <DashboardPage />
            </PermissionRoute>
          }
        />
        {/* Legacy URL — keep bookmarks/links working */}
        <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />

        <Route path="/app/enquiries/*" element={<EnquiryRoutes />} />
        <Route path="/app/crm/followups/*" element={<FollowupRoutes />} />
        <Route path="/app/crm/quotations/*" element={<QuotationRoutes />} />
        <Route path="/app/crm/customers/*" element={<CustomerRoutes />} />
        <Route path="/app/packages/types/*" element={<PackageTypeRoutes />} />
        <Route path="/app/packages/details/*" element={<PackageDetailRoutes />} />
        <Route path="/app/packages/list/*" element={<PackageRoutes />} />
        <Route path="/app/packages/pricing/*" element={<PackagePricingRoutes />} />
        <Route path="/app/packages/services/*" element={<PackageServiceRoutes />} />
        <Route path="/app/inventory/hotels/*" element={<HotelRoutes />} />
        <Route path="/app/inventory/airlines/*" element={<AirlineRoutes />} />
        <Route path="/app/inventory/vendor-master/*" element={<VendorRoutes />} />
        <Route path="/app/inventory/contracts/*" element={<VendorContractRoutes />} />
        <Route path="/app/inventory/stock/*" element={<InventoryStockRoutes />} />
        <Route path="/app/inventory/ziyarat/*" element={<ZiyaratRoutes />} />
        <Route path="/app/settings/theme-color" element={<SettingsPage />} />
        <Route path="/app/profile/change-password" element={<ChangePasswordPage />} />
        <Route path="/app/profile/notification-preferences" element={<NotificationPreferencesPage />} />

        <Route
          path="/app/settings/organization"
          element={
            <PermissionRoute menuId="settings.organization">
              <OrganizationSettingsPage />
            </PermissionRoute>
          }
        />
        <Route path="/app/settings/users/*" element={<UsersRoutes />} />
        <Route path="/app/settings/roles/*" element={<RoleRoutes />} />
        <Route
          path="/app/settings/document-templates"
          element={
            <PermissionRoute menuId="settings.document_templates">
              <DocumentTemplateSettingsPage />
            </PermissionRoute>
          }
        />
        <Route path="/app/settings/document-templates/config/*" element={<DocumentTemplateConfigRoutes />} />
        <Route path="/app/settings/branch-master/*" element={<BranchRoutes />} />
        <Route path="/app/settings/document-type-master/*" element={<DocumentTypeRoutes />} />
        <Route path="/app/settings/currency-master/*" element={<CurrencyMasterRoutes />} />
        <Route path="/app/settings/exchange-rate-master/*" element={<ExchangeRateRoutes />} />
        <Route path="/app/settings/currency-rate-policy/*" element={<CurrencyRatePolicyRoutes />} />
        <Route path="/app/settings/tax-registration/*" element={<TaxRegistrationRoutes />} />
        <Route path="/app/settings/localization-profiles/*" element={<LocalizationProfileRoutes />} />
        <Route path="/app/settings/doc-numbering/*" element={<DocumentNumberSeriesRoutes />} />
        <Route path="/app/settings/audit-log/*" element={<AuditLogRoutes />} />
        <Route path="/app/settings/communication-settings/*" element={<CommunicationProviderRoutes />} />
        <Route path="/app/settings/notifications/*" element={<NotificationTemplateRoutes />} />
        <Route path="/app/settings/event-automation/*" element={<EventAutomationRoutes />} />
        <Route path="/app/reports/notification-logs/*" element={<NotificationLogRoutes />} />
        <Route
          path="/app/reports/notification-analytics"
          element={
            <PermissionRoute menuId="reports.notification_analytics" action="can_view">
              <NotificationAnalyticsPage />
            </PermissionRoute>
          }
        />
        <Route
          path="/app/reports/provider-health"
          element={
            <PermissionRoute menuId="reports.provider_health" action="can_view">
              <ProviderHealthPage />
            </PermissionRoute>
          }
        />
        <Route path="/app/notifications/*" element={<NotificationCenterRoutes />} />

        {/* Not-yet-built modules */}
        {COMING_SOON_ROUTES.map(({ menuId, path }) => (
          <Route
            key={menuId}
            path={path}
            element={
              <PermissionRoute menuId={menuId}>
                <ComingSoonPage titleKey={`menu.${menuId}`} />
              </PermissionRoute>
            }
          />
        ))}

        {/* Unauthorized */}
        <Route path="/app/unauthorized" element={<UnauthorizedPage />} />

      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
    </Routes>
  );
}
