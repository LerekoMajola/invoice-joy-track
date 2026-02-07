import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { AdminProtectedRoute } from "@/components/layout/AdminProtectedRoute";
import { DynamicAppIcons } from "@/components/shared/DynamicAppIcons";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import CRM from "./pages/CRM";
import Quotes from "./pages/Quotes";
import Invoices from "./pages/Invoices";
import DeliveryNotes from "./pages/DeliveryNotes";
import Tasks from "./pages/Tasks";
import Tenders from "./pages/Tenders";
import Settings from "./pages/Settings";
import Profitability from "./pages/Profitability";
import Billing from "./pages/Billing";
import Staff from "./pages/Staff";
import Accounting from "./pages/Accounting";
import Fleet from "./pages/Fleet";
import Workshop from "./pages/Workshop";
import Students from "./pages/Students";
import SchoolAdmin from "./pages/SchoolAdmin";
import SchoolFees from "./pages/SchoolFees";
import NotFound from "./pages/NotFound";
import ResetPassword from "./pages/ResetPassword";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <DynamicAppIcons />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/admin" element={<AdminProtectedRoute><Admin /></AdminProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/crm" element={<ProtectedRoute><CRM /></ProtectedRoute>} />
            <Route path="/quotes" element={<ProtectedRoute><Quotes /></ProtectedRoute>} />
            <Route path="/invoices" element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
            <Route path="/delivery-notes" element={<ProtectedRoute><DeliveryNotes /></ProtectedRoute>} />
            <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
            <Route path="/tenders" element={<ProtectedRoute><Tenders /></ProtectedRoute>} />
            <Route path="/profitability" element={<ProtectedRoute><Profitability /></ProtectedRoute>} />
            <Route path="/accounting" element={<ProtectedRoute><Accounting /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
            <Route path="/staff" element={<ProtectedRoute><Staff /></ProtectedRoute>} />
            <Route path="/fleet" element={<ProtectedRoute><Fleet /></ProtectedRoute>} />
            <Route path="/workshop" element={<ProtectedRoute><Workshop /></ProtectedRoute>} />
            <Route path="/students" element={<ProtectedRoute><Students /></ProtectedRoute>} />
            <Route path="/school-admin" element={<ProtectedRoute><SchoolAdmin /></ProtectedRoute>} />
            <Route path="/school-fees" element={<ProtectedRoute><SchoolFees /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
