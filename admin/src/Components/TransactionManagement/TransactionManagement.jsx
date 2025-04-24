import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./TransactionManagement.css";

const TransactionManagement = () => {
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDetails, setOpenDetails] = useState({});

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get("http://localhost:4000/api/transactions");
      const filteredTransactions = Array.isArray(response.data)
        ? response.data
            .filter((transaction) => transaction.status !== "pending")
            .sort((a, b) => new Date(b.date) - new Date(a.date))
        : [];
      setTransactions(filteredTransactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const handleDeleteTransaction = async (id, index) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        await axios.delete(`http://localhost:4000/api/transactions/${id}`);
        setTransactions(transactions.filter((_, idx) => idx !== index));
        toast.success("Transaction deleted successfully.");
      } catch (error) {
        toast.error("Transaction delete error.");
        console.error(error);
      }
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value.trim());
  };

  const handleClearSearch = () => {
    setSearchTerm(""); // Clear the search term to show all transactions
  };

  const toggleDetails = (id) => {
    setOpenDetails((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const search = searchTerm.toLowerCase();
    const name = transaction.name ? transaction.name.toLowerCase() : "";
    const refNumber = transaction.transactionId ? transaction.transactionId.toLowerCase() : "";
    return name.includes(search) || refNumber.includes(search);
  });

  return (
    <div className="transaction-management-container">
      <div className="header-section">
        <h1>Transaction History</h1>
        <div className="transaction-search">
          <input
            type="text"
            placeholder="Search transactions by reference number"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {searchTerm && (
            <button className="clear-search" onClick={handleClearSearch}>
              <span className="clear-icon">✕</span>
            </button>
          )}
        </div>
      </div>
      <div className="transaction-list">
        {filteredTransactions.length === 0 ? (
          <div className="empty-transactions">
            <p>No transactions found</p>
          </div>
        ) : (
          <>
            <div className="transaction-table-header">
              <span>Transaction Date</span>
              <span>Transfer ID</span>
              <span>Recipient</span>
              <span>Address</span>
              <span>Amount</span>
              <span>Payment Method</span>
              <span>Actions</span>
            </div>
            {filteredTransactions.map((transaction, index) => (
              <div key={transaction._id} className="transaction-item">
                <div className={`transaction-summary ${index % 2 === 0 ? "even" : "odd"}`}>
                  <span className="transaction-date">
                    {new Date(transaction.date).toLocaleDateString() || "N/A"}
                  </span>
                  <span className="transaction-id">{transaction.transactionId}</span>
                  <span className="transaction-name">{transaction.name || "N/A"}</span>
                  <span className="transaction-bank">{transaction.address || "N/A"}</span>
                  <span className="transaction-amount">
                    ₱{transaction.amount || "N/A"}
                  </span>
                  <span className="transaction-status">
                    <span className="status-badge completed">{transaction.paymentMethod || "N/A"}</span>
                  </span>
                  <div className="action-buttons">
                    <button
                      className="toggle-details"
                      onClick={() => toggleDetails(transaction._id)}
                    >
                      {openDetails[transaction._id] ? "Hide" : "View"}
                    </button>
                    <button
                      className="action-button delete"
                      onClick={() => handleDeleteTransaction(transaction._id, index)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div
                  className={`transaction-details ${
                    openDetails[transaction._id] ? "open" : ""
                  }`}
                >
                  <div class="details-section">
                    <h3>Transaction Details</h3>
                    <div className="transaction-detail-item">
                      <span className="detail-label">Transaction ID</span>
                      <span className="detail-value">{transaction.transactionId}</span>
                    </div>
                    <div className="transaction-detail-item">
                      <span className="detail-label">Item</span>
                      <span className="detail-value">{transaction.item || "N/A"}</span>
                    </div>
                    <div className="transaction-detail-item">
                      <span className="detail-label">Quantity</span>
                      <span className="detail-value">{transaction.quantity || "N/A"}</span>
                    </div>
                    <div className="transaction-detail-item">
                      <span className="detail-label">Amount</span>
                      <span className="detail-value price-value">
                        ₱{transaction.amount || "N/A"}
                      </span>
                    </div>
                  </div>
                  <div class="details-section">
                    <h3>Customer Details</h3>
                    <div className="transaction-detail-item">
                      <span className="detail-label">Full Name</span>
                      <span className="detail-value">{transaction.name || "N/A"}</span>
                    </div>
                    <div className="transaction-detail-item">
                      <span className="detail-label">Contact</span>
                      <span className="detail-value">{transaction.contact || "N/A"}</span>
                    </div>
                  </div>
                  <div class="details-section">
                    <h3>Address</h3>
                    <div className="transaction-detail-item">
                      <span className="detail-label">Address</span>
                      <span className="detail-value">{transaction.address || "N/A"}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default TransactionManagement;