import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./TransactionManagement.css"; // Include your CSS here

const TransactionManagement = () => {
  const [transactions, setTransactions] = useState([]);

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
        ? response.data.filter(
            (transaction) => transaction.status !== "pending"
          )
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
        await axios.delete(`http://localhost:4000/api/transactions/${id}`); // Adjusted endpoint
        // Remove transaction from state after successful delete
        setTransactions(transactions.filter((_, idx) => idx !== index));
        toast.success("Transaction deleted successfully.");
      } catch (error) {
        toast.error("Transaction delete error.");
        console.error(error);
      }
    }
  };

  return (
    <div className="transaction-management-container">
      <h1>Manage Transactions</h1>
      <table className="transaction-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Name</th>
            <th>Contact</th>
            <th>Item</th>
            <th>Quantity</th>
            <th>Amount</th>
            <th>Address</th>
            <th>Transaction ID</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions
            .filter((transaction) => transaction.status !== "pending")
            .map((transaction, index) => (
              <tr key={transaction._id}>
                <td>{transaction.date}</td>
                <td>{transaction.name}</td>
                <td>{transaction.contact}</td>
                <td>{transaction.item}</td>
                <td>{transaction.quantity}</td>
                <td>{transaction.amount}</td>
                <td>{transaction.address}</td>
                <td>{transaction.transactionId}</td>
                <td>
                  <button
                    className="action-button delete"
                    onClick={() =>
                      handleDeleteTransaction(transaction._id, index)
                    }
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionManagement;
