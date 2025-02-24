import React from "react";
import { useLocation } from "react-router-dom";
import Item from "../Item/Item";

const SearchResults = () => {
  const location = useLocation();
  console.log("Location State:", location.state); // Add this to debug
  const { filteredProducts } = location.state || { filteredProducts: [] };

  return (
    <div className="search-results">
      {filteredProducts.length ? (
        filteredProducts.map((product, index) => (
          <Item
            key={index}
            id={product.id}
            name={product.name}
            image={product.image}
            new_price={product.new_price}
          />
        ))
      ) : (
        <p>No products found.</p>
      )}
    </div>
  );
};

export default SearchResults;
