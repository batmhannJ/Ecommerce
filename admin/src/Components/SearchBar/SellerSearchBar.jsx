// src/Components/SearchBar/SellerSearchBar.jsx
import React, { useState } from "react";
import "./SearchBar.css"; // Optional CSS for styling

const SellerSearchBar = ({ sellers, onSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filteredSellers = sellers.filter((seller) =>
      seller.name.toLowerCase().includes(query) || 
      seller.email.toLowerCase().includes(query)
    );

    onSearch(filteredSellers); // Pass the filtered results to the parent component
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search seller by name or email"
        value={searchQuery}
        onChange={handleSearch}
      />
    </div>
  );
};

export default SellerSearchBar;
