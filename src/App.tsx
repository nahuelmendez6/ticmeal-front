import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import Login from './components/Login';
import BackofficeLogin from './components/BackofficeLogin';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BackofficeUserManagement from './components/BackofficeUserManagement';
import UserManagement from './components/UserManagement'
import Layout from './components/Layout';
import MenuManagementPage from './pages/MenuManagementPage';
import ShiftManagement from './pages/ShiftManagement';
import TicketsTablePage from './pages/TicketsTablePage';
import ReportsPage from './pages/ReportsPage';
import ActiveShiftForm from './components/ActiveShiftForm';
import Verify from './pages/Verify';
// import StockReport from './components/StockReport';
import TicketMonitor from './components/TicketMonitor';
import KitchenTicketForm from './components/KitchenTicketForm';
import QRGeneratorPage from './pages/QRGeneratorPage';
import MealShiftsPage from './pages/MealShiftsPage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="admin/login"
            element={
              <PublicRoute>
                <BackofficeLogin />
              </PublicRoute>
            }
          />
          <Route path="/backoffice/users" element={<BackofficeUserManagement />} />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="/verify"
            element={
              <PublicRoute>
                <Verify />
              </PublicRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/menu-management"
            element={
              <ProtectedRoute>
                <Layout>  
                  <MenuManagementPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Layout>  
                  <ReportsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route 
            path="/qr-generator" 
            element={
              <ProtectedRoute>
                <Layout>
                  <QRGeneratorPage />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route
            path="/active-shift/:tenantId"
            element={
              // <ProtectedRoute>
                  <ActiveShiftForm />
              // </ProtectedRoute>
            }
          />
          <Route path="/users" element={
            <ProtectedRoute>
              <Layout>
                <UserManagement />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/shifts" element={
            <ProtectedRoute>
              <Layout>
                <ShiftManagement />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/tickets-table" element={
            <ProtectedRoute>
              <Layout>
                <TicketsTablePage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/kitchen-ticket-create" element={
            <ProtectedRoute>
              <Layout>
                <KitchenTicketForm />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/ticket-monitor" element={
            <ProtectedRoute>
              <Layout>
                <TicketMonitor />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/meal-shifts" element={
            <ProtectedRoute>
              {/* <Layout> */}
                <MealShiftsPage />
              {/* </Layout> */}
            </ProtectedRoute>
          } />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
