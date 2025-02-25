import React, { useContext, useState } from "react";
import "./CSS/ShopCategory.css";
import { ShopContext } from "../Context/ShopContext";
import Item from "../Components/Item/Item";

const ShopCategory = (props) => {
  const { all_product } = useContext(ShopContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("relevance");
  const [quickFilters, setQuickFilters] = useState({
    rating: false,
    topRestaurants: false,
  });
  const [offers, setOffers] = useState({
    freeDelivery: false,
    acceptsVouchers: false,
    deals: false,
  });
  const [cuisine, setCuisine] = useState("");

  // Function to get unique products
  const getUniqueProducts = (products) => {
    const uniqueNames = new Set();
    return products.filter((product) => {
      if (!uniqueNames.has(product.name)) {
        uniqueNames.add(product.name);
        return true;
      }
      return false;
    });
  };

  // Filter products based on category and search term
  let filteredProducts = getUniqueProducts(all_product)
    .filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((item) => props.category === item.category);

  // Apply quick filters
  if (quickFilters.rating) {
    filteredProducts = filteredProducts.filter((item) => item.rating >= 4);
  }
  if (quickFilters.topRestaurants) {
    filteredProducts = filteredProducts.filter((item) => item.isTopRestaurant);
  }

  // Apply offers filters
  if (offers.freeDelivery) {
    filteredProducts = filteredProducts.filter((item) => item.freeDelivery);
  }
  if (offers.acceptsVouchers) {
    filteredProducts = filteredProducts.filter((item) => item.acceptsVouchers);
  }
  if (offers.deals) {
    filteredProducts = filteredProducts.filter((item) => item.hasDeals);
  }

  // Apply cuisine filter
  if (cuisine) {
    filteredProducts = filteredProducts.filter((item) => item.cuisine === cuisine);
  }

  // Sort products
  if (sortBy === "fastest") {
    filteredProducts.sort((a, b) => a.deliveryTime - b.deliveryTime);
  } else if (sortBy === "distance") {
    filteredProducts.sort((a, b) => a.distance - b.distance);
  }

  return (
    <div className="shopcategory-container">
      {/* Sidebar Filters */}
      <div className="shopcategory-filters-container">
        <h3>Filters</h3>

        {/* Search Bar */}
        <div className="shopcategory-searchbar">
          <input
            type="text"
            placeholder="Search for a product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button>🔍</button>
        </div>

        {/* Sort By */}
        <div className="filter-section">
          <h4>Sort By</h4>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="relevance">Relevance</option>
            <option value="fastest">Fastest Delivery</option>
            <option value="distance">Distance</option>
          </select>
        </div>

        {/* Quick Filters */}
        <div className="filter-section">
          <h4>Quick Filters</h4>
          <label>
            <input
              type="checkbox"
              checked={quickFilters.rating}
              onChange={() => setQuickFilters({ ...quickFilters, rating: !quickFilters.rating })}
            />
            Rating 4+
          </label>
          <label>
            <input
              type="checkbox"
              checked={quickFilters.topRestaurants}
              onChange={() =>
                setQuickFilters({ ...quickFilters, topRestaurants: !quickFilters.topRestaurants })
              }
            />
            Top Restaurants
          </label>
        </div>

        {/* Offers */}
        <div className="filter-section">
          <h4>Offers</h4>
          <label>
            <input
              type="checkbox"
              checked={offers.freeDelivery}
              onChange={() => setOffers({ ...offers, freeDelivery: !offers.freeDelivery })}
            />
            Free Delivery
          </label>
          <label>
            <input
              type="checkbox"
              checked={offers.acceptsVouchers}
              onChange={() => setOffers({ ...offers, acceptsVouchers: !offers.acceptsVouchers })}
            />
            Accepts Vouchers
          </label>
          <label>
            <input
              type="checkbox"
              checked={offers.deals}
              onChange={() => setOffers({ ...offers, deals: !offers.deals })}
            />
            Deals
          </label>
        </div>

        {/* Cuisines */}
        <div className="filter-section">
          <h4>Cuisines</h4>
          <select value={cuisine} onChange={(e) => setCuisine(e.target.value)}>
            <option value="">All Cuisines</option>
            <option value="italian">Italian</option>
            <option value="chinese">Chinese</option>
            <option value="japanese">Japanese</option>
            <option value="mexican">Mexican</option>
            <option value="indian">Indian</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="shopcategory-products">
        {filteredProducts.map((item, i) => (
          <Item key={i} id={item.id} name={item.name} image={item.image} new_price={item.new_price} />
        ))}
      </div>
    </div>
  );
};

export default ShopCategory;
