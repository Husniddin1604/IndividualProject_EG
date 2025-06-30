import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from '../axiosConfig';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const initialTicketId = location.state?.ticketId || null;
  const [event, setEvent] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setIsLoading(true);
        setFormError(null);
        console.log(`Fetching event with ID: ${eventId}`);

        const response = await axios.get(`/api/events/${eventId}/`, {
          withCredentials: true
        });
        console.log('Event response:', response.data);

        setEvent(response.data);
        setTickets(response.data.tickets || []);

        const initialQuantities = {};
        response.data.tickets?.forEach(ticket => {
          initialQuantities[ticket.id] = initialTicketId && ticket.id === initialTicketId ? 1 : 0;
        });
        setQuantities(initialQuantities);
      } catch (error) {
        console.error('Error fetching event:', error.response?.data || error.message);
        setFormError(error.response?.data?.detail || 'Не удалось загрузить данные события. Пожалуйста, попробуйте позже.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, initialTicketId]);

  const handleQuantityChange = (ticketId, change) => {
    setQuantities(prev => ({
      ...prev,
      [ticketId]: Math.max(0, (prev[ticketId] || 0) + change)
    }));
  };

  const handlePaymentInfoChange = (e) => {
    const { name, value } = e.target;
    setPaymentInfo(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validatePaymentInfo = () => {
    const newErrors = {};
    if (!paymentInfo.name.trim()) {
      newErrors.name = 'Имя на карте обязательно';
    }
    if (!/^\d{16}$/.test(paymentInfo.cardNumber.replace(/\s/g, ''))) {
      newErrors.cardNumber = 'Номер карты должен содержать 16 цифр';
    }
    if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(paymentInfo.expiryDate)) {
      newErrors.expiryDate = 'Неверный формат срока действия (MM/YY)';
    } else {
      const [month, year] = paymentInfo.expiryDate.split('/');
      const expiryDate = new Date(`20${year}`, month - 1);
      if (expiryDate < new Date()) {
        newErrors.expiryDate = 'Карта истекла';
      }
    }
    if (!/^\d{3}$/.test(paymentInfo.cvv)) {
      newErrors.cvv = 'CVV должен содержать 3 цифры';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateSubtotal = () => {
    return tickets.reduce((total, ticket) => {
      return total + (ticket.price * (quantities[ticket.id] || 0));
    }, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const serviceFee = subtotal * 0.1;
    return subtotal + serviceFee;
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!validatePaymentInfo()) {
      return;
    }

    try {
      const selectedTickets = tickets
        .filter(ticket => quantities[ticket.id] > 0)
        .map(ticket => ({
          ticket_id: ticket.id,
          quantity: quantities[ticket.id]
        }));

      if (selectedTickets.length === 0) {
        setFormError('Пожалуйста, выберите хотя бы один билет');
        return;
      }

      console.log('Sending purchase data:', { tickets: selectedTickets, total_amount: calculateTotal() });

      const response = await axios.post('/api/purchases/', {
        tickets: selectedTickets.map(ticket => ticket.ticket_id),
        total_amount: calculateTotal(),
        payment_method: 'stripe',  // Совместимо с models.py
        delivery_method: 'electronic'
      }, { withCredentials: true });

      console.log('Purchase response:', response.data);
      navigate(`/purchases/${response.data.id}`);
    } catch (error) {
      console.error('Error creating purchase:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.detail || 'Не удалось оформить заказ. Пожалуйста, попробуйте позже.';
      setFormError(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="checkout-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  if (formError && !event) {
    return (
      <div className="checkout-page">
        <div className="error-message">{formError}</div>
        <button onClick={() => navigate('/events')} className="back-button">
          Вернуться к событиям
        </button>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="checkout-page">
        <div className="error-message">Событие не найдено</div>
        <button onClick={() => navigate('/events')} className="back-button">
          Вернуться к событиям
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <h1>Оформление заказа</h1>

      {formError && <div className="error-message">{formError}</div>}

      <div className="event-summary">
        <h2>{event.title}</h2>
        <p>{new Date(event.date).toLocaleDateString()}</p>
        <p>{event.venue.name}, {event.venue.city}</p>
      </div>

      <div className="ticket-selection">
        <h2>Выбор билетов</h2>
        {tickets.length === 0 ? (
          <p>Билеты на это событие отсутствуют</p>
        ) : (
          tickets.map(ticket => (
            <div key={ticket.id} className="ticket-type">
              <div className="ticket-info">
                <h3>{ticket.name}</h3>
                <p>Цена: {ticket.price} UZS</p>
                {ticket.sector && <p>Сектор: {ticket.sector}</p>}
                {ticket.row && <p>Ряд: {ticket.row}</p>}
                {ticket.seat_number && <p>Место: {ticket.seat_number}</p>}
              </div>
              <div className="ticket-quantity">
                <button
                  onClick={() => handleQuantityChange(ticket.id, -1)}
                  disabled={!quantities[ticket.id]}
                  aria-label="Уменьшить количество"
                >
                  -
                </button>
                <span>{quantities[ticket.id] || 0}</span>
                <button
                  onClick={() => handleQuantityChange(ticket.id, 1)}
                  aria-label="Увеличить количество"
                >
                  +
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="payment-section">
        <h2>Информация об оплате</h2>
        <form className="payment-form" onSubmit={handleCheckout}>
          <div className="form-group">
            <label htmlFor="name">Имя на карте</label>
            <input
              type="text"
              id="name"
              name="name"
              value={paymentInfo.name}
              onChange={handlePaymentInfoChange}
              className={errors.name ? 'error' : ''}
              placeholder="IVAN IVANOV"
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="cardNumber">Номер карты</label>
            <input
              type="text"
              id="cardNumber"
              name="cardNumber"
              value={paymentInfo.cardNumber}
              onChange={handlePaymentInfoChange}
              className={errors.cardNumber ? 'error' : ''}
              placeholder="1234 5678 9012 3456"
              maxLength="19"
            />
            {errors.cardNumber && <span className="error-text">{errors.cardNumber}</span>}
          </div>

          <div className="card-details">
            <div className="form-group">
              <label htmlFor="expiryDate">Срок действия</label>
              <input
                type="text"
                id="expiryDate"
                name="expiryDate"
                value={paymentInfo.expiryDate}
                onChange={handlePaymentInfoChange}
                className={errors.expiryDate ? 'error' : ''}
                placeholder="MM/YY"
                maxLength="5"
              />
              {errors.expiryDate && <span className="error-text">{errors.expiryDate}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="cvv">CVV</label>
              <input
                type="text"
                id="cvv"
                name="cvv"
                value={paymentInfo.cvv}
                onChange={handlePaymentInfoChange}
                className={errors.cvv ? 'error' : ''}
                placeholder="123"
                maxLength="3"
              />
              {errors.cvv && <span className="error-text">{errors.cvv}</span>}
            </div>
          </div>

          <div className="total-section">
            <h3>Итого</h3>
            <div className="total-row">
              <span>Подытог</span>
              <span>{calculateSubtotal()} UZS</span>
            </div>
            <div className="total-row">
              <span>Сервисный сбор (10%)</span>
              <span>{calculateSubtotal() * 0.1} UZS</span>
            </div>
            <div className="total-row final">
              <span>Итого к оплате</span>
              <span>{calculateTotal()} UZS</span>
            </div>
          </div>

          <button
            type="submit"
            className="checkout-button"
            disabled={calculateTotal() === 0 || isLoading}
          >
            {isLoading ? 'Обработка...' : 'Оплатить'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;