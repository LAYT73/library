import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { LoginPage } from '../pages/login/LoginPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { CatalogPage } from '../pages/catalog/CatalogPage';
import { AuthorsPage } from '../pages/catalog/AuthorsPage';
import { AppPage } from '../pages/app/AppPage';
import { BookDetailsPage } from '../pages/catalog/BookDetailsPage';
import { ProtectedRoute } from '../shared/lib/ProtectedRoute';
import { InventoryPage } from '../pages/inventory/InventoryPage';
import { CopiesPage } from '../pages/inventory/CopiesPage';
import { AcquisitionPage } from '../pages/acquisition/AcquisitionPage';
import { ProcurementPage } from '../pages/procurement/ProcurementPage';
import { SuppliersPage } from '../pages/procurement/SuppliersPage';
import { PurchaseRequestsPage } from '../pages/procurement/PurchaseRequestsPage';
import { OrdersPage } from '../pages/procurement/OrdersPage';
import { DonationsPage } from '../pages/donations/DonationsPage';
import { WriteOffsPage } from '../pages/writeoffs/WriteOffsPage';
import { CoveragePage } from '../pages/coverage/CoveragePage';
import { ReportsPage } from '../pages/reports/ReportsPage';
import { UsersPage } from '../pages/users/UsersPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

export function RootRouter() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/catalog"
              element={
                <ProtectedRoute>
                  <CatalogPage />
                </ProtectedRoute>
              }
            />
              <Route
                path="/catalog/:id"
                element={
                  <ProtectedRoute>
                    <BookDetailsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/authors"
                element={
                  <ProtectedRoute>
                    <AuthorsPage />
                  </ProtectedRoute>
                }
              />

            <Route
              path="/inventory"
              element={
                <ProtectedRoute>
                  <InventoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventory/copies"
              element={
                <ProtectedRoute>
                  <CopiesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/acquisitions"
              element={
                <ProtectedRoute>
                  <AcquisitionPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/procurement"
              element={
                <ProtectedRoute>
                  <ProcurementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/procurement/suppliers"
              element={
                <ProtectedRoute>
                  <SuppliersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/procurement/purchase-requests"
              element={
                <ProtectedRoute>
                  <PurchaseRequestsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/procurement/orders"
              element={
                <ProtectedRoute>
                  <OrdersPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/donations"
              element={
                <ProtectedRoute>
                  <DonationsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/write-offs"
              element={
                <ProtectedRoute>
                  <WriteOffsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/coverage"
              element={
                <ProtectedRoute>
                  <CoveragePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <ReportsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <UsersPage />
                </ProtectedRoute>
              }
            />

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<AppPage />} />
          </Routes>
        </Router>
      </ConfigProvider>
    </QueryClientProvider>
  );
}
