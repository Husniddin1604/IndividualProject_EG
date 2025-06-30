import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../axiosConfig';
import './LoginPage.css';

const LoginPage = () => {
  const [form, setForm] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  // Get the redirect path from location state or default to profile
  const from = location.state?.from || '/profile';

  const validateForm = () => {
    const newErrors = {};
    if (!form.username.trim()) {
      newErrors.username = 'Имя пользователя обязательно';
    }
    if (!form.password) {
      newErrors.password = 'Пароль обязателен';
    } else if (form.password.length < 8) {
      newErrors.password = 'Пароль должен содержать минимум 8 символов';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // Отладка отправляемых данных
      console.log('Sending login data:', {
        username: form.username.trim(),
        password: form.password
      });

      const response = await axios.post('/api/core/login/', {
        username: form.username.trim(),
        password: form.password
      }, { withCredentials: true });

      console.log('Login response:', response.data);

      if (response.data.message === 'Login successful') {
        setLoginAttempts(0);
        navigate(from, { replace: true });
      } else {
        setErrors({ form: 'Неожиданный ответ сервера' });
        setLoginAttempts(prev => prev + 1);
      }
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || 'Ошибка входа';
      setErrors({ form: errorMessage });
      setLoginAttempts(prev => prev + 1);

      // Если слишком много попыток, блокируем форму
      if (loginAttempts >= 3) {
        setErrors({ form: 'Слишком много неудачных попыток. Попробуйте снова через 30 секунд.' });
        setTimeout(() => {
          setLoginAttempts(0);
          setErrors({});
        }, 30000); // 30 секунд
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <h1>Вход</h1>
      {errors.form && <div className="error-message">{errors.form}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            name="username"
            placeholder="Имя пользователя"
            value={form.username}
            onChange={handleChange}
            className={errors.username ? 'error' : ''}
            disabled={isLoading || loginAttempts >= 3}
          />
          {errors.username && <span className="error-text">{errors.username}</span>}
        </div>
        <div className="form-group">
          <input
            type="password"
            name="password"
            placeholder="Пароль"
            value={form.password}
            onChange={handleChange}
            className={errors.password ? 'error' : ''}
            disabled={isLoading || loginAttempts >= 3}
          />
          {errors.password && <span className="error-text">{errors.password}</span>}
        </div>
        <button
          type="submit"
          disabled={isLoading || loginAttempts >= 3}
          className={isLoading ? 'loading' : ''}
        >
          {isLoading ? 'Вход...' : 'Войти'}
        </button>
        {loginAttempts > 0 && loginAttempts < 3 && (
          <div className="attempts-warning">
            Неудачных попыток: {loginAttempts}/3
          </div>
        )}
      </form>
    </div>
  );
};

export default LoginPage;