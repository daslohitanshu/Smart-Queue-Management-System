import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface TokenStatus {
  token_number: number;
  customer_name: string;
  service_type: string;
  status: string;
  position: number;
  estimated_wait: number;
  rating?: number;
  feedback_text?: string;
}

const StatusPage = () => {
  const { id } = useParams<{ id: string }>();
  const [status, setStatus] = useState<TokenStatus | null>(null);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const fetchStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/tokens/status/${id}`);
      setStatus(response.data);
      if (response.data.rating !== null && response.data.rating !== undefined) {
        setSubmitted(true);
      }
    } catch (error) {
      console.error('Error fetching status:', error);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, [id]);

  const handleFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/tokens/feedback/${id}`, {
        rating,
        feedback_text: feedback
      });
      setSubmitted(true);
      fetchStatus();
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const StarRating = () => (
    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', margin: '1rem 0' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => setRating(star)}
          style={{
            fontSize: '2rem',
            cursor: 'pointer',
            color: star <= rating ? '#ffb400' : '#444'
          }}
        >
          ★
        </span>
      ))}
    </div>
  );

  if (!status) return <div>Loading...</div>;

  return (
    <div className="container">
      <h2>Token Status</h2>
      <div className="token-card">
        <p>Hello, {status.customer_name}</p>
        <div className="token-number">#{status.token_number}</div>
        <p>Service: {status.service_type}</p>
        <p>Status: <b style={{ color: status.status === 'serving' ? '#4caf50' : '#646cff' }}>{status.status.toUpperCase()}</b></p>
      </div>

      {status.status === 'waiting' && (
        <div style={{ marginTop: '1rem' }}>
          <p>Your Position: <b>{status.position}</b></p>
          <p>Est. Waiting Time: <b>{status.estimated_wait} mins</b></p>
        </div>
      )}

      {status.status === 'completed' && !submitted && (
        <div style={{ marginTop: '2rem', width: '100%' }}>
          <h3>Service Completed!</h3>
          <p>Rate your experience:</p>
          <form onSubmit={handleFeedback} className="form-group">
            <StarRating />
            <label style={{ marginTop: '1rem' }}>Comments:</label>
            <textarea 
              value={feedback} 
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="How was your experience?"
              style={{ background: '#2a2a2a', color: 'white', padding: '0.5rem', borderRadius: '6px', minHeight: '80px' }}
            />
            <button type="submit" style={{ marginTop: '1rem' }}>Submit Feedback</button>
          </form>
        </div>
      )}

      {(submitted || (status.status === 'completed' && status.rating)) && (
        <div style={{ marginTop: '1.5rem', background: '#333', padding: '1rem', borderRadius: '8px' }}>
          <p style={{ color: '#4caf50', fontWeight: 'bold' }}>Thank you for your feedback!</p>
          <div style={{ color: '#ffb400', fontSize: '1.2rem' }}>
            {'★'.repeat(status.rating || rating)}{'☆'.repeat(5 - (status.rating || rating))}
          </div>
          {status.feedback_text && <p style={{ fontStyle: 'italic' }}>"{status.feedback_text}"</p>}
        </div>
      )}

      <Link to="/" style={{ marginTop: '2rem', display: 'block' }}>Book another token</Link>
    </div>
  );
};

export default StatusPage;
