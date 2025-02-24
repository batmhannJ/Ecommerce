import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ShopContext } from "../../Context/ShopContext";
import "./SearchBar.css";

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { all_product } = useContext(ShopContext);

  const handleSearch = (e) => {
    e.preventDefault();
    const filtered = searchTerm.trim()
      ? all_product.filter((product) => {
          const inName = product.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
          const inTags = product.tags?.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          );
          return inName || inTags;
        })
      : all_product;

    navigate("/search-results", { state: { filteredProducts: filtered } });
  };

  return (
    <div className="search-bar">
      <form onSubmit={handleSearch} style={{ width: "100%", display: "flex" }}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for products..."
        />
        <button type="submit">Search</button>
      </form>
    </div>
  );
};

export default SearchBar;
