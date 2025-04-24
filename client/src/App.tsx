import { UserProvider } from "./context/UserContext";
import { ThemeProvider } from "./context/ThemeContext";
import { Toaster } from "./components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Router, Route, Switch } from "wouter";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import GetOTP from "./pages/GetOTP";
import History from "./pages/History";
import Wallet from "./pages/Wallet";
import SmsCheck from "./pages/SmsCheck";
import Refer from "./pages/Refer";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact";
import CustomerSupport from "./pages/CustomerSupport";
import NotFound from "./pages/not-found";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <ThemeProvider>
          <Router>
            <Switch>
              <Route path="/" component={Landing} />
              <Route path="/home" component={Home} />
              <Route path="/login" component={Login} />
              <Route path="/signup" component={Signup} />
              <Route path="/get-otp" component={GetOTP} />
              <Route path="/history" component={History} />
              <Route path="/wallet" component={Wallet} />
              <Route path="/sms-check" component={SmsCheck} />
              <Route path="/refer" component={Refer} />
              <Route path="/terms" component={Terms} />
              <Route path="/contact" component={Contact} />
              <Route path="/support" component={CustomerSupport} />
              <Route component={NotFound} />
            </Switch>
          </Router>
          <Toaster />
        </ThemeProvider>
      </UserProvider>
    </QueryClientProvider>
  );
}