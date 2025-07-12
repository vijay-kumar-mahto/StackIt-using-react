import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import QuestionPage from './pages/QuestionPage';
import AskQuestionPage from './pages/AskQuestionPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserProfilePage from './pages/UserProfilePage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="container mx-auto px-4 py-6">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/questions/:id" element={<QuestionPage />} />
              <Route 
                path="/ask" 
                element={
                  <ProtectedRoute>
                    <AskQuestionPage />
                  </ProtectedRoute>
                } 
              />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/users/:username" element={<UserProfilePage />} />
            </Routes>
          </main>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
