import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import BrowseFreelancers from "./pages/BrowseFreelancers";
import FreelancerProfile from "./pages/FreelancerProfile";
import FreelancerProfileEdit from "./pages/FreelancerProfileEdit";
import FreelancerReviews from "./pages/FreelancerReviews";
import PostJob from "./pages/PostJob";
import FreelancerDashboard from "./pages/FreelancerDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import { ThemeProvider } from "@/components/ThemeProvider";
import CreateFreelancerProfile from "./pages/CreateFreelancerProfile";
import ReferralConfirmation from "./pages/ReferralConfirmation";
import SalesRegistration from "./pages/SalesRegistration";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider defaultTheme="system" storageKey="mygigs-ui-theme">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/browse" element={<BrowseFreelancers />} />
            <Route path="/freelancer/:id" element={<FreelancerProfile />} />
            <Route
              path="/freelancer/:id/reviews"
              element={<FreelancerReviews />}
            />
            <Route path="/post-job" element={<PostJob />} />
            <Route
              path="/dashboard/freelancer"
              element={<FreelancerDashboard />}
            />
            <Route
              path="/dashboard/freelancer/edit-profile"
              element={<FreelancerProfileEdit />}
            />
            <Route path="/dashboard/client" element={<ClientDashboard />} />
            <Route path="/dashboard/admin" element={<AdminDashboard />} />
            <Route
              path="/freelancer/create-profile"
              element={<CreateFreelancerProfile />}
            />
            <Route path="/sales/register" element={<SalesRegistration />} />

            <Route
              path="/freelancer/referral-confirmation"
              element={<ReferralConfirmation />}
            />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
