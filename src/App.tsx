import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Login } from '@/pages/Login';
import { ResetPassword } from '@/pages/ResetPassword';
import { Clients } from '@/pages/Clients';
import { Licenses } from '@/pages/Licenses';
import { type JSX } from 'react';

const queryClient = new QueryClient();

/* Componente para proteger rutas privadas (Requiere autenticacion) */
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

/* Componente para proteger rutas de invitados (Redirige si ya esta autenticado) */
const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/clients" replace /> : children;
};

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter basename='/licencias'>
          <Routes>
            {/* Rutas Publicas (Inaccesibles si ya existe sesion) */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/reset-password"
              element={
                <PublicRoute>
                  <ResetPassword />
                </PublicRoute>
              }
            />

            {/* Rutas Privadas (Requieren sesion activa) */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/clients" replace />} />
              <Route path="clients" element={<Clients />} />
              <Route path="licenses" element={<Licenses />} />
            </Route>

            {/* Redireccion por defecto para rutas no encontradas */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;