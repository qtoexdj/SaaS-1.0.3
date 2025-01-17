import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { LoginPage } from './pages/LoginPage'
import { ValidateRolePage } from './pages/ValidateRolePage'
import { DeveloperDashboard } from './pages/DeveloperDashboard'
import { AdminDashboard } from './pages/AdminDashboard'
import { VendorDashboard } from './pages/VendorDashboard'
import { PrivateRoute } from './components/PrivateRoute'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/validate-role" element={<ValidateRolePage />} />
          <Route
            path="/developer/*"
            element={
              <PrivateRoute>
                <DeveloperDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/*"
            element={
              <PrivateRoute>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/vendor/*"
            element={
              <PrivateRoute>
                <VendorDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/unauthorized"
            element={
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    Acceso No Autorizado
                  </h1>
                  <p className="text-gray-600">
                    No tienes permisos para acceder a este recurso.
                  </p>
                </div>
              </div>
            }
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
