import { Router, Route, Switch } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import SignalGenerator from "./pages/signal-generator";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  console.log("GenZ Trading Bot Pro - Signal Generator initialized");

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-background">
          <Switch>
            <Route path="/" component={SignalGenerator} />
            <Route component={NotFound} />
          </Switch>
          <Toaster />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;