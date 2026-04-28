import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import SplashPage from './pages/SplashPage';
import AuthPage from './pages/AuthPage';
import FeedPage from './pages/FeedPage';
import ChatPage from './pages/ChatPage';
import StudyPage from './pages/StudyPage';
import ProfilePage from './pages/ProfilePage';
import ExplorePage from './pages/ExplorePage';
import PeoplePage from './pages/PeoplePage';
import TrendingPage from './pages/TrendingPage';
import OnboardingPage from './pages/OnboardingPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<SplashPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/study" element={<StudyPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/people" element={<PeoplePage />} />
          <Route path="/trending" element={<TrendingPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
