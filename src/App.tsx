import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AuthProvider } from "@/contexts/AuthContext";
import { TimerProvider } from "@/contexts/TimerContext";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { AdminProtectedRoute } from "@/components/layout/AdminProtectedRoute";
import { DynamicAppIcons } from "@/components/shared/DynamicAppIcons";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import Invoices from "./pages/Invoices";
import Tasks from "./pages/Tasks";
import Settings from "./pages/Settings";
import Billing from "./pages/Billing";
import Staff from "./pages/Staff";
import Accounting from "./pages/Accounting";
import Students from "./pages/Students";
import SchoolAdmin from "./pages/SchoolAdmin";
import SchoolFees from "./pages/SchoolFees";
import Timetable from "./pages/Timetable";
import Clients from "./pages/Clients";
import CRM from "./pages/CRM";
import Quotes from "./pages/Quotes";
import Tenders from "./pages/Tenders";
import DeliveryNotes from "./pages/DeliveryNotes";
import Workshop from "./pages/Workshop";
import Profitability from "./pages/Profitability";
import NotFound from "./pages/NotFound";
import ResetPassword from "./pages/ResetPassword";
import PaymentRequired from "./pages/PaymentRequired";
import LegalCases from "./pages/LegalCases";
import CaseDetail from "./pages/CaseDetail";
import LegalTimeTracking from "./pages/LegalTimeTracking";
import LegalDocuments from "./pages/LegalDocuments";
import LegalCalendar from "./pages/LegalCalendar";
import Equipment from "./pages/Equipment";
import HireOrders from "./pages/HireOrders";
import HireCalendar from "./pages/HireCalendar";
import Rooms from "./pages/Rooms";
import Bookings from "./pages/Bookings";
import Housekeeping from "./pages/Housekeeping";
import GuestReviews from "./pages/GuestReviews";

const queryClient = new QueryClient();

const App = () => {
  // Prevent crashes from unhandled promise rejections (e.g. stale token refresh on resume)
  useEffect(() => {
    const handleRejection = (e: PromiseRejectionEvent) => {
      console.warn("[App] Unhandled rejection caught:", e.reason);
      e.preventDefault();
    };

    window.addEventListener("unhandledrejection", handleRejection);

    return () => {
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  return (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TimerProvider>
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
            <Route path="/payment-required" element={<ProtectedRoute><PaymentRequired /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/invoices" element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
            <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
            <Route path="/accounting" element={<ProtectedRoute><Accounting /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
            <Route path="/staff" element={<ProtectedRoute><Staff /></ProtectedRoute>} />
            <Route path="/students" element={<ProtectedRoute><Students /></ProtectedRoute>} />
            <Route path="/school-admin" element={<ProtectedRoute><SchoolAdmin /></ProtectedRoute>} />
            <Route path="/school-fees" element={<ProtectedRoute><SchoolFees /></ProtectedRoute>} />
            <Route path="/timetable" element={<ProtectedRoute><Timetable /></ProtectedRoute>} />
            <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
            <Route path="/crm" element={<ProtectedRoute><CRM /></ProtectedRoute>} />
            <Route path="/quotes" element={<ProtectedRoute><Quotes /></ProtectedRoute>} />
            <Route path="/tenders" element={<ProtectedRoute><Tenders /></ProtectedRoute>} />
            <Route path="/delivery-notes" element={<ProtectedRoute><DeliveryNotes /></ProtectedRoute>} />
            <Route path="/workshop" element={<ProtectedRoute><Workshop /></ProtectedRoute>} />
            <Route path="/profitability" element={<ProtectedRoute><Profitability /></ProtectedRoute>} />
            <Route path="/legal-cases" element={<ProtectedRoute><LegalCases /></ProtectedRoute>} />
            <Route path="/legal-cases/:id" element={<ProtectedRoute><CaseDetail /></ProtectedRoute>} />
            <Route path="/legal-time-tracking" element={<ProtectedRoute><LegalTimeTracking /></ProtectedRoute>} />
            <Route path="/legal-documents" element={<ProtectedRoute><LegalDocuments /></ProtectedRoute>} />
            <Route path="/legal-calendar" element={<ProtectedRoute><LegalCalendar /></ProtectedRoute>} />
            <Route path="/equipment" element={<ProtectedRoute><Equipment /></ProtectedRoute>} />
            <Route path="/hire-orders" element={<ProtectedRoute><HireOrders /></ProtectedRoute>} />
            <Route path="/hire-calendar" element={<ProtectedRoute><HireCalendar /></ProtectedRoute>} />
            <Route path="/rooms" element={<ProtectedRoute><Rooms /></ProtectedRoute>} />
            <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
            <Route path="/housekeeping" element={<ProtectedRoute><Housekeeping /></ProtectedRoute>} />
            <Route path="/guest-reviews" element={<ProtectedRoute><GuestReviews /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
      </TimerProvider>
    </AuthProvider>
  </QueryClientProvider>
  );
};

export default App;
