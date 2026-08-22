import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from './app/hooks';
import AuthSession from './components/AuthSession';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import SettingsLayout from './components/SettingsLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyOtp from './pages/VerifyOtp';
import Chat from './pages/Chat';
import PalsList from './pages/PalsList';
import PalForm from './pages/PalForm';
import UpdateProfile from './pages/UpdateProfile';
import UpdatePassword from './pages/UpdatePassword';

export default function App() {
  const isDark = useAppSelector((state) => state.theme.isDark);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return (
    <>
      <AuthSession />
      <div className="h-full flex flex-col">
        <Header />
        <div className="flex-1 min-h-0 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route
              path="/chat/:palId"
              element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pals"
              element={
                <ProtectedRoute>
                  <PalsList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pals/new"
              element={
                <ProtectedRoute>
                  <PalForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pals/:palId/edit"
              element={
                <ProtectedRoute>
                  <PalForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="profile" replace />} />
              <Route path="profile" element={<UpdateProfile />} />
              <Route path="password" element={<UpdatePassword />} />
            </Route>
            <Route path="*" element={<Home />} />
          </Routes>
        </div>
      </div>
    </>
  );
}
