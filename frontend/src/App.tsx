import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { AnalysisStoreProvider } from './context/AnalysisStore';
import HomePage from './pages/HomePage';
import NewAnalysisPage from './pages/NewAnalysisPage';
import WorkspacePage from './pages/WorkspacePage';
import InsightsPage from './pages/InsightsPage';
import ReportsPage from './pages/ReportsPage';

function App() {
  return (
    <AnalysisStoreProvider>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/"             element={<HomePage />} />
            <Route path="/new-analysis" element={<NewAnalysisPage />} />
            <Route path="/workspace"    element={<WorkspacePage />} />
            <Route path="/insights"     element={<InsightsPage />} />
            <Route path="/reports"      element={<ReportsPage />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </AnalysisStoreProvider>
  );
}

export default App;
