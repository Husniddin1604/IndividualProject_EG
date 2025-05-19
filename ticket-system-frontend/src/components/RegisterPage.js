import React, { useState } from 'react';
import axios from 'axios';
import './RegisterPage.css';

const RegisterPage = () => {
  const [form, setForm] = useState({ username: '', email: '', password: '', phone_number: '', address: '', preferred_language: 'ru' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://127.0.0.1:8080/api/register/', form)
      .then(() => alert('Регистрация успешна!'))
      .catch(error => setError('Ошибка регистрации: ' + error.message));
  };

  return (
    <div className="register-page">
      <h1>Регистрация</h1>
      {error && <p>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input type="text" name="username" placeholder="Имя пользователя" value={form.username} onChange={handleChange} />
        <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} />
        <input type="password" name="password" placeholder="Пароль" value={form.password} onChange={handleChange} />
        <input type="text" name="phone_number" placeholder="Номер телефона" value={form.phone_number} onChange={handleChange} />
        <input type="text" name="address" placeholder="Адрес" value={form.address} onChange={handleChange} />
        <select name="preferred_language" value={form.preferred_language} onChange={handleChange}>
          <option value="ru">Русский</option>
          <option value="en">English</option>
          <option value="uz">O‘zbek</option>
        </select>
        <button type="submit">Зарегистрироваться</button>
      </form>
    </div>
  );
};

export default RegisterPage;