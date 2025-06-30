import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './EventsPage.css';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({ category: '', city: '', date: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Build query parameters, excluding empty filters
        const params = new URLSearchParams();
        params.append('status', 'active');
        if (filters.category) params.append('category', filters.category);
        if (filters.city) params.append('venue__city', filters.city);
        if (filters.date) params.append('date', filters.date);
        params.append('page', page);

        const [eventsResponse, categoriesResponse] = await Promise.all([
          axios.get(`/api/events/?${params.toString()}`, { withCredentials: true }),
          axios.get('/api/categories/', { withCredentials: true }),
        ]);

        setEvents(eventsResponse.data.results || eventsResponse.data);
        setTotalPages(Math.ceil(eventsResponse.data.count / 10) || 1);
        setCategories(categoriesResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error.response?.data || error.message);
        setError(t('errorLoadingEvents'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [filters, page, t]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPage(1); // Reset to first page on filter change
  };

  if (isLoading) {
    return (
      <div className="events-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="events-page">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="events-page">
      <h1>{t('allEvents')}</h1>

      <div className="filters">
        <select
          name="category"
          value={filters.category}
          onChange={handleFilterChange}
          aria-label={t('selectCategory')}
        >
          <option value="">{t('allCategories')}</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          name="city"
          placeholder={t('city')}
          value={filters.city}
          onChange={handleFilterChange}
          aria-label={t('enterCity')}
        />

        <input
          type="date"
          name="date"
          value={filters.date}
          onChange={handleFilterChange}
          aria-label={t('selectDate')}
        />
      </div>

      <div className="event-list">
        {events.map(event => (
          <div key={event.id} className="event-card">
            <img
              src={event.image || '/placeholder.jpg'}
              alt={event.title}
              onError={e => {
                e.target.src = '/placeholder.jpg';
              }}
            />
            <div className="event-card-content">
              <h3>{event.title}</h3>
              <p>{new Date(event.date).toLocaleDateString()}</p>
              <p>
                {event.venue.name}, {event.venue.city}
              </p>
              <Link to={`/events/${event.id}`}>{t('details')}</Link>
            </div>
          </div>
        ))}
      </div>

      {events.length === 0 && (
        <div className="no-events">
          <p>{t('noEventsFound')}</p>
        </div>
      )}

      <div className="pagination">
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
          aria-label={t('previousPage')}
        >
          {t('previous')}
        </button>
        <span>
          {t('page')} {page} {t('of')} {totalPages}
        </span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={page === totalPages}
          aria-label={t('nextPage')}
        >
          {t('next')}
        </button>
      </div>
    </div>
  );
};

export default EventsPage;