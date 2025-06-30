import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './HomePage.css';

const HomePage = () => {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [eventsResponse, categoriesResponse] = await Promise.all([
          axios.get('http://127.0.0.1:8080/api/events/?status=active'),
          axios.get('http://127.0.0.1:8080/api/categories/')
        ]);

        setEvents(eventsResponse.data.results || eventsResponse.data);
        setCategories(categoriesResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(t('errorLoadingData'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [t]);

  const handleSearch = (e) => {
    setSearchInput(e.target.value);
  };

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchInput.toLowerCase()) ||
    event.description.toLowerCase().includes(searchInput.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="home-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-page">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <h1>{t('welcome')}</h1>

      <div className="search">
        <input
          type="text"
          placeholder={t('searchPlaceholder')}
          value={searchInput}
          onChange={handleSearch}
          aria-label={t('searchPlaceholder')}
        />
      </div>

      <div className="categories">
        <h2>{t('categories')}</h2>
        <div className="category-list">
          {categories.map(category => (
            <Link
              key={category.id}
              to={`/events?category=${category.id}`}
              aria-label={`${t('showEventsInCategory')} ${category.name}`}
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>

      <div className="events">
        <h2>{t('popularEvents')}</h2>
        <div className="event-list">
          {filteredEvents.map(event => (
            <div key={event.id} className="event-card">
              <img src={event.image || '/placeholder.jpg'} alt={event.title} />
              <div className="event-card-content">
                <h3>{event.title}</h3>
                <p>{new Date(event.date).toLocaleDateString()}</p>
                <p>{event.venue.name}, {event.venue.city}</p>
                <Link to={`/events/${event.id}`}>{t('details')}</Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="banner">
        <h2>{t('bannerTitle')}</h2>
        <p>{t('bannerSubtitle')}</p>
        <Link to="/events" className="banner-button">{t('viewAllEvents')}</Link>
      </div>
    </div>
  );
};

export default HomePage;