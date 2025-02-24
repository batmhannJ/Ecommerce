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
    const deliveryFee = parseFloat(localStorage.getItem("deliveryFee"));
    const storedUserData = localStorage.getItem("userData");

    console.log("Reference Number:", referenceNumber);
    console.log("Cart Details:", cartDetails);
    console.log("Delivery Fee:", deliveryFee);
    console.log("User Data:", storedUserData);
    const userData = storedUserData ? JSON.parse(storedUserData) : null;

    try {
      // Save transaction details to the backend
      await axios.post("https://ip-tienda-han-backend.onrender.com/api/transactions", {
        transactionId: referenceNumber,
        date: new Date(),
        name: `${userData.firstName} ${userData.lastName}`,
        contact: userData.phone,
        item: cartDetails.map((item) => item.name).join(", "),
        quantity: cartDetails.reduce((sum, item) => sum + item.quantity, 0),
        amount: getTotalCartAmount() + deliveryFee,
        deliveryFee: deliveryFee,
        address: `${userData.street} ${userData.city} ${userData.state} ${userData.zipcode} ${userData.country}`,
        status: "Cart Processing",
        userId: userId,
      });

      // Update stock information
      await axios.post("https://ip-tienda-han-backend.onrender.com/api/updateStock", {
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
      toast.success("Order successfully placed!");
    } catch (error) {
      console.error("Post-payment error:", error);
      toast.error("Failed to process order. Please contact support.");
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get(
        `https://ip-tienda-han-backend.onrender.com/api/transactions/userTransactions/${userId}`
      );
      const fetchedOrders = Array.isArray(response.data) ? response.data : [];
  
      // Sort orders by date in descending order (latest first)
      const sortedOrders = fetchedOrders.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
  
      setOrders(sortedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("No orders found.");
    } finally {
      setLoading(false);
    }
  };  

  // Initial fetch and real-time update listener setup
  useEffect(() => {
    // Initial fetch of orders
    fetchOrders();

    // Initialize Socket.IO
    const socket = io("https://ip-tienda-han-backend.onrender.com/myorders");

    // Listen for real-time updates on order status
    socket.on("orderUpdated", (updatedOrder) => {
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.transactionId === updatedOrder.transactionId
            ? { ...order, status: updatedOrder.status }
            : order
        )
      );
    });

    // Poll every 10 seconds to ensure real-time updates
    const intervalId = setInterval(fetchOrders, 10000);

    // Cleanup on component unmount
    return () => {
      clearInterval(intervalId);
      socket.disconnect();
    };
  }, [userId]);

  return (
    <div className="my-order-container">
      <h1>My Orders</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
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
                  <td>{order.date}</td>
                  <td>{order.item}</td>
                  <td>{order.quantity}</td>
                  <td>{order.amount}</td>
                  <td>{order.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">No orders found</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MyOrders;
