
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SignUp from "./pages/auth/SignUp";
import Login from "./pages/auth/Login";
import VerifyEmail from "./pages/auth/VerifyEmail";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Dashboard from "./pages/Dashboard";
import ChatLayout from "./pages/chat/ChatLayout";
import Chat from "./pages/chat/Chat";
import Welcome from "./pages/chat/Welcome";
import DocumentManagement from "./pages/documents/DocumentManagement";
import OrganizationLayout from "./pages/organization/OrganizationLayout";
import OrganizationDetails from "./pages/organization/OrganizationDetails";
import OrganizationSubscription from "./pages/organization/OrganizationSubscription";
import OrganizationLocations from "./pages/organization/OrganizationLocations";
import OrganizationUsers from "./pages/organization/OrganizationUsers";
import AppLayout from "./components/layout/AppLayout";
import ProfilePage from "./pages/profile/ProfilePage";

const queryClient = new QueryClient();

// Protected route component - moved inside the AuthContext-wrapped component
const ProtectedRouteComponent = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }
  
  return <>{children}</>;
};

// Manager route component - only allows manager or admin roles
const ManagerRouteComponent = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading, userRole } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }
  
  if (userRole !== 'manager' && userRole !== 'org_admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

// Admin route component - only allows admin role
const AdminRouteComponent = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading, userRole } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }
  
  if (userRole !== 'org_admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

// The inner app component that has access to auth context
const AppRoutes = () => {
  // These route components are now wrapped by AuthProvider
  const ProtectedRoute = ProtectedRouteComponent;
  const ManagerRoute = ManagerRouteComponent;
  const AdminRoute = AdminRouteComponent;
  
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth/signup" element={<SignUp />} />
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/verify-email" element={<VerifyEmail />} />
      <Route path="/auth/forgot-password" element={<ForgotPassword />} />
      <Route path="/auth/reset-password" element={<ResetPassword />} />
      
      {/* Protected routes with AppLayout */}
      <Route element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }>
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Profile route */}
        <Route path="/profile" element={<ProfilePage />} />
        
        {/* Chat routes */}
        <Route path="/chat" element={<ChatLayout />}>
          <Route index element={<Welcome />} />
          <Route path=":chatId" element={<Chat />} />
        </Route>
        
        {/* Document management routes - only for managers and admins */}
        <Route path="/documents" element={
          <ManagerRoute>
            <DocumentManagement />
          </ManagerRoute>
        } />
        
        {/* Organization management routes - only for org admins */}
        <Route path="/organization" element={
          <AdminRoute>
            <OrganizationLayout />
          </AdminRoute>
        }>
          <Route index element={<Navigate to="/organization/details" replace />} />
          <Route path="details" element={<OrganizationDetails />} />
          <Route path="subscription" element={<OrganizationSubscription />} />
          <Route path="locations" element={<OrganizationLocations />} />
          <Route path="users" element={<OrganizationUsers />} />
        </Route>
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

// Main app component - Moved AuthProvider to wrap only the AppRoutes component
const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-right" />
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
