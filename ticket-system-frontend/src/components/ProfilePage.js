import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProfilePage.css';

const ProfilePage = () => {
  const [purchases, setPurchases] = useState([]);

  useEffect(() => {
    axios.get('http://127.0.0.1:8080/api/purchases/')
      .then(response => setPurchases(response.data))
      .catch(error => console.error('Error fetching purchases:', error));
  }, []);

  return (
    <div className="profile-page">
      <h1>Мой профиль</h1>
      <h2>История покупок</h2>
      {purchases.length ? (
        <ul>
          {purchases.map(purchase => (
            <li key={purchase.id}>
              Дата: {new Date(purchase.purchase_date).toLocaleDateString()} - Сумма: {purchase.total_amount} UZS
              <ul>
                {purchase.tickets.map(ticket => (
                  <li key={ticket.id}>{ticket.event.title} - {ticket.ticket_type}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      ) : (
        <p>Покупок нет.</p>
      )}
    </div>
  );
};

export default ProfilePage;