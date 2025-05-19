import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [language, setLanguage] = useState('ru');

  // Загрузка событий и категорий
  useEffect(() => {
    // Получить активные события
    axios.get('http://127.0.0.1:8080/api/events/?status=active')
      .then(response => setEvents(response.data.slice(0, 6))) // Первые 6 событий
      .catch(error => console.error('Error fetching events:', error));

    // Получить категории
    axios.get('http://127.0.0.1:8080/api/categories/')
      .then(response => setCategories(response.data))
      .catch(error => console.error('Error fetching categories:', error));
  }, []);

  // Смена языка
  const handleLanguageChange = (lang) => {
    axios.post('http://127.0.0.1:8080/i18n/setlang/', { language: lang })
      .then(() => setLanguage(lang))
      .catch(error => console.error('Error setting language:', error));
  };

  // Поиск событий
  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="home-page">
      <header>
        <h1>Ticket System</h1>
        <div className="language-switcher">
          <button onClick={() => handleLanguageChange('ru')}>RU</button>
          <button onClick={() => handleLanguageChange('en')}>EN</button>
          <button onClick={() => handleLanguageChange('uz')}>UZ</button>
        </div>
        <nav>
          <Link to="/login">Вход</Link>
          <Link to="/register">Регистрация</Link>
          <Link to="/profile">Профиль</Link>
        </nav>
      </header>

      <section className="search">
        <input
          type="text"
          placeholder={language === 'ru' ? 'Поиск событий...' : language === 'en' ? 'Search events...' : 'Tadbirlar qidirish...'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </section>

      <section className="categories">
        <h2>{language === 'ru' ? 'Категории' : language === 'en' ? 'Categories' : 'Kategoriyalar'}</h2>
        <div className="category-list">
          {categories.map(category => (
            <Link key={category.id} to={`/events?category=${category.id}`}>
              {category.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="events">
        <h2>{language === 'ru' ? 'Популярные события' : language === 'en' ? 'Popular Events' : 'Mashhur Tadbirlar'}</h2>
        <div className="event-list">
          {filteredEvents.map(event => (
            <div key={event.id} className="event-card">
              <img src={event.image || 'placeholder.jpg'} alt={event.title} />
              <h3>{event.title}</h3>
              <p>{event.date}</p>
              <p>{event.venue.name}</p>
              <Link to={`/events/${event.id}`}>Подробнее</Link>
            </div>
          ))}
        </div>
      </section>

      <section className="banner">
        <h2>{language === 'ru' ? 'Скидка 10% на первое событие!' : language === 'en' ? '10% off your first event!' : 'Birinchi tadbirda 10% chegirma!'}</h2>
      </section>
    </div>
  );
};

export default HomePage;