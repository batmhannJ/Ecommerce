import React, { useState, useEffect, useRef } from 'react';
import './RiderDashboard.css';
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from "axios";
import { ChevronLeft, ChevronRight } from 'lucide-react';

function RiderDashboard() {
  const [pendingPickups, setPendingPickups] = useState([]);
  const [toBeDelivered, setToBeDelivered] = useState([]);
  const [deliveredItems, setDeliveredItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [riderInfo, setRiderInfo] = useState({
    name: '',
    id: '',
    status: '',
    rating: 0
  });  const [currentLocation, setCurrentLocation] = useState(null);
  const [sortBy, setSortBy] = useState('date');
  const [dateFilter, setDateFilter] = useState('today');
  const [searchTerm, setSearchTerm] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [orderStats, setOrderStats] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [dailyOrderCount, setDailyOrderCount] = useState(0);
  const [pendingNewOrders, setPendingNewOrders] = useState([]);

  const [notifications, setNotifications] = useState([
    { id: 1, message: "New order has been assigned to you", time: "10 mins ago", read: false },
    { id: 2, message: "Your weekly performance report is available", time: "2 hours ago", read: false },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Create a socket.io reference using useRef to prevent multiple connections
  const [socket, setSocket] = useState(null);

    // New state for swipe functionality between Orders and Earnings
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    const [activeGraph, setActiveGraph] = useState('orders'); // 'orders' or 'earnings'
    const graphContainerRef = useRef(null);
    
    // State for earnings data
    const [earningsStats, setEarningsStats] = useState([]);

  const getRiderIdFromToken = () => {
    const riderToken = localStorage.getItem("rider_token");
    if (riderToken) {
      try {
        const payload = JSON.parse(atob(riderToken.split(".")[1]));
        return payload.id; // Ensure this matches the property name in your JWT payload
      } catch (error) {
        console.error("Error decoding token:", error);
        return null;
      }
    }
    return null;
  };

  useEffect(() => {
    if (!isLoading) {
      fetchEarningsStats();
    }
  }, [dateFilter, isLoading]);

  const fetchEarningsStats = async () => {
    try {
      let periodParam = '';
      if (dateFilter === 'today') {
        periodParam = '?period=today';
      } else if (dateFilter === 'week') {
        periodParam = '?period=week';
      } else if (dateFilter === 'month') {
        periodParam = '?period=month';
      }
  
      const response = await fetch(`http://localhost:4000/api/transactions/earnings${periodParam}`);
      if (!response.ok) throw new Error("Failed to fetch earnings statistics");
      const data = await response.json();
  
      let chartData = [];
      if (dateFilter === 'today') {
        chartData = data.map(item => ({
          time: item.hour.toString(), // Use "0", "1", ..., "23"
          label: `${item.hour}:00`, // Display label for XAxis
          earnings: item.earnings || 0
        }));
      } else if (dateFilter === 'week') {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        chartData = data.map(item => ({
          time: item.dayOfWeek.toString(), // Use "0", "1", ..., "6"
          label: days[item.dayOfWeek] || `Day ${item.dayOfWeek}`, // Display label
          earnings: item.earnings || 0
        }));
      } else if (dateFilter === 'month') {
        chartData = data.map(item => ({
          time: item.weekOfMonth.toString(), // Use "0", "1", ..., "4"
          label: `Week ${item.weekOfMonth}`, // Display label
          earnings: item.earnings || 0
        }));
      }
  
      setEarningsStats(chartData);
    } catch (error) {
      console.error('Error fetching earnings statistics:', error);
      toast.error("Error fetching earnings statistics");
      setEarningsStats([]);
    }
  };

  // Handle swipe events between orders and earnings graphs
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50; // minimum distance for a swipe
    
    if (Math.abs(distance) > minSwipeDistance) {
      // If swiping left or right, toggle between orders and earnings
      setActiveGraph(activeGraph === 'orders' ? 'earnings' : 'orders');
    }
    
    // Reset touch points
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Toggle between orders and earnings graphs
  const toggleGraphType = () => {
    setActiveGraph(activeGraph === 'orders' ? 'earnings' : 'orders');
  };

  // Calculate total earnings
  const calculateTotalEarnings = () => {
    return earningsStats.reduce((sum, item) => sum + (item.earnings || 0), 0).toFixed(2);
  };

  // Calculate average earnings
  const calculateAvgEarnings = () => {
    const total = earningsStats.reduce((sum, item) => sum + (item.earnings || 0), 0);
    const count = earningsStats.length || 1;
    return (total / count).toFixed(2);
  };

  useEffect(() => {
    const fetchRiderData = async () => {
      const riderToken = localStorage.getItem("rider_token");
      const riderId = getRiderIdFromToken();
      
      if (!riderToken || !riderId) {
        console.error("No token or rider ID found");
        // Redirect to login or show error
        return;
      }
      
      try {
        const response = await axios.get(`http://localhost:4000/api/riders/${riderId}`, {
          headers: {
            Authorization: `Bearer ${riderToken}`,
          },
        });
        
        setRiderInfo({
          name: response.data.name,
          id: response.data._id, // Make sure this matches your backend response structure
          status: response.data.status || 'Active',
          rating: response.data.rating || 4.0
        });
      } catch (error) {
        console.error("Error fetching rider data:", error);
        toast.error("Failed to load rider information");
      }
    };
  
    fetchRiderData();
  }, []);

  useEffect(() => {
    // Initialize socket connection
    const socketConnection = io("http://localhost:4000");
    setSocket(socketConnection);
    
    // Clean up on component unmount
    return () => {
      socketConnection.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socket) return; // Only proceed if socket is initialized

    fetchData();
    fetchOrderStats();
    getCurrentLocation();

    // Listen for new pending orders
    socket.on("newPendingOrder", (newOrder) => {
      console.log("New order received:", newOrder);
      setPendingNewOrders(prevOrders => {
        // Check if this order already exists in our state
        const exists = prevOrders.some(order => 
          (order._id === newOrder._id) || (order.transactionId === newOrder.transactionId)
        );
        
        if (!exists) {
          toast.info("New order available!");
          // Add to notifications
          const newNotification = {
            id: Date.now(),
            message: "New order is available for pickup",
            time: "Just now",
            read: false
          };
          setNotifications(prev => [newNotification, ...prev]);
          return [...prevOrders, newOrder];
        }
        return prevOrders;
      });
    });

    // Listen for orders that have been accepted by other riders
    socket.on("orderAccepted", (orderId) => {
      console.log("Order accepted by another rider:", orderId);
      // Remove the accepted order from pending new orders
      setPendingNewOrders(prevOrders => 
        prevOrders.filter(order => 
          (order._id !== orderId) && (order.transactionId !== orderId)
        )
      );
    });

    // Listen for updates from the server via Socket.IO
    socket.on("orderUpdated", (updatedOrder) => {
      console.log("Order updated:", updatedOrder);
      // Update the appropriate list based on status
      if (updatedOrder.status === "Cart Processing") {
        // Update pending pickups list
        setPendingPickups(prevOrders => {
          const exists = prevOrders.some(order => 
            (order._id === updatedOrder._id) || (order.transactionId === updatedOrder.transactionId)
          );
          
          if (!exists) {
            return [...prevOrders, updatedOrder];
          }
          
          return prevOrders.map(order => 
            (order._id === updatedOrder._id || order.transactionId === updatedOrder.transactionId) 
              ? { ...order, status: updatedOrder.status } 
              : order
          );
        });
        
        // Remove from pending new orders
        setPendingNewOrders(prevOrders => 
          prevOrders.filter(order => 
            (order._id !== updatedOrder._id) && (order.transactionId !== updatedOrder.transactionId)
          )
        );
      } else if (updatedOrder.status === "Out for Delivery") {
        // Remove from pending pickups
        setPendingPickups(prevOrders => 
          prevOrders.filter(order => 
            (order._id !== updatedOrder._id) && (order.transactionId !== updatedOrder.transactionId)
          )
        );
        
        // Add to to-be-delivered
        setToBeDelivered(prevOrders => {
          const exists = prevOrders.some(order => 
            (order._id === updatedOrder._id) || (order.transactionId === updatedOrder.transactionId)
          );
          
          if (!exists) {
            return [...prevOrders, updatedOrder];
          }
          
          return prevOrders.map(order => 
            (order._id === updatedOrder._id || order.transactionId === updatedOrder.transactionId) 
              ? { ...order, status: updatedOrder.status } 
              : order
          );
        });
      } else if (updatedOrder.status === "Delivered") {
        // Remove from to-be-delivered
        setToBeDelivered(prevOrders => 
          prevOrders.filter(order => 
            (order._id !== updatedOrder._id) && (order.transactionId !== updatedOrder.transactionId)
          )
        );
        
        // Add to delivered items
        setDeliveredItems(prevOrders => {
          const exists = prevOrders.some(order => 
            (order._id === updatedOrder._id) || (order.transactionId === updatedOrder.transactionId)
          );
          
          if (!exists) {
            return [...prevOrders, updatedOrder];
          }
          
          return prevOrders.map(order => 
            (order._id === updatedOrder._id || order.transactionId === updatedOrder.transactionId) 
              ? { ...order, status: updatedOrder.status } 
              : order
          );
        });
      }
      
      // After updating an order, refresh order stats
      fetchOrderStats();
    });
    
  }, [socket, dateFilter]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  };

  // Function to count orders that happened on a specific day
  const countDailyOrders = (orders) => {
    const today = new Date().toLocaleDateString();
    return orders.filter(order => {
      const orderDate = new Date(order.createdAt || order.date).toLocaleDateString();
      return orderDate === today;
    }).length;
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Add date filter as query parameter
      let dateParam = '';
      if (dateFilter === 'today') {
        dateParam = '?period=today';
      } else if (dateFilter === 'week') {
        dateParam = '?period=week';
      } else if (dateFilter === 'month') {
        dateParam = '?period=month';
      }

      // Fetch all transactions with a single request
      const response = await fetch(`http://localhost:4000/api/transactions${dateParam}`);
      
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      
      const data = await response.json();
      
      // Filter and categorize orders based on their status
      const pendingNewOrdersData = data.filter(order => order.status === "Pending");
      const pendingPickupsData = data.filter(order => order.status === "Cart Processing");
      const deliveringOrdersData = data.filter(order => order.status === "Out for Delivery");
      const completedOrdersData = data.filter(order => order.status === "Delivered");
      
      // Sort orders based on current sortBy state
      const sortedPendingNewOrders = sortOrders(pendingNewOrdersData);
      const sortedPendingPickups = sortOrders(pendingPickupsData);
      const sortedDelivering = sortOrders(deliveringOrdersData);
      const sortedCompleted = sortOrders(completedOrdersData);

      // Update state with the sorted data
      setPendingNewOrders(sortedPendingNewOrders);
      setPendingPickups(sortedPendingPickups);
      setToBeDelivered(sortedDelivering); 
      setDeliveredItems(sortedCompleted);
      
      // Calculate total orders for today
      const todayOrders = countDailyOrders([...sortedPendingPickups, ...sortedDelivering, ...sortedCompleted]);
      setDailyOrderCount(todayOrders);
      
      console.log('Pending new orders:', sortedPendingNewOrders);
      console.log('Pending pickups:', sortedPendingPickups);
      console.log('To be delivered:', sortedDelivering);
      console.log('Delivered items:', sortedCompleted);
      console.log('Today\'s total orders:', todayOrders);
      
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error("Error fetching orders data");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch order statistics for the graph from the backend
  const fetchOrderStats = async () => {
    try {
      let periodParam = '';
      if (dateFilter === 'today') {
        periodParam = '?period=today';
      } else if (dateFilter === 'week') {
        periodParam = '?period=week';
      } else if (dateFilter === 'month') {
        periodParam = '?period=month';
      }

      // Fetch order statistics data from the backend
      const response = await fetch(`http://localhost:4000/api/transactions/stats${periodParam}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch order statistics");
      }
      
      const data = await response.json();
      
      // Transform the data to match the expected format
      let chartData = [];
      
      if (dateFilter === 'today') {
        // Assuming data is hourly for today
        chartData = data.map(item => ({
          time: `${item.hour}:00`,
          orders: item.count
        }));
      } else if (dateFilter === 'week') {
        // Assuming data is daily for week
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        chartData = data.map(item => ({
          time: days[item.dayOfWeek] || `Day ${item.dayOfWeek}`,
          orders: item.count
        }));
      } else if (dateFilter === 'month') {
        // Assuming data is weekly for month
        chartData = data.map(item => ({
          time: `Week ${item.weekOfMonth}`,
          orders: item.count
        }));
      }
      
      setOrderStats(chartData);
      
    } catch (error) {
      console.error('Error fetching order statistics:', error);
      toast.error("Error fetching order statistics");
      
      // Fallback to empty data if the fetch fails
      setOrderStats([]);
    }
  };

  const updateOrderStatus = async (order, newStatus) => {
    if (!socket) return;
    
    try {
      if (window.confirm(`Are you sure you want to change the status to "${newStatus}"?`)) {
        const response = await fetch(`http://localhost:4000/api/transactions/${order.transactionId || order._id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            status: newStatus
          }),
        });
  
        if (!response.ok) {
          throw new Error("Failed to update status");
        }
        
        const updatedOrder = await response.json();
        
        // Handle UI updates based on the new status
        if (newStatus === "Out for Delivery") {
          // Remove from pending pickups
          setPendingPickups(prevOrders => 
            prevOrders.filter(o => 
              (o._id !== order._id) && (o.transactionId !== order.transactionId)
            )
          );
          
          // Add to to-be-delivered
          setToBeDelivered(prevOrders => [...prevOrders, {...order, status: newStatus}]);
        } else if (newStatus === "Delivered") {
          // Remove from to-be-delivered
          setToBeDelivered(prevOrders => 
            prevOrders.filter(o => 
              (o._id !== order._id) && (o.transactionId !== order.transactionId)
            )
          );
          
          // Add to delivered items
          setDeliveredItems(prevOrders => [...prevOrders, {...order, status: newStatus}]);
        }
  
        toast.success("Order status updated successfully!");
        fetchOrderStats(); // Update order stats
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error("Error updating order status");
    }
  };

  const handleAcceptOrder = async (order) => {
    if (!socket) return;
    
    try {
      if (window.confirm("Are you sure you want to accept this order?")) {
        // First, emit an event to notify other riders this order is being accepted
        socket.emit("acceptOrder", {
          orderId: order._id || order.transactionId,
          riderId: riderInfo.id
        });
        
        // Then update the status in your database
        const response = await fetch(`http://localhost:4000/api/transactions/${order.transactionId || order._id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            status: "Cart Processing",
            riderId: riderInfo.id
          }),
        });
  
        if (!response.ok) {
          throw new Error("Failed to update status");
        }
  
        toast.success("Order accepted successfully!");
        
        // Remove from pending new orders
        setPendingNewOrders(prevOrders => 
          prevOrders.filter(o => 
            (o._id !== order._id) && (o.transactionId !== order.transactionId)
          )
        );
        
        // Add the updated order to the cart processing list
        const updatedOrder = {...order, status: "Cart Processing", riderId: riderInfo.id};
        setPendingPickups(prev => [...prev, updatedOrder]);
        
        fetchOrderStats(); // Update order stats
      }
    } catch (error) {
      console.error('Error accepting order:', error);
      toast.error("Error accepting order");
    }
  };

  const handlePickup = (order) => {
    updateOrderStatus(order, 'Out for Delivery');
  };
  
  const handleDeliver = (order) => {
    updateOrderStatus(order, 'Delivered');
  };

  const handleProblem = (orderId, issue) => {
    // Open problem modal with the selected order
    setSelectedOrder(orderId);
  };

  const toggleRiderStatus = async () => {
    try {
      const newStatus = riderInfo.status === 'Active' ? 'Offline' : 'Active';
      const res = await fetch('http://localhost:4000/api/rider/status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!res.ok) {
        throw new Error("Failed to update rider status");
      }
      
      const data = await res.json();
      if (data) {
        setRiderInfo({...riderInfo, status: newStatus});
        toast.success(`Status updated to ${newStatus}`);
      }
    } catch (error) {
      console.error('Error updating rider status:', error);
      toast.error("Error updating rider status");
    }
  };

  const sortOrders = (orders) => {
    if (!orders) return [];
    
    if (sortBy === 'date') {
      return [...orders].sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
    } else if (sortBy === 'distance') {
      // Here you would calculate distance from current location
      return orders;
    } else if (sortBy === 'value') {
      return [...orders].sort((a, b) => (b.total || b.amount) - (a.total || a.amount));
    }
    return orders;
  };

  const filterOrdersBySearch = (orders) => {
    if (!searchTerm) return orders;
    
    return orders.filter(order => 
      (order._id && order._id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.userId?.name && order.userId.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.name && order.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.shippingAddress && order.shippingAddress.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.address && order.address.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(notifications.map(notif => ({...notif, read: true})));
  };

  const calculateDeliveryTime = (order) => {
    // Calculate estimated delivery time based on distance
    // This would typically use a mapping API in a real application
    return "25-35 mins";
  };

  const countUnreadNotifications = () => {
    return notifications.filter(notif => !notif.read).length;
  };

  const getTimeLabel = () => {
    if (dateFilter === 'today') return 'Hours';
    if (dateFilter === 'week') return 'Days';
    return 'Weeks';
  };

  if (isLoading) {
    return <div className="loading-container">Loading dashboard data...</div>;
  }

  return (
    <div className="rider-dashboard">
      <header className="dashboard-header">
        <h1>Rider Dashboard</h1>
        <div className="search-container">
          <input 
            type="text" 
            placeholder="Search orders, customers or addresses..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="rider-controls">
          <div className="notification-icon" onClick={() => setShowNotifications(!showNotifications)}>
            <span className="material-icons">notifications</span>
            {countUnreadNotifications() > 0 && <span className="notification-badge">{countUnreadNotifications()}</span>}
          </div>
        </div>
      </header>

      {showNotifications && (
        <div className="notifications-panel">
          <div className="notifications-header">
            <h3>Notifications</h3>
            <button className="btn-text" onClick={markAllNotificationsAsRead}>Mark all as read</button>
          </div>
          <div className="notifications-list">
            {notifications.length > 0 ? notifications.map(notif => (
              <div key={notif.id} className={`notification-item ${!notif.read ? 'unread' : ''}`}>
                <div className="notification-content">
                  <p>{notif.message}</p>
                  <span className="notification-time">{notif.time}</span>
                </div>
              </div>
            )) : (
              <div className="no-notifications">No new notifications</div>
            )}
          </div>
        </div>
      )}

      <div className="dashboard-top-row">
        <div className="dashboard-summary">
          <div className="summary-box pending">
            <h3>Pending Pickups</h3>
            <span className="count">{pendingPickups.length}</span>
          </div>
          <div className="summary-box delivering">
            <h3>To Be Delivered</h3>
            <span className="count">{toBeDelivered.length}</span>
          </div>
          <div className="summary-box delivered">
            <h3>Delivered</h3>
            <span className="count">{deliveredItems.length}</span>
          </div>
          
          {/* New Orders Pending Acceptance - Appears below summary boxes */}
        {pendingNewOrders.length > 0 && (
          <div className="new-orders-alert">
            <h3>New Orders Available</h3>
            <div className="new-orders-container">
              {pendingNewOrders.map((order) => (
                <div key={order._id || order.transactionId} className="new-order-card">
                  <div className="order-header">
                    <h3>Order #{(order._id || order.transactionId)?.substring(0, 8)}</h3>
                    <span className="status new">New Order</span>
                  </div>
                  <div className="order-details">
                    <div className="order-detail-row">
                      <div className="order-detail-col">
                        <p><strong>Customer:</strong> {order.userId?.name || order.name || 'N/A'}</p>
                        <p><strong>Phone:</strong> {order.userId?.phone || order.contact || 'N/A'}</p>
                        <p><strong>Date:</strong> {new Date(order.createdAt || order.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="order-detail-row">
                      <div className="order-detail-col">
                        <p><strong>Address:</strong> {order.shippingAddress || order.address || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="action-buttons">
                    <button className="btn-pickup" onClick={() => handleAcceptOrder(order)}>
                      Accept Order
                    </button>
                    <button className="btn-contact">
                      Contact Seller
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        </div>

          {/* Swipable Orders/Earnings Graph Container */}
        <div 
          className="orders-graph-container"
          ref={graphContainerRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="graph-header">
            <h2>Orders Summary</h2>
            <div className="toggle-view">
              <div className="graph-indicators">
                <div 
                  className={`graph-indicator ${activeGraph === 'orders' ? 'active' : ''}`}
                  onClick={() => setActiveGraph('orders')}
                />
                <div 
                  className={`graph-indicator ${activeGraph === 'earnings' ? 'active' : ''}`}
                  onClick={() => setActiveGraph('earnings')}
                />
              </div>
              <span className="view-label">{activeGraph === 'orders' ? 'Orders' : 'Earnings'}</span>
            </div>
            <div className="orders-tabs">
              <button 
                className={`orders-tab ${dateFilter === 'today' ? 'active' : ''}`} 
                onClick={() => setDateFilter('today')}
              >
                Today
              </button>
              <button 
                className={`orders-tab ${dateFilter === 'week' ? 'active' : ''}`} 
                onClick={() => setDateFilter('week')}
              >
                This Week
              </button>
              <button 
                className={`orders-tab ${dateFilter === 'month' ? 'active' : ''}`} 
                onClick={() => setDateFilter('month')}
              >
                This Month
              </button>
            </div>
          </div>
          
          <div className="graphs-wrapper">
            {/* Orders Graph - Shown when activeGraph is 'orders' */}
            <div className={`graph-panel ${activeGraph === 'orders' ? 'active' : ''}`}>
              <div className="orders-graph">
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={orderStats} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" label={{ value: getTimeLabel(), position: 'insideBottomRight', offset: 0 }} />
                    <YAxis label={{ value: 'Orders', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="orders" stroke="#8884d8" activeDot={{ r: 8 }} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
                <div className="orders-stats">
                  <div className="orders-stat">
                    <span>Total Orders</span>
                    <span>{orderStats.reduce((sum, item) => sum + item.orders, 0)}</span>
                  </div>
                  <div className="orders-stat">
                    <span>Average</span>
                    <span>
                      {(orderStats.reduce((sum, item) => sum + item.orders, 0) / (orderStats.length || 1)).toFixed(1)}/
                      {dateFilter === 'today' ? 'hour' : dateFilter === 'week' ? 'day' : 'week'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Earnings Graph - Shown when activeGraph is 'earnings' */}
            <div className={`graph-panel ${activeGraph === 'earnings' ? 'active' : ''}`}>
              <div className="earnings-graph">
                <ResponsiveContainer width="100%" height={200}>
                <LineChart
                  data={earningsStats}
                  margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                  isAnimationActive={true}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="time"
                    tickFormatter={(value) => earningsStats.find(item => item.time === value)?.label || value}
                    label={{ value: getTimeLabel(), position: 'insideBottomRight', offset: 0 }}
                  />
                  <YAxis label={{ value: 'Earnings (₱)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value) => [`₱${value}`, 'Earnings']} />
                  <Line
                    type="monotone"
                    dataKey="earnings"
                    stroke="#4CAF50"
                    activeDot={{ r: 8 }}
                    strokeWidth={2}
                    isAnimationActive={true}
                    animationDuration={300}
                  />
                </LineChart>
                </ResponsiveContainer>
                <div className="earnings-stats">
                  <div className="earnings-stat">
                    <span>Total Earnings</span>
                    <span>₱{calculateTotalEarnings()}</span>
                  </div>
                  <div className="earnings-stat">
                    <span>Average</span>
                    <span>
                      ₱{calculateAvgEarnings()}/
                      {dateFilter === 'today' ? 'hour' : dateFilter === 'week' ? 'day' : 'week'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="swipe-indicator">
            <p>Swipe to see {activeGraph === 'orders' ? 'earnings' : 'orders'} data</p>
          </div>
        </div>
      </div>

      <div className="orders-filter">
        <div className="filter-label">Sort by:</div>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="filter-select">
          <option value="date">Date</option>
          <option value="distance">Distance</option>
          <option value="value">Order Value</option>
        </select>
        <button className="btn-map" onClick={() => setShowMap(!showMap)}>
          {showMap ? 'Hide Map' : 'Show Map'}
        </button>
      </div>

      {showMap && (
        <div className="map-container">
          <div className="delivery-map">
            <p>Map would be displayed here with order locations</p>
            <p>Current rider location: {currentLocation ? `${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}` : 'Loading...'}</p>
          </div>
        </div>
      )}

      <div className="orders-sections">
        {/* Pending Pickups Section */}
        <section className="orders-section">
          <h2>Pending Pickups</h2>
          <div className="orders-container">
            {filterOrdersBySearch(pendingPickups).length > 0 ? (
              filterOrdersBySearch(pendingPickups).map((order) => (
                <div key={order._id || order.transactionId} className="order-card pending-card">
                  <div className="order-header">
                    <h3>Order #{(order._id || order.transactionId)?.substring(0, 8)}</h3>
                    <span className="status pending">Pending Pickup</span>
                  </div>
                  <div className="order-details">
                    <div className="order-detail-row">
                      <div className="order-detail-col">
                        <p><strong>Customer:</strong> {order.userId?.name || order.name || 'N/A'}</p>
                        <p><strong>Phone:</strong> {order.userId?.phone || order.contact || 'N/A'}</p>
                        <p><strong>Date:</strong> {new Date(order.createdAt || order.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="order-detail-row">
                      <div className="order-detail-col">
                        <p><strong>Address:</strong> {order.shippingAddress || order.address || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="item-list">
                    <h4>Items ({order.items?.length || order.quantity || 0})</h4>
                    <ul>
                      {order.items ? order.items.map((item, index) => (
                        <li key={index}>{item.quantity}x {item.product?.name || 'Unknown Product'}</li>
                      )) : (
                        <li>{order.quantity || 1}x {order.item || 'Unknown Item'}</li>
                      )}
                    </ul>
                    <h3><strong>Total:</strong> ₱{(order.total || order.amount)?.toFixed(2) || '0.00'}</h3>
                  </div>
                  
                  <div className="action-buttons">
                    <button className="btn-pickup" onClick={() => handlePickup(order)}>
                      Pick Up Order
                    </button>
                    <button className="btn-contact">
                      Contact Seller
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-orders">No pending pickups at the moment.</div>
            )}
          </div>
        </section>

        {/* To Be Delivered Section */}
        <section className="orders-section">
          <h2>To Be Delivered</h2>
          <div className="orders-container">
            {filterOrdersBySearch(toBeDelivered).length > 0 ? (
              filterOrdersBySearch(toBeDelivered).map((order) => (
                <div key={order._id || order.transactionId} className="order-card delivering-card">
                  <div className="order-header">
                    <h3>Order #{(order._id || order.transactionId)?.substring(0, 8)}</h3>
                    <span className="status delivering">Out for Delivery</span>
                  </div>
                  <div className="order-details">
                    <div className="order-detail-row">
                      <div className="order-detail-col">
                        <p><strong>Customer:</strong> {order.userId?.name || order.name || 'N/A'}</p>
                        <p><strong>Phone:</strong> {order.userId?.phone || order.contact || 'N/A'}</p>
                        <p><strong>Pickup Time:</strong> {new Date(order.pickedUpAt || order.date).toLocaleTimeString()}</p>
                      </div>
                    </div>
                    <div className="order-detail-row">
                      <div className="order-detail-col">
                        <p><strong>Address:</strong> {order.shippingAddress || order.address || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="delivery-progress">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: '50%' }}></div>
                    </div>
                    <div className="progress-labels">
                      <span>Picked up</span>
                      <span>On the way</span>
                      <span>Delivered</span>
                    </div>
                  </div>
                  <div className="item-list">
                    <h4>Items ({order.items?.length || order.quantity || 0})</h4>
                    <ul>
                      {order.items ? order.items.map((item, index) => (
                        <li key={index}>{item.quantity}x {item.product?.name || 'Unknown Product'}</li>
                      )) : (
                        <li>{order.quantity || 1}x {order.item || 'Unknown Item'}</li>
                      )}
                    </ul>
                    <h3><strong>Total:</strong> ₱{(order.total || order.amount)?.toFixed(2) || '0.00'}</h3>
                  </div>
                  <div className="action-buttons">
                    <button className="btn-deliver" onClick={() => handleDeliver(order)}>
                      Mark as Delivered
                    </button>
                    <button className="btn-problem" onClick={() => handleProblem(order._id || order.transactionId)}>
                      Report Issue
                    </button>
                    <button className="btn-navigate">
                      Navigate
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-orders">No orders to be delivered at the moment.</div>
            )}
          </div>
        </section>

        {/* Delivered Section */}
        <section className="orders-section">
          <h2>Delivered {dateFilter === 'today' ? 'Today' : dateFilter === 'week' ? 'This Week' : 'This Month'}</h2>
          <div className="orders-container">
            {filterOrdersBySearch(deliveredItems).length > 0 ? (
              filterOrdersBySearch(deliveredItems).map((order) => (
                <div key={order._id || order.transactionId} className="order-card delivered-card">
                  <div className="order-header">
                    <h3>Order #{(order._id || order.transactionId)?.substring(0, 8)}</h3>
                    <span className="status delivered">Delivered</span>
                  </div>
                  <div className="order-details">
                    <div className="order-detail-row">
                      <div className="order-detail-col">
                        <p><strong>Customer:</strong> {order.userId?.name || order.name || 'N/A'}</p>
                        <p><strong>Delivered:</strong> {new Date(order.updatedAt || order.date).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="order-detail-row">
                      <div className="order-detail-col">
                        <p><strong>Address:</strong> {order.shippingAddress || order.address || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="earnings-info">
                  </div>
                  <div className="item-list">
                    <h4>Items</h4>
                    <ul>
                      {order.items ? order.items.map((item, index) => (
                        <li key={index}>{item.quantity}x {item.product?.name || 'Unknown Product'}</li>
                      )) : (
                        <li>{order.quantity || 1}x {order.item || 'Unknown Item'}</li>
                      )}
                    </ul>
                    <h3><strong>Total:</strong> ₱{(order.total || order.amount)?.toFixed(2) || '0.00'}</h3>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-orders">No orders delivered {dateFilter === 'today' ? 'today' : dateFilter === 'week' ? 'this week' : 'this month'}.</div>
            )}
          </div>
        </section>
      </div>

      {selectedOrder && (
        <div className="modal problem-modal">
          <div className="modal-content">
            <h2>Report Delivery Issue</h2>
            <select className="issue-select">
              <option value="">Select issue type</option>
              <option value="address">Cannot find address</option>
              <option value="customer">Customer not available</option>
              <option value="damaged">Order damaged</option>
              <option value="incomplete">Order incomplete</option>
              <option value="other">Other</option>
            </select>
            <textarea className="issue-details" placeholder="Describe the issue..."></textarea>
            <div className="modal-buttons">
              <button className="btn-submit">Submit Report</button>
              <button className="btn-cancel" onClick={() => setSelectedOrder(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RiderDashboard;