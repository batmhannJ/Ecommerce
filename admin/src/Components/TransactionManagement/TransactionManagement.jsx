import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./TransactionManagement.css";

const TransactionManagement = () => {
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch transactions on mount
  useEffect(() => {
    fetchTransactions();
  }, []);

  // Fetch transactions from the API
  const fetchTransactions = async () => {
    try {
      const response = await axios.get(
        "http://localhost:4000/api/transactions"
      );
      console.log(response.data);
  
      const filteredTransactions = Array.isArray(response.data)
        ? response.data
            .filter((transaction) => transaction.status !== "pending")
            .sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort by date (latest to oldest)
        : [];
  
      setTransactions(filteredTransactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  // Handle delete transaction
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

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Filter transactions based on search term
  const filteredTransactions = transactions.filter((transaction) =>
    transaction.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.transactionId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="transaction-management-container">
      <h1>Manage Transactions</h1>
      <div className="transaction-search">
        <input
          type="text"
          placeholder="Search by transaction ID"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>
      <div className="transaction-list">
        {filteredTransactions.length === 0 ? (
          <div className="empty-transactions">
            <p>No transactions found</p>
          </div>
        ) : (
          filteredTransactions.map((transaction, index) => (
            <div key={transaction._id} className="transaction-item">
              <span className="transaction-id">{transaction.transactionId}</span>
              <div className="transaction-details">
                <div className="transaction-detail-item">
                  <span className="detail-label">Date</span>
                  <span className="detail-value">
                    {new Date(transaction.date).toLocaleDateString() || "N/A"}
                  </span>
                </div>
                <div className="transaction-detail-item">
                  <span className="detail-label">Name</span>
                  <span className="detail-value">{transaction.name || "N/A"}</span>
                </div>
                <div className="transaction-detail-item">
                  <span className="detail-label">Contact</span>
                  <span className="detail-value">{transaction.contact || "N/A"}</span>
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
                <div className="transaction-detail-item">
                  <span className="detail-label">Address</span>
                  <span className="detail-value">{transaction.address || "N/A"}</span>
                </div>
              </div>
              <div className="transaction-actions">
                <button
                  className="action-button delete"
                  onClick={() => handleDeleteTransaction(transaction._id, index)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TransactionManagement;