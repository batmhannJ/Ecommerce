import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaMotorcycle, FaClipboardList, FaMoneyBillWave, FaStar, FaBell, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './Dashboard.css';

const RiderDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [riderData, setRiderData] = useState({});
  const [activeDeliveries, setActiveDeliveries] = useState([]);
  const [recentDeliveries, setRecentDeliveries] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isOnline, setIsOnline] = useState(false);

  // Get rider token from localStorage
  const riderToken = localStorage.getItem('admin_token');
  
  useEffect(() => {
    // Redirect if not logged in
    if (!riderToken) {
      window.location.href = '/login';
      return;
    }

    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch rider profile data
        const profileResponse = await axios.get('http://localhost:4000/api/rider/profile', {
          headers: {
            Authorization: `Bearer ${riderToken}`
          }
        });
        
        // Fetch active deliveries
        const activeDeliveriesResponse = await axios.get('http://localhost:4000/api/rider/active-deliveries', {
          headers: {
            Authorization: `Bearer ${riderToken}`
          }
        });
        
        // Fetch recent deliveries
        const recentDeliveriesResponse = await axios.get('http://localhost:4000/api/rider/recent-deliveries', {
          headers: {
            Authorization: `Bearer ${riderToken}`
          }
        });
        
        // Fetch notifications
        const notificationsResponse = await axios.get('http://localhost:4000/api/rider/notifications', {
          headers: {
            Authorization: `Bearer ${riderToken}`
          }
        });
        
        setRiderData(profileResponse.data.rider);
        setActiveDeliveries(activeDeliveriesResponse.data.deliveries);
        setRecentDeliveries(recentDeliveriesResponse.data.deliveries);
        setNotifications(notificationsResponse.data.notifications);
        setIsOnline(profileResponse.data.rider.isOnline || false);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [riderToken]);

  const toggleOnlineStatus = async () => {
    try {
      const response = await axios.post(
        'http://localhost:4000/api/rider/toggle-status',
        { isOnline: !isOnline },
        {
          headers: {
            Authorization: `Bearer ${riderToken}`
          }
        }
      );
      
      setIsOnline(!isOnline);
      toast.success(isOnline ? 'You are now offline' : 'You are now online and can receive delivery requests');
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Failed to update your status. Please try again.');
    }
  };

  const startDelivery = async (deliveryId) => {
    try {
      await axios.post(
        `http://localhost:4000/api/rider/start-delivery/${deliveryId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${riderToken}`
          }
        }
      );
      
      // Update the delivery status in the UI
      const updatedDeliveries = activeDeliveries.map(delivery => 
        delivery._id === deliveryId ? { ...delivery, status: 'in_progress' } : delivery
      );
      
      setActiveDeliveries(updatedDeliveries);
      toast.success('Delivery started successfully');
    } catch (error) {
      console.error('Error starting delivery:', error);
      toast.error('Failed to start delivery. Please try again.');
    }
  };

  const completeDelivery = async (deliveryId) => {
    try {
      await axios.post(
        `http://localhost:4000/api/rider/complete-delivery/${deliveryId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${riderToken}`
          }
        }
      );
      
      // Remove the completed delivery from active deliveries
      const updatedDeliveries = activeDeliveries.filter(delivery => delivery._id !== deliveryId);
      setActiveDeliveries(updatedDeliveries);
      
      toast.success('Delivery completed successfully');
    } catch (error) {
      console.error('Error completing delivery:', error);
      toast.error('Failed to complete delivery. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="rider-dashboard">
      <header className="dashboard-header">
        <h1>Welcome, {riderData.name}</h1>
        <div className="status-toggle">
          <span>Status: {isOnline ? 'Online' : 'Offline'}</span>
          <button className={`toggle-button ${isOnline ? 'online' : 'offline'}`} onClick={toggleOnlineStatus}>
            {isOnline ? <FaToggleOn size={24} /> : <FaToggleOff size={24} />}
          </button>
        </div>
      </header>

      <div className="dashboard-stats">
        <div className="stat-card">
          <FaClipboardList className="stat-icon" />
          <div className="stat-content">
            <h3>Today's Deliveries</h3>
            <p className="stat-value">{riderData.todayDeliveries || 0}</p>
          </div>
        </div>
        <div className="stat-card">
          <FaMoneyBillWave className="stat-icon" />
          <div className="stat-content">
            <h3>Today's Earnings</h3>
            <p className="stat-value">₱{riderData.todayEarnings || 0}</p>
          </div>
        </div>
        <div className="stat-card">
          <FaStar className="stat-icon" />
          <div className="stat-content">
            <h3>Rating</h3>
            <p className="stat-value">{riderData.rating || 0} / 5</p>
          </div>
        </div>
      </div>

      <section className="active-deliveries">
        <h2>Active Deliveries</h2>
        {activeDeliveries.length === 0 ? (
          <div className="no-data-message">
            <FaMotorcycle size={32} />
            <p>No active deliveries at the moment.</p>
            {!isOnline && <p>Go online to receive delivery requests.</p>}
          </div>
        ) : (
          <div className="deliveries-list">
            {activeDeliveries.map(delivery => (
              <div key={delivery._id} className="delivery-card">
                <div className="delivery-header">
                  <h3>Order #{delivery.orderNumber}</h3>
                  <span className={`status-badge ${delivery.status}`}>
                    {delivery.status === 'assigned' ? 'New' : 
                     delivery.status === 'in_progress' ? 'In Progress' : 
                     delivery.status === 'picked_up' ? 'Picked Up' : delivery.status}
                  </span>
                </div>
                <div className="delivery-details">
                  <div className="detail-item">
                    <strong>Pickup:</strong> {delivery.pickupAddress}
                  </div>
                  <div className="detail-item">
                    <strong>Delivery:</strong> {delivery.deliveryAddress}
                  </div>
                  <div className="detail-item">
                    <strong>Distance:</strong> {delivery.distance} km
                  </div>
                  <div className="detail-item">
                    <strong>Payment:</strong> ₱{delivery.amount}
                  </div>
                </div>
                <div className="delivery-actions">
                  {delivery.status === 'assigned' && (
                    <button 
                      className="action-button start-button"
                      onClick={() => startDelivery(delivery._id)}
                    >
                      Start Delivery
                    </button>
                  )}
                  {(delivery.status === 'in_progress' || delivery.status === 'picked_up') && (
                    <button 
                      className="action-button complete-button"
                      onClick={() => completeDelivery(delivery._id)}
                    >
                      Complete Delivery
                    </button>
                  )}
                  <button className="action-button navigate-button">
                    Navigate
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="recent-deliveries">
        <h2>Recent Deliveries</h2>
        {recentDeliveries.length === 0 ? (
          <div className="no-data-message">
            <p>No recent deliveries.</p>
          </div>
        ) : (
          <div className="recent-deliveries-list">
            {recentDeliveries.map(delivery => (
              <div key={delivery._id} className="recent-delivery-item">
                <div className="recent-delivery-info">
                  <h4>Order #{delivery.orderNumber}</h4>
                  <p>{new Date(delivery.completedAt).toLocaleDateString()}</p>
                </div>
                <div className="recent-delivery-details">
                  <p>{delivery.pickupAddress} → {delivery.deliveryAddress}</p>
                </div>
                <div className="recent-delivery-amount">
                  <strong>₱{delivery.amount}</strong>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="notifications">
        <h2>Notifications</h2>
        {notifications.length === 0 ? (
          <div className="no-data-message">
            <FaBell size={24} />
            <p>No new notifications.</p>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map(notification => (
              <div key={notification._id} className="notification-item">
                <div className="notification-icon">
                  <FaBell />
                </div>
                <div className="notification-content">
                  <p>{notification.message}</p>
                  <small>{new Date(notification.createdAt).toLocaleString()}</small>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default RiderDashboard;