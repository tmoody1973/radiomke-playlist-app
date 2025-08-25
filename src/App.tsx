
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import EmbedDemo from "./pages/EmbedDemo";
import Embed from "./pages/Embed";
import TechnicalArticle from "./pages/TechnicalArticle";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import Guide from "./pages/Guide";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/guide" element={<Guide />} />
        <Route path="/demo" element={<EmbedDemo />} />
        <Route path="/embed" element={<Embed />} />
        <Route path="/article" element={<TechnicalArticle />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
