import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ProjectDetail from "./pages/ProjectDetail";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import Create from "./pages/Create";
import Labs from "./pages/Labs";
import LabDetail from "./pages/LabDetail";
import Catalyst from "./pages/Catalyst";
import CatalystRun from "./pages/CatalystRun";
import CatalystShare from "./pages/CatalystShare";
import OAuthConsent from "./pages/OAuthConsent";

import NotFound from "./pages/NotFound";
import { AuthProvider } from "./hooks/use-auth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/project/:id" element={<ProjectDetail />} />
            <Route path="/profile/:id?" element={<Profile />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/create" element={<Create />} />
            <Route path="/labs" element={<Labs />} />
            <Route path="/labs/:id" element={<LabDetail />} />
            <Route path="/catalyst" element={<Catalyst />} />
            <Route path="/catalyst/share/:id" element={<CatalystShare />} />
            <Route path="/catalyst/:id" element={<CatalystRun />} />

            <Route path="/.lovable/oauth/consent" element={<OAuthConsent />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;