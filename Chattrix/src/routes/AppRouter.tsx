import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import SplashPage from '../pages/SplashPage';
import LoginPage from '../pages/LoginPage';
import HomePage from '../pages/HomePage';
import ChatPage from '../pages/ChatPage';
import StatusPage from '../pages/StatusPage';
import ProfilePage from '../pages/ProfilePage';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<SplashPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/chat/:id" element={<ChatPage />} />
        <Route path="/status" element={<StatusPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
