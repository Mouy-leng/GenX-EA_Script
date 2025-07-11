import { Router, Route, Switch } from "wouter";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

function App() {
  console.log("GenZ Trading Bot Pro initialized");

  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;