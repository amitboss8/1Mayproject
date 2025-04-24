import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/context/ThemeContext";
import { UserProvider } from "@/context/UserContext";

import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import Wallet from "@/pages/Wallet";
import GetOTP from "@/pages/GetOTP";
import CustomerSupport from "@/pages/CustomerSupport";
import Contact from "@/pages/Contact";
import Terms from "@/pages/Terms";
import Refer from "@/pages/Refer";
import History from "@/pages/History";
import SmsCheck from "@/pages/SmsCheck";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import AdminPanel from "@/pages/AdminPanel";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/home" component={Home} />
      <Route path="/wallet" component={Wallet} />
      <Route path="/get-otp" component={GetOTP} />
      <Route path="/support" component={CustomerSupport} />
      <Route path="/customer-support" component={CustomerSupport} />
      <Route path="/contact" component={Contact} />
      <Route path="/terms" component={Terms} />
      <Route path="/refer" component={Refer} />
      <Route path="/history" component={History} />
      <Route path="/sms-check" component={SmsCheck} />
      <Route path="/admin" component={AdminPanel} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <UserProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </UserProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
