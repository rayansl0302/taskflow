import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { AdminRoute } from './routes/AdminRoute';
import { LoginPage } from './pages/Login';
import { ForgotPasswordPage } from './pages/ForgotPassword';
import { DashboardPage } from './pages/Dashboard';
import { TasksPage } from './pages/Tasks';
import { TaskFormPage } from './pages/TaskForm';
import { UsersPage } from './pages/Users';
import { UserFormPage } from './pages/UserForm';
import { ProfilePage } from './pages/Profile';
import { GabaritoPage } from './pages/Gabarito';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Rota interna do desafio — o acesso é controlado pelas regras do Firestore */}
      <Route path="/gabarito" element={<GabaritoPage />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/tasks/new" element={<TaskFormPage />} />
        <Route path="/tasks/:id" element={<TaskFormPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route
          path="/users/new"
          element={
            <AdminRoute>
              <UserFormPage />
            </AdminRoute>
          }
        />
        <Route
          path="/users/:id"
          element={
            <AdminRoute>
              <UserFormPage />
            </AdminRoute>
          }
        />
      </Route>
    </Routes>
  );
}
