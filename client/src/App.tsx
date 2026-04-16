import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Features from "./pages/Features";
import Profile from "./pages/Profile";
import FortuneDetail from "./pages/FortuneDetail";
import PaymentPage from "./pages/PaymentPage";
import PaymentSuccess from "./pages/PaymentSuccess";
import OrderHistory from "./pages/OrderHistory";
import Complaint from "./pages/Complaint";
import OrderLookup from "./pages/OrderLookup";
import ResultPage from "./pages/ResultPage";
import LandingPage from "./pages/LandingPage";
import AdminContext, { useAdmin } from "./contexts/AdminContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/landing" component={LandingPage} />
      <Route path="/login" component={Login} />
      <Route path="/features" component={Features} />
      <Route path="/profile" component={Profile} />
      <Route path="/fortune/:key" component={FortuneDetail} />
      <Route path="/payment" component={PaymentPage} />
      <Route path="/payment-success" component={PaymentSuccess} />
      <Route path="/orders" component={OrderLookup} />
      <Route path="/order-history" component={OrderHistory} />
      <Route path="/complaint" component={Complaint} />
      <Route path="/result/:orderId" component={ResultPage} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AdminContext>
        <ThemeProvider defaultTheme="dark">
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </AdminContext>
    </ErrorBoundary>
  );
}

export default App;
