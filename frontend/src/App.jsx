import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, LogOut } from 'lucide-react'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import Customers from './components/Customers'
import ModelInsights from './components/ModelInsights'
import FeatureInsights from './components/FeatureInsights'
import Prediction from './components/Prediction'
import { Brain, BarChart2, ListTree, TrendingUp } from 'lucide-react'

const Sidebar = ({ onLogout, role }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/customers', label: 'Customers', icon: <Users size={20} /> },
    { path: '/model-insights', label: 'Model Insights', icon: <Brain size={20} /> },
    { path: '/feature-insights', label: 'Feature Insights', icon: <ListTree size={20} /> },
    { path: '/prediction', label: 'Prediction', icon: <TrendingUp size={20} />, adminOnly: true }
  ]

  return (
    <div className="w-64 glass-panel h-[calc(100vh-2rem)] flex flex-col my-4 ml-4 fixed border-l border-white/5">
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">Churn X</h1>
        <div className="flex items-center gap-2 mt-1">
          <span className={`w-2 h-2 rounded-full ${role === 'admin' ? 'bg-primary shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]'}`}></span>
          <p className="text-xs text-gray-400 uppercase tracking-widest leading-none mt-0.5">{role} Access</p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.filter(item => !item.adminOnly || role === 'admin').map((item) => {
          const active = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                active ? 'bg-primary/20 text-primary border border-primary/30' : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="p-4 mt-auto">
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-danger hover:bg-danger/10 transition-all font-medium"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  )
}

function MainLayout({ children, onLogout, role }) {
  return (
    <div className="flex bg-background min-h-screen">
      <Sidebar onLogout={onLogout} role={role} />
      <div className="flex-1 ml-72 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  )
}

const NotFound = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
    <h2 className="text-6xl font-bold text-white mb-4">404</h2>
    <p className="text-xl text-gray-400 mb-8">Oops! The page you're looking for doesn't exist.</p>
    <button onClick={() => window.location.href = '/dashboard'} className="btn-primary">Return to Dashboard</button>
  </div>
)

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(localStorage.getItem('token')));
  const [role, setRole] = useState(() => {
    const token = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role');
    return token ? (storedRole || 'analyst') : null;
  });

  const handleLogin = (token, userRole) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', userRole);
    setRole(userRole);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsAuthenticated(false);
    setRole(null);
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
        />
        <Route 
          path="/login" 
          element={!isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />} 
        />
        <Route 
          path="/dashboard" 
          element={isAuthenticated ? <MainLayout onLogout={handleLogout} role={role}><Dashboard /></MainLayout> : <Navigate to="/login" />} 
        />
        <Route 
          path="/customers" 
          element={isAuthenticated ? <MainLayout onLogout={handleLogout} role={role}><Customers /></MainLayout> : <Navigate to="/login" />} 
        />
        <Route 
          path="/model-insights" 
          element={isAuthenticated ? <MainLayout onLogout={handleLogout} role={role}><ModelInsights /></MainLayout> : <Navigate to="/login" />} 
        />
        <Route 
          path="/feature-insights" 
          element={isAuthenticated ? <MainLayout onLogout={handleLogout} role={role}><FeatureInsights /></MainLayout> : <Navigate to="/login" />} 
        />
        <Route 
          path="/prediction" 
          element={isAuthenticated && role === 'admin' ? <MainLayout onLogout={handleLogout} role={role}><Prediction /></MainLayout> : (isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />)} 
        />
        <Route path="*" element={isAuthenticated ? <MainLayout onLogout={handleLogout} role={role}><NotFound /></MainLayout> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  )
}

export default App
