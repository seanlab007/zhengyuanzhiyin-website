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
import PayPage from "./pages/PayPage";
import OrderHistory from "./pages/OrderHistory";
import MobileLayout from "./components/MobileLayout";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/features" component={Features} />
      <Route path="/profile" component={Profile} />
      <Route path="/fortune/:key" component={FortuneDetail} />
      <Route path="/pay/:orderId" component={PayPage} />
      <Route path="/orders" component={OrderHistory} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <MobileLayout>
            <Router />
          </MobileLayout>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
