
import React from 'react';
import { Router, Route, Switch } from 'wouter';
import { Toaster } from '@/components/ui/toaster';
import Dashboard from '@/pages/Dashboard';
import NotFound from '@/pages/NotFound';

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Router>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard" component={Dashboard} />
          <Route component={NotFound} />
        </Switch>
      </Router>
      <Toaster />
    </div>
  );
}

export default App;
