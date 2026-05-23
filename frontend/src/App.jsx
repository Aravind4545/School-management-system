import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import ChangePassword from './pages/ChangePassword';
import Dashboard from './pages/Dashboard';
import PapersPage from './pages/PapersPage';
import ImportantPage from './pages/ImportantPage';
import QuizLevels from './pages/QuizLevels';
import ExamPage from './pages/ExamPage';
import ResultPage from './pages/ResultPage';
import MockPage from './pages/MockPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/change-password" element={<ProtectedRoute studentOnly><ChangePassword /></ProtectedRoute>} />

      <Route path="/" element={<ProtectedRoute studentOnly><DashboardLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="ipe/syllabus" element={<PapersPage module="ipe" category="syllabus" title="IPE Syllabus" />} />
        <Route path="ipe/pyq" element={<PapersPage module="ipe" category="pyq" title="IPE Previous Year Papers" showYearFilter />} />
        <Route path="ipe/important" element={<ImportantPage />} />
        <Route path="eamcet/syllabus" element={<PapersPage module="eamcet" category="syllabus" title="EAMCET Syllabus" />} />
        <Route path="eamcet/pyq" element={<PapersPage module="eamcet" category="pyq" title="EAMCET Previous Papers" showYearFilter />} />
        <Route path="eamcet/quiz" element={<QuizLevels />} />
        <Route path="eamcet/quiz/:level/exam" element={<ExamPage type="quiz" />} />
        <Route path="eamcet/quiz/:level/result/:attemptId" element={<ResultPage type="quiz" />} />
        <Route path="eamcet/mock" element={<MockPage />} />
        <Route path="eamcet/mock/exam" element={<ExamPage type="mock" />} />
        <Route path="eamcet/mock/result/:attemptId" element={<ResultPage type="mock" />} />
        <Route path="analytics" element={<AnalyticsPage />} />
      </Route>

      <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
