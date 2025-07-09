import { Route, Switch } from 'wouter';
import { Sidebar } from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/not-found';

function App() {
  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <Sidebar />
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

export default App;
