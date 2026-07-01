import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import RolesExample from './components/RolesExample'
import Instituciones from './pages/Instituciones'
import Usuarios from './pages/Usuarios'
import Documentos from './pages/Documentos'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import UpdatePassword from './pages/UpdatePassword'
import EscuelasSeguras from './pages/EscuelasSeguras'
import EscuelasSeguras_Base from './pages/EscuelasSeguras_Base'
import UnderConstruction from './pages/UnderConstruction'
import './App.css'

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requiredRole={["administrador", "admin"]}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/roles" element={<RolesExample />} />
            <Route path="/instituciones" element={<Instituciones />} />
            <Route path="/usuarios" element={<Usuarios />} />
            <Route path="/documentos" element={<Documentos />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/update-password" element={<UpdatePassword />} />
            
            {/* Nuevas rutas de Escuelas Seguras */}
            <Route 
              path="/escuelas-seguras" 
              element={
                <ProtectedRoute requiredPermission="escuelas_seguras_admin">
                  <EscuelasSeguras />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/escuelas-seguras-base" 
              element={
                <ProtectedRoute requiredPermission="escuelas_seguras">
                  <EscuelasSeguras_Base />
                </ProtectedRoute>
              } 
            />
            
            {/* Ruta para secciones en construcción */}
            <Route path="/under-construction" element={<UnderConstruction />} />
            
            {/* Redirección comodín al home para cualquier otra ruta inexistente */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App
