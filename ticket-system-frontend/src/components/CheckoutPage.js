import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const { state } = useLocation();
  const ticketId = state?.ticketId;
  const [ticket, setTicket] = useState(null);
  const [csrfToken, setCsrfToken] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('http://127.0.0.1:8080/api/get-csrf/')
      .then(response => setCsrfToken(response.data.csrfToken))
      .catch(error => console.error('Error fetching CSRF:', error));

    if (ticketId) {
      axios.get(`http://127.0.0.1:8080/api/tickets/${ticketId}/`)
        .then(response => setTicket(response.data))
        .catch(error => setError('Error fetching ticket'));
    }
  }, [ticketId]);

  const handlePurchase = () => {
    if (!ticket || !csrfToken) {
      setError('Ticket or CSRF token missing');
      return;
    }
    axios.post('http://127.0.0.1:8080/api/purchases/', {
      tickets: [ticket.id],
      total_amount: ticket.price,
    }, {
      headers: { 'X-CSRFToken': csrfToken },
    })
      .then(() => alert('Покупка успешна!'))
      .catch(error => setError('Purchase failed: ' + error.message));
  };

  if (error) return <div>{error}</div>;
  if (!ticket) return <div>Загрузка...</div>;

  return (
    <div className="checkout-page">
      <h1>Оформление заказа</h1>
      <div className="ticket-details">
        <p><strong>Событие:</strong> {ticket.event.title}</p>
        <p><strong>Тип:</strong> {ticket.ticket_type}</p>
        <p><strong>Цена:</strong> {ticket.price} UZS</p>
      </div>
      <button onClick={handlePurchase}>Оплатить</button>
    </div>
  );
};

export default CheckoutPage;