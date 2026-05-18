import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import RolesExample from './components/RolesExample'
import Instituciones from './pages/Instituciones'
import Usuarios from './pages/Usuarios'
import Documentos from './pages/Documentos'
import Login from './pages/Login'
import Register from './pages/Register'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/roles" element={<RolesExample />} />
          <Route path="/instituciones" element={<Instituciones />} />
          <Route path="/usuarios" element={<Usuarios />} />
          <Route path="/documentos" element={<Documentos />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
