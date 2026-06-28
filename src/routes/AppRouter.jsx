import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/Login";
import DashboardPage from "../pages/Dashboard";
import ProposalsPage from "../pages/Proposals";
import CouncilsPage from "../pages/Councils";
import ContractsPage from "../pages/Contracts";
import AppLayout from "../components/layout/AppLayout";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected — wrapped by AppLayout (auth guard + sidebar + topbar) */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/proposals" element={<ProposalsPage />} />
          <Route path="/meetings" element={<CouncilsPage />} />
          <Route path="/contracts" element={<ContractsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}