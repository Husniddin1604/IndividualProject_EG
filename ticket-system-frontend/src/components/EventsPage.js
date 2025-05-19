import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './EventsPage.css';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({ category: '', city: '', date: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const params = new URLSearchParams({
      status: 'active',
      category: filters.category,
      venue__city: filters.city,
      date: filters.date,
      page: page,
    });
    axios.get(`http://127.0.0.1:8080/api/events/?${params}`)
      .then(response => {
        setEvents(response.data.results || response.data);
        setTotalPages(Math.ceil(response.data.count / 10) || 1);
      })
      .catch(error => console.error('Error fetching events:', error));

    axios.get('http://127.0.0.1:8080/api/categories/')
      .then(response => setCategories(response.data))
      .catch(error => console.error('Error fetching categories:', error));
  }, [filters, page]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPage(1);
  };

  return (
    <div className="events-page">
      <h1>Все события</h1>
      <div className="filters">
        <select name="category" value={filters.category} onChange={handleFilterChange}>
          <option value="">Все категории</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
        <input
          type="text"
          name="city"
          placeholder="Город"
          value={filters.city}
          onChange={handleFilterChange}
        />
        <input
          type="date"
          name="date"
          value={filters.date}
          onChange={handleFilterChange}
        />
      </div>
      <div className="event-list">
        {events.map(event => (
          <div key={event.id} className="event-card">
            <img src={event.image || 'placeholder.jpg'} alt={event.title} />
            <h3>{event.title}</h3>
            <p>{new Date(event.date).toLocaleDateString()}</p>
            <p>{event.venue.name}, {event.venue.city}</p>
            <Link to={`/events/${event.id}`}>Подробнее</Link>
          </div>
        ))}
      </div>
      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>Назад</button>
        <span>Страница {page} из {totalPages}</span>
        <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>Вперёд</button>
      </div>
    </div>
  );
};

export default EventsPage;