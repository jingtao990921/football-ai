import { Navigate, Route, Routes } from "react-router-dom";
import AdminRoute from "./components/admin/AdminRoute";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PlaceholderPage from "./pages/PlaceholderPage";
import PredictionsPage from "./pages/PredictionsPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminHome from "./pages/admin/AdminHome";
import AdminMatches from "./pages/admin/AdminMatches";
import AdminPredictions from "./pages/admin/AdminPredictions";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminVip from "./pages/admin/AdminVip";
import AdminNotFound from "./pages/admin/AdminNotFound";

export default function App() {
    return (
        <Routes>
            <Route
                path="/admin"
                element={
                    <AdminRoute>
                        <AdminDashboard />
                    </AdminRoute>
                }
            >
                <Route index element={<AdminHome />} />
                <Route path="matches" element={<AdminMatches />} />
                <Route path="predictions" element={<AdminPredictions />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="vip" element={<AdminVip />} />
                <Route path="*" element={<AdminNotFound />} />
            </Route>

            <Route element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route path="predictions" element={<PredictionsPage />} />
                <Route
                    path="vip"
                    element={
                        <PlaceholderPage
                            title="VIP Membership"
                            description="Exclusive picks and premium analytics for VIP members."
                        />
                    }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
        </Routes>
    );
}
