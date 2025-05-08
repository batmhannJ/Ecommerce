import React, { useState, useEffect } from "react";
import "./Orders.css";
import { toast } from "react-toastify";
import parcel_icon from "../../assets/parcel_icon.png";
import { io } from "socket.io-client";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [sortOption, setSortOption] = useState("newest");
  const socket = io("http://localhost:4000");

  const fetchAllOrders = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/transactions");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      const filteredOrders = data
        .filter((order) => order.status !== "pending")
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      setOrders(filteredOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Error fetching orders");
    }
  };

  const statusHandler = async (event, transactionId) => {
    const newStatus = event.target.value;
    if (window.confirm(`Are you sure you want to change the status to "${newStatus}"?`)) {
      try {
        const response = await fetch(
          `http://localhost:4000/api/transactions/${transactionId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: newStatus }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update status");
        }

        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.transactionId === transactionId
              ? { ...order, status: newStatus }
              : order
          )
        );

        toast.success("Order status updated successfully!");
      } catch (error) {
        console.error("Error updating order status:", error);
        toast.error("Error updating order status");
      }
    }
  };

  const handleSortChange = (event) => {
    const option = event.target.value;
    setSortOption(option);

    let sortedOrders = [...orders];

    switch (option) {
      case "newest":
        sortedOrders = sortedOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case "oldest":
        sortedOrders = sortedOrders.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case "highest":
        sortedOrders = sortedOrders.sort((a, b) => b.amount - a.amount);
        break;
      case "lowest":
        sortedOrders = sortedOrders.sort((a, b) => a.amount - b.amount);
        break;
      case "processing":
        sortedOrders = sortedOrders.sort((a, b) => {
          if (a.status === "Cart Processing" && b.status !== "Cart Processing") return -1;
          if (a.status !== "Cart Processing" && b.status === "Cart Processing") return 1;
          return 0;
        });
        break;
      case "delivery":
        sortedOrders = sortedOrders.sort((a, b) => {
          if (a.status === "Out for Delivery" && b.status !== "Out for Delivery") return -1;
          if (a.status !== "Out for Delivery" && b.status === "Out for Delivery") return 1;
          return 0;
        });
        break;
      case "delivered":
        sortedOrders = sortedOrders.sort((a, b) => {
          if (a.status === "Delivered" && b.status !== "Delivered") return -1;
          if (a.status !== "Delivered" && b.status === "Delivered") return 1;
          return 0;
        });
        break;
      default:
        break;
    }

    setOrders(sortedOrders);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Cart Processing":
        return "status-processing";
      case "Out for Delivery":
        return "status-delivering";
      case "Delivered":
        return "status-delivered";
      default:
        return "";
    }
  };

  useEffect(() => {
    fetchAllOrders();

    socket.on("orderUpdated", (updatedOrder) => {
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.transactionId === updatedOrder.transactionId
            ? { ...order, status: updatedOrder.status }
            : order
        )
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="container">
      <div className="order add">
        <h3>iSynergies Inc. - Orders</h3>

        <div className="sort-controls">
          <span className="sort-label">Sort by:</span>
          <select
            className="sort-select"
            value={sortOption}
            onChange={handleSortChange}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Amount</option>
            <option value="lowest">Lowest Amount</option>
            <option value="processing">Processing First</option>
            <option value="delivery">Out for Delivery First</option>
            <option value="delivered">Delivered First</option>
          </select>
        </div>

        <div className="order-list">
          {orders.length === 0 ? (
            <div className="empty-orders">
              <p>No orders available</p>
            </div>
          ) : (
            orders.map((order, index) => (
              <div key={index} className="order-item">
                <div className="order-item-header">
                  <img src={parcel_icon} alt="parcel icon" />
                  <div>
                    <p>REF-{order.transactionId}</p>
                  </div>
                </div>

                <div>
                  <p className="order-item-food">{order.item || "Unknown Item"}</p>
                  <p className="order-item-name">{order.name || "Unknown User"}</p>
                </div>

                <div className="order-item-address">
                  <p>{order.address || "Address Not Available"}</p>
                  <p>{order.contact || "No Phone Number"}</p>
                </div>

                <div className="order-details">
                  <div className="order-detail-item">
                    <span className="detail-label">Quantity</span>
                    <span className="detail-value">{order.quantity || "N/A"}</span>
                  </div>
                  <div className="order-detail-item">
                    <span className="detail-label">Amount</span>
                    <span className="detail-value price-value">₱{order.amount || "N/A"}</span>
                  </div>
                  <div className="order-detail-item">
                    <span className="detail-label">Date</span>
                    <span className="detail-value">
                      {new Date(order.date).toLocaleDateString() || "N/A"}
                    </span>
                  </div>
                  <div className="order-detail-item">
                    <span className="detail-label">Status</span>
                    <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                      {order.status || "Unknown"}
                    </span>
                  </div>
                </div>

                <div className="order-status">
                  <select
                    onChange={(event) => statusHandler(event, order.transactionId)}
                    value={order.status}
                  >
                    <option value="Cart Processing">Cart Processing</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;