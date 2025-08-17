import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Checkout from "@/pages/checkout";
import Vote from "@/pages/vote";
import ArtistRegister from "@/pages/artist-register";
import MrMrsRegister from "@/pages/mr-mrs-register";
import VerifyTicket from "@/pages/verify-ticket";
import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import { CartProvider } from "@/hooks/use-cart";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/vote/:slug?" component={Vote} />
      <Route path="/artists" component={ArtistRegister} />
      <Route path="/mr-mrs" component={MrMrsRegister} />
      <Route path="/verify" component={VerifyTicket} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/*" component={AdminDashboard} />
      {/* Artist referral redirect */}
      <Route path="/t/:artistRef">
        {(params) => {
          // Redirect to home with artist ref
          window.location.href = `/?ref=${params.artistRef}`;
          return null;
        }}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CartProvider>
          <Toaster />
          <Router />
        </CartProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
