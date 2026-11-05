import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import BookingPage from './pages/BookingPage';
import StatusPage from './pages/StatusPage';
import AdminPage from './pages/AdminPage';
import FeedbackPage from './pages/FeedbackPage';
import './index.css';

function App() {
  return (
    <Router>
      <div className="App">
        <nav style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/">Book Token</Link> | 
          <Link to="/admin">Admin Dashboard</Link> |
          <Link to="/feedback">Feedback</Link>
        </nav>
        <Routes>
          <Route path="/" element={<BookingPage />} />
          <Route path="/status/:id" element={<StatusPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/feedback" element={<FeedbackPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
