import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './ProfilePage.css';

const ProfilePage = () => {
  const [purchases, setPurchases] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch user data
        const userResponse = await axios.get('/api/core/profile/', {
          withCredentials: true,
        });
        console.log('User response:', userResponse.data);
        setUser(userResponse.data);

        // Fetch purchases
        const purchasesResponse = await axios.get('/api/purchases/', {
          withCredentials: true,
        });
        console.log('Purchases response:', purchasesResponse.data);
        setPurchases(purchasesResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error.response?.data || error.message);
        setError(t('errorLoadingData'));
        if (error.response?.status === 401 || error.response?.status === 403) {
          navigate('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate, t]);

  if (isLoading) {
    return (
      <div className="profile-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page">
        <div className="error-message">{error}</div>
        <button onClick={() => navigate('/events')} className="back-button">
          {t('backToEvents')}
        </button>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <h1>{t('myProfile')}</h1>

      {/* User Information Section */}
      {user && (
        <div className="profile-section user-info">
          <h2>{t('userInfo')}</h2>
          <div className="profile-info">
            <p>
              <strong>{t('username')}:</strong> {user.username}
            </p>
            <p>
              <strong>{t('email')}:</strong> {user.email}
            </p>
            <p>
              <strong>{t('phone')}:</strong> {user.phone_number || t('notProvided')}
            </p>
            <p>
              <strong>{t('address')}:</strong> {user.address || t('notProvided')}
            </p>
            <p>
              <strong>{t('language')}:</strong>{' '}
              {user.preferred_language === 'ru'
                ? 'Русский'
                : user.preferred_language === 'en'
                ? 'English'
                : 'Oʻzbek'}
            </p>
          </div>
        </div>
      )}

      {/* Purchase History Section */}
      <div className="profile-section">
        <h2>{t('purchaseHistory')}</h2>
        {purchases.length ? (
          <ul className="ticket-list">
            {purchases.map(purchase => (
              <li key={purchase.id} className="ticket-card">
                <h3>
                  {t('date')}: {new Date(purchase.purchase_date).toLocaleDateString()}
                </h3>
                <div className="ticket-details">
                  <p>
                    {t('amount')}: {purchase.total_amount} UZS
                  </p>
                  {purchase.tickets.map(ticket => (
                    <p key={ticket.id}>
                      {ticket.event_title} - {ticket.name}
                      {ticket.sector && ` (${t('sector')}: ${ticket.sector})`}
                      {ticket.row && ` (${t('row')}: ${ticket.row})`}
                      {ticket.seat_number && ` (${t('seat')}: ${ticket.seat_number})`}
                    </p>
                  ))}
                </div>
                <span
                  className={`ticket-status ${
                    purchase.payment_status === 'completed'
                      ? 'active'
                      : purchase.payment_status === 'failed'
                      ? 'expired'
                      : 'used'
                  }`}
                >
                  {purchase.payment_status === 'completed'
                    ? t('statusCompleted')
                    : purchase.payment_status === 'failed'
                    ? t('statusFailed')
                    : t('statusPending')}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-tickets">{t('noPurchases')}</p>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;