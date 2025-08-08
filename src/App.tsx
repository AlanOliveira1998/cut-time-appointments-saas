
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import Auth from "./pages/Auth";
import { AuthCallback } from "./pages/AuthCallback";
import { DashboardPage } from "./pages/DashboardPage";
import { AppointmentsPage } from "./pages/AppointmentsPage";
import { ServicesPage } from "./pages/ServicesPage";
import { ClientsPage } from "./pages/ClientsPage";
import { FinancePage } from "./pages/FinancePage";
import { SettingsPage } from "./pages/SettingsPage";
import BarbersManagementPage from "./pages/BarbersManagementPage";
import { BookingPage } from "./components/booking/BookingPage";
import { Booking } from "./pages/Booking";
import NotFound from "./pages/NotFound";
import AdminDashboard from './pages/AdminDashboard';
import BarberDashboard from './pages/BarberDashboard';
import './lib/i18n'; // Importar configuração do i18next

// const queryClient = new QueryClient();

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route 
        path="/auth" 
        element={
          <PublicRoute>
            <Auth />
          </PublicRoute>
        } 
      />
      <Route 
        path="/auth/callback" 
        element={<AuthCallback />} 
      />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/appointments" 
        element={
          <ProtectedRoute>
            <AppointmentsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/services" 
        element={
          <ProtectedRoute>
            <ServicesPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/clients" 
        element={
          <ProtectedRoute>
            <ClientsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/finance" 
        element={
          <ProtectedRoute>
            <FinancePage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/barbeiros" 
        element={
          <ProtectedRoute>
            <BarbersManagementPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/settings" 
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/appointments" 
        element={
          <ProtectedRoute>
            <AppointmentsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/booking/:barberName" 
        element={<BookingPage />} 
      />
      <Route 
        path="/booking" 
        element={<Booking />} 
      />
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/barber-dashboard" 
        element={
          <ProtectedRoute>
            <BarberDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/" 
        element={<Navigate to="/auth" replace />}
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  // <QueryClientProvider client={queryClient}>
    <ErrorBoundary>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ErrorBoundary>
  // </QueryClientProvider>
);

export default App;
