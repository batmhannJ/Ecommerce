import React, { useState, useEffect, useContext } from "react";
import { ShopContext } from "../../Context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";
import "./MyOrders.css";
import io from "socket.io-client";

const getUserIdFromToken = () => {
  const authToken = localStorage.getItem("auth-token");
  if (authToken) {
    const payload = JSON.parse(atob(authToken.split(".")[1]));
    return payload.user.id;
  }
  return null;
};

const getTotalCartAmount = () => {
  const cartDetails = JSON.parse(localStorage.getItem("cartDetails"));
  if (!cartDetails) return 0;
  return cartDetails.reduce((total, item) => total + item.price * item.quantity, 0);
};

const MyOrders = () => {
  const { all_product, cartItems, clearCart } = useContext(ShopContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUrl = window.location.href;
  const url = new URL(currentUrl);
  const params = url.searchParams;
  const userId = getUserIdFromToken();
  const status = params.get("status");
  const message = params.get("message");
  
  // Define the `data` state to hold user details
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    barangay: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
  });

  const handleTransactionStatus = (status) => {
    switch (status) {
      case "failed":
        toast.warn("The transaction Failed.");
        break;
      case "success":
        toast.success("The transaction has been processed successfully.");
        break;
      case "cancelled":
        toast.info("The transaction has been cancelled.");
        break;
      default:
    }
  };
  
  useEffect(() => {
    // Fetch user data from localStorage
    const storedUserData = localStorage.getItem("userData");
    console.log("Fetched userData from localStorage:", storedUserData); // Debug log

    if (storedUserData) {
      const parsedUserData = JSON.parse(storedUserData);
      setData(parsedUserData); // Set the `data` state
    } else {
      console.error("userData not found in localStorage.");
      toast.error("User data not found. Please ensure you are logged in.");
    }
  }, []);

  useEffect(() => {
    handleTransactionStatus(status);
    if (message === "true") {
      handlePostPaymentActions();
    }
  }, [status, message]);

  const handlePostPaymentActions = async () => {
    const referenceNumber = localStorage.getItem("referenceNumber");
    const cartDetails = JSON.parse(localStorage.getItem("cartDetails"));
    const deliveryFee = parseFloat(localStorage.getItem("deliveryFee")) || 0;
    const storedUserData = localStorage.getItem("userData");
    const riderId = localStorage.getItem("riderId") || "unassigned";
  
    console.log("Reference Number:", referenceNumber);
    console.log("Cart Details:", cartDetails);
    console.log("Delivery Fee:", deliveryFee);
    console.log("User Data:", storedUserData);
    console.log("Rider ID:", riderId);
  
    if (!cartDetails || cartDetails.length === 0) {
      console.error("Cart details are missing or empty");
      toast.error("Cart details are missing. Cannot process order.");
      return;
    }
  
    if (!referenceNumber) {
      console.error("Reference number is missing");
      toast.error("Reference number is missing. Cannot process order.");
      return;
    }
  
    const userData = storedUserData ? JSON.parse(storedUserData) : null;
  
    if (!userData) {
      console.error("User data is missing");
      toast.error("User data is missing. Cannot process order.");
      return;
    }
  
    try {
      // Format phone number with country code if needed
      const formattedPhone = userData.phone.startsWith("+")
        ? userData.phone
        : `+63${userData.phone.startsWith("0") ? userData.phone.substring(1) : userData.phone}`;
  
      // Format complete address including barangay
      const formattedAddress = `${userData.street}, ${userData.barangay}, ${userData.city}, ${userData.state}, ${userData.zipcode}, ${userData.country}`;
  
      // Calculate total amount
      const totalAmount = getTotalCartAmount() + deliveryFee;
  
      // Calculate total markup value from cartDetails
      const totalMarkupValue = cartDetails.reduce(
        (sum, item) => sum + (item.markup_value || 0) * item.quantity,
        0
      );

      const deliveryComm = deliveryFee * 0.2;
  
      const transactionData = {
        transactionId: referenceNumber,
        date: new Date(),
        name: `${userData.firstName} ${userData.lastName}`,
        contact: formattedPhone,
        email: userData.email,
        item: cartDetails.map((item) => item.name).join(", "),
        quantity: cartDetails.reduce((sum, item) => sum + item.quantity, 0),
        amount: totalAmount,
        deliveryFee: deliveryFee,
        address: formattedAddress,
        status: "Pending",
        userId: userId,
        riderId: riderId,
        markupValue: totalMarkupValue, 
        deliveryComm: deliveryComm, 
        paymentMethod: "Online"
      };
  
      console.log("Sending transaction data:", transactionData);
  
      // Save transaction details to the backend
      const response = await axios.post(
        "http://localhost:4000/api/transactions",
        transactionData
      );
  
      console.log("Transaction saved successfully:", response.data);
  
      // Update stock information
      await axios.post("http://localhost:4000/api/updateStock", {
        updates: cartDetails.map((item) => ({
          id: item.id.toString(),
          size: item.size,
          quantity: item.quantity,
        })),
      });
  
      console.log("Clearing cart...");
      clearCart();
      console.log("Cart cleared");
  
      // Clear local storage and show success message
      localStorage.removeItem("cartDetails");
      localStorage.removeItem("referenceNumber");
      localStorage.removeItem("deliveryFee");
      localStorage.removeItem("riderId");
      toast.success("Order successfully placed!");
  
      // Refresh orders list
      fetchOrders();
    } catch (error) {
      console.error("Post-payment error:", error);
  
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
  
        if (error.response.data && error.response.data.errors) {
          const errorFields = Object.keys(error.response.data.errors).join(", ");
          toast.error(`Missing required fields: ${errorFields}. Please contact support.`);
        } else {
          toast.error(`Failed to process order: ${error.response.data.message || "Server error"}`);
        }
      } else if (error.request) {
        console.error("Error request:", error.request);
        toast.error("Failed to connect to server. Please check your connection.");
      } else {
        toast.error(`Error: ${error.message}`);
      }
    }
  };

  const fetchOrders = async () => {
    if (!userId) {
      console.error("User ID not available");
      setLoading(false);
      return;
    }
    
    try {
      const response = await axios.get(
        `http://localhost:4000/api/transactions/userTransactions/${userId}`
      );
      const fetchedOrders = Array.isArray(response.data) ? response.data : [];
  
      // Sort orders by date in descending order (latest first)
      const sortedOrders = fetchedOrders.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
  
      setOrders(sortedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to fetch orders. Please try again later.");
    } finally {
      setLoading(false);
    }
  };  

  // Initial fetch and real-time update listener setup
  useEffect(() => {
    // Initial fetch of orders
    fetchOrders();

    // Initialize Socket.IO
    const socket = io("http://localhost:3000/myorders");

    // Listen for real-time updates on order status
    socket.on("orderUpdated", (updatedOrder) => {
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.transactionId === updatedOrder.transactionId
            ? { ...order, status: updatedOrder.status }
            : order
        )
      );
      toast.info(`Order ${updatedOrder.transactionId} status updated to ${updatedOrder.status}`);
    });

    // Poll every 10 seconds to ensure real-time updates
    const intervalId = setInterval(fetchOrders, 10000);

    // Cleanup on component unmount
    return () => {
      clearInterval(intervalId);
      socket.disconnect();
    };
  }, [userId]);

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="my-order-container">
      <h1>My Orders</h1>
      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your orders...</p>
        </div>
      ) : (
        <div className="order-table-wrapper">
          <table className="order-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Item</th>
                <th>Quantity</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order._id}>
                    <td>{order.transactionId}</td>
                    <td>{formatDate(order.date)}</td>
                    <td>{order.item}</td>
                    <td>{order.quantity}</td>
                    <td>₱{order.amount.toFixed(2)}</td>
                    <td>
                      <span className={`status-badge status-${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-orders">
                    <p>No orders found. Start shopping now!</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyOrders;