import { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const FeedbackPage = () => {
  const [tokenNumber, setTokenNumber] = useState('');
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenNumber) {
        alert("Please enter your token number");
        return;
    }
    try {
      await axios.post(`${API_URL}/tokens/feedback-by-number`, {
        token_number: parseInt(tokenNumber),
        rating,
        feedback_text: feedback
      });
      setSubmitted(true);
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      if (error.response && error.response.status === 404) {
        alert("Token number not found. Please check and try again.");
      } else {
        alert("Error submitting feedback. Please try again.");
      }
    }
  };

  const StarRating = () => (
    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', margin: '1rem 0' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => setRating(star)}
          style={{
            fontSize: '2.5rem',
            cursor: 'pointer',
            color: star <= rating ? '#ffb400' : '#444'
          }}
        >
          ★
        </span>
      ))}
    </div>
  );

  return (
    <div className="container" style={{ maxWidth: '500px' }}>
      <h2>Submit Your Feedback</h2>
      {!submitted ? (
        <form onSubmit={handleSubmit} className="form-group">
          <label>Token Number</label>
          <input 
            type="number" 
            value={tokenNumber} 
            onChange={(e) => setTokenNumber(e.target.value)} 
            placeholder="e.g. 1"
            required
          />
          
          <label style={{ marginTop: '1rem' }}>Rating</label>
          <StarRating />

          <label style={{ marginTop: '1rem' }}>Comments</label>
          <textarea 
            value={feedback} 
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="How was your experience?"
            style={{ minHeight: '100px' }}
          />
          <button type="submit" style={{ marginTop: '1.5rem' }}>Submit Feedback</button>
        </form>
      ) : (
        <div className="token-card">
          <h3 style={{ color: '#4caf50' }}>Thank You!</h3>
          <p>Your feedback has been recorded.</p>
          <button onClick={() => setSubmitted(false)}>Submit Another</button>
        </div>
      )}
    </div>
  );
};

export default FeedbackPage;
