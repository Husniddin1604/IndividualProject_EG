import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import './EventPage.css';

const EventPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setIsLoading(true);
        console.log(`Fetching event with ID: ${id}`);
        const response = await axios.get(`/api/events/${id}/`, {
          withCredentials: true
        });
        console.log('Event response:', response.data);
        setEvent(response.data);
      } catch (error) {
        console.error('Error fetching event:', error.response?.data || error.message);
        setError(error.response?.data?.detail || 'Не удалось загрузить событие');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleBuyTickets = (ticketId) => {
    console.log(`Navigating to checkout for event ID: ${id}, ticket ID: ${ticketId}`);
    navigate(`/checkout/${id}`, { state: { ticketId } });
  };

  if (isLoading) {
    return <div className="event-page">Загрузка...</div>;
  }

  if (error) {
    return (
      <div className="event-page">
        <div className="error-message">{error}</div>
        <button onClick={() => navigate('/events')} className="back-button">
          Вернуться к событиям
        </button>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="event-page">
        <div className="error-message">Событие не найдено</div>
        <button onClick={() => navigate('/events')} className="back-button">
          Вернуться к событиям
        </button>
      </div>
    );
  }

  return (
    <div className="event-page">
      <h1>{event.title}</h1>
      <img src={event.image || 'placeholder.jpg'} alt={event.title} />
      <div className="event-details">
        <p><strong>Дата:</strong> {new Date(event.date).toLocaleString()}</p>
        <p><strong>Место:</strong> {event.venue.name}, {event.venue.city}</p>
        <p><strong>Организатор:</strong> {event.organizer.name}</p>
        <p><strong>Категории:</strong> {event.categories.map(c => c.name).join(', ') || 'Нет категорий'}</p>
        <p><strong>Описание:</strong> {event.description}</p>
      </div>
      <div className="tickets">
        <h2>Доступные билеты</h2>
        {event.tickets && event.tickets.length > 0 ? (
          <ul>
            {event.tickets.map(ticket => (
              <li key={ticket.id}>
                {ticket.name} - {ticket.price} UZS
                {ticket.sector && ` (Сектор: ${ticket.sector})`}
                {ticket.row && ` (Ряд: ${ticket.row})`}
                {ticket.seat_number && ` (Место: ${ticket.seat_number})`}
                <button onClick={() => handleBuyTickets(ticket.id)} className="buy-button">
                  Купить
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>Билеты недоступны.</p>
        )}
      </div>
    </div>
  );
};

export default EventPage;