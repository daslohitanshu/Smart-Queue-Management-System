import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const BookingPage = () => {
  const [name, setName] = useState('');
  const [service, setService] = useState('General Service');
  const navigate = useNavigate();

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/tokens/book`, {
        customer_name: name,
        service_type: service
      });
      navigate(`/status/${response.data.id}`);
    } catch (error) {
      console.error('Error booking token:', error);
      alert('Failed to book token. Is the server running?');
    }
  };

  return (
    <div className="container">
      <h2>Book Your Token</h2>
      <form onSubmit={handleBook} style={{ width: '100%' }}>
        <div className="form-group">
          <label>Full Name</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
            placeholder="Enter your name"
          />
        </div>
        <div className="form-group" style={{ marginTop: '1rem' }}>
          <label>Service Type</label>
          <select value={service} onChange={(e) => setService(e.target.value)}>
            <option value="General Service">General Service</option>
            <option value="Consultation">Consultation</option>
            <option value="Payment">Payment</option>
          </select>
        </div>
        <button type="submit" style={{ marginTop: '2rem', width: '100%' }}>Book Now</button>
      </form>
    </div>
  );
};

export default BookingPage;
