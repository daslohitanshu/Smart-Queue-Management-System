import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface Token {
  id: number;
  customer_name: string;
  service_type: string;
  token_number: number;
  status: string;
  rating?: number | null;
  feedback_text?: string | null;
}

const AdminPage = () => {
  const [queue, setQueue] = useState<Token[]>([]);
  const [allCustomers, setAllCustomers] = useState<Token[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchQueue = async () => {
    try {
      const response = await axios.get(`${API_URL}/tokens/queue`);
      setQueue(response.data);
    } catch (err) {
      console.error('Error fetching queue:', err);
    }
  };

  const fetchAllCustomers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_URL}/admin/customers`);
      if (Array.isArray(response.data)) {
        setAllCustomers(response.data);
      } else {
        setError('Received invalid data from server.');
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError('Failed to load customer history. Please check if server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(() => {
      if (!showHistory) fetchQueue();
    }, 5000);
    return () => clearInterval(interval);
  }, [showHistory]);

  const handleServe = async (id: number) => {
    try {
      await axios.patch(`${API_URL}/tokens/serve/${id}`);
      fetchQueue();
    } catch (err) {
      console.error('Error serving token:', err);
    }
  };

  const handleComplete = async (id: number) => {
    try {
      await axios.patch(`${API_URL}/tokens/complete/${id}`);
      fetchQueue();
    } catch (err) {
      console.error('Error completing token:', err);
    }
  };

  const toggleHistory = () => {
    if (!showHistory) {
      fetchAllCustomers();
    }
    setShowHistory(!showHistory);
  };

  const serving = queue.filter(t => t.status === 'serving')[0];
  const waiting = queue.filter(t => t.status === 'waiting');

  return (
    <div className="container" style={{ width: showHistory ? '100%' : '900px', maxWidth: '1200px' }}>
      <h1>Admin Dashboard</h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <button onClick={toggleHistory} style={{ background: showHistory ? '#444' : '#646cff' }}>
          {showHistory ? 'Back to Active Queue' : 'View Full Customer History (Admin Only)'}
        </button>
      </div>

      {!showHistory ? (
        <div style={{ display: 'flex', gap: '2rem', width: '100%', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <h2>Now Serving</h2>
            {serving ? (
              <div className="token-card" style={{ border: '2px solid #4caf50' }}>
                <div className="token-number" style={{ color: '#4caf50' }}>#{serving.token_number}</div>
                <p><b>{serving.customer_name}</b></p>
                <p>{serving.service_type}</p>
                <button onClick={() => handleComplete(serving.id)} style={{ background: '#4caf50', width: '100%' }}>Mark as Done</button>
              </div>
            ) : (
              <div className="token-card">
                <p>No one is being served.</p>
                <p>Call someone from the queue!</p>
              </div>
            )}
          </div>

          <div style={{ flex: 1.5, minWidth: '300px' }}>
            <h2>Queue (Waiting)</h2>
            <table className="queue-table">
              <thead>
                <tr>
                  <th>Token</th>
                  <th>Name</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {waiting.map(token => (
                  <tr key={token.id}>
                    <td>#{token.token_number}</td>
                    <td>{token.customer_name}</td>
                    <td>
                      <button 
                        onClick={() => handleServe(token.id)} 
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}
                      >
                        Call Next
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {waiting.length === 0 && <p style={{ marginTop: '1rem' }}>No tokens in waiting.</p>}
          </div>
        </div>
      ) : (
        <div style={{ width: '100%' }}>
          <h2>Full Customer History</h2>
          {loading && <p>Loading customer history...</p>}
          {error && <p style={{ color: '#f44336' }}>{error}</p>}
          {!loading && !error && (
            <>
              <table className="queue-table">
                <thead>
                  <tr>
                    <th>Token</th>
                    <th>Name</th>
                    <th>Service</th>
                    <th>Status</th>
                    <th>Rating</th>
                    <th>Feedback</th>
                  </tr>
                </thead>
                <tbody>
                  {allCustomers.map(c => (
                    <tr key={c.id}>
                      <td>#{c.token_number}</td>
                      <td>{c.customer_name}</td>
                      <td>{c.service_type}</td>
                      <td style={{ textTransform: 'capitalize' }}>{c.status}</td>
                      <td style={{ color: '#ffb400' }}>
                        {c.rating ? '★'.repeat(c.rating) : '-'}
                      </td>
                      <td style={{ fontSize: '0.85rem', maxWidth: '250px', fontStyle: 'italic' }}>
                        {c.feedback_text || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {allCustomers.length === 0 && <p>No records found in database.</p>}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPage;
