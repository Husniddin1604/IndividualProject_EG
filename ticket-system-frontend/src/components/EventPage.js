import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import './EventPage.css';

const EventPage = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    axios.get(`http://127.0.0.1:8080/api/events/${id}/`)
      .then(response => setEvent(response.data))
      .catch(error => console.error('Error fetching event:', error));

    axios.get(`http://127.0.0.1:8080/api/tickets/?event=${id}&is_sold=false`)
      .then(response => setTickets(response.data))
      .catch(error => console.error('Error fetching tickets:', error));
  }, [id]);

  if (!event) return <div>Загрузка...</div>;

  return (
    <div className="event-page">
      <h1>{event.title}</h1>
      <img src={event.image || 'placeholder.jpg'} alt={event.title} />
      <div className="event-details">
        <p><strong>Дата:</strong> {new Date(event.date).toLocaleString()}</p>
        <p><strong>Место:</strong> {event.venue.name}, {event.venue.city}</p>
        <p><strong>Организатор:</strong> {event.organizer.name}</p>
        <p><strong>Категории:</strong> {event.categories.map(c => c.name).join(', ')}</p>
        <p><strong>Описание:</strong> {event.description}</p>
      </div>
      <div className="tickets">
        <h2>Доступные билеты</h2>
        {tickets.length ? (
          <ul>
            {tickets.map(ticket => (
              <li key={ticket.id}>
                {ticket.ticket_type} - {ticket.price} UZS (Сектор: {ticket.sector || 'Нет'}, Место: {ticket.seat_number || 'Не назначено'})
                <Link to="/checkout" state={{ ticketId: ticket.id }}>Купить</Link>
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