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
    topBrands: false,
  });
  const [offers, setOffers] = useState({
    freeDelivery: false,
    acceptsVouchers: false,
    deals: false,
  });
  const [brand, setBrand] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [ram, setRam] = useState("");
  const [storage, setStorage] = useState("");

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
  if (quickFilters.topBrands) {
    filteredProducts = filteredProducts.filter((item) => item.isTopBrand);
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

  // Apply brand filter
  if (brand) {
    filteredProducts = filteredProducts.filter((item) => item.brand === brand);
  }

  // Apply price range filter
  if (priceRange) {
    const [minPrice, maxPrice] = priceRange.split("-");
    filteredProducts = filteredProducts.filter((item) => item.new_price >= minPrice && item.new_price <= maxPrice);
  }

  // Apply RAM filter
  if (ram) {
    filteredProducts = filteredProducts.filter((item) => item.ram === ram);
  }

  // Apply storage filter
  if (storage) {
    filteredProducts = filteredProducts.filter((item) => item.storage === storage);
  }

  // Sort products
  if (sortBy === "fastest") {
    filteredProducts.sort((a, b) => a.deliveryTime - b.deliveryTime);
  } else if (sortBy === "distance") {
    filteredProducts.sort((a, b) => a.distance - b.distance);
  }

  // Define filters for each category
  const categoryFilters = {
    clothes: (
      <>
        <div className="filter-section">
          <h4>Brands</h4>
          <select value={brand} onChange={(e) => setBrand(e.target.value)}>
            <option value="">All Brands</option>
            <option value="nike">Nike</option>
            <option value="adidas">Adidas</option>
            <option value="puma">Puma</option>
            <option value="zara">Zara</option>
          </select>
        </div>
        <div className="filter-section">
          <h4>Price Range</h4>
          <select value={priceRange} onChange={(e) => setPriceRange(e.target.value)}>
            <option value="">All Prices</option>
            <option value="0-100">0 - 100</option>
            <option value="100-500">100 - 500</option>
            <option value="500-1000">500 - 1000</option>
            <option value="1000-2000">1000 - 2000</option>
          </select>
        </div>
      </>
    ),
    gadgets: (
      <>
        <div className="filter-section">
          <h4>Brands</h4>
          <select value={brand} onChange={(e) => setBrand(e.target.value)}>
            <option value="">All Brands</option>
            <option value="apple">Apple</option>
            <option value="samsung">Samsung</option>
            <option value="sony">Sony</option>
            <option value="lg">LG</option>
            <option value="dell">Dell</option>
          </select>
        </div>
        <div className="filter-section">
          <h4>Price Range</h4>
          <select value={priceRange} onChange={(e) => setPriceRange(e.target.value)}>
            <option value="">All Prices</option>
            <option value="0-100">0 - 100</option>
            <option value="100-500">100 - 500</option>
            <option value="500-1000">500 - 1000</option>
            <option value="1000-2000">1000 - 2000</option>
            <option value="2000-5000">2000 - 5000</option>
          </select>
        </div>
        <div className="filter-section">
          <h4>RAM</h4>
          <select value={ram} onChange={(e) => setRam(e.target.value)}>
            <option value="">All RAM</option>
            <option value="4GB">4GB</option>
            <option value="8GB">8GB</option>
            <option value="16GB">16GB</option>
            <option value="32GB">32GB</option>
          </select>
        </div>
        <div className="filter-section">
          <h4>Storage</h4>
          <select value={storage} onChange={(e) => setStorage(e.target.value)}>
            <option value="">All Storage</option>
            <option value="128GB">128GB</option>
            <option value="256GB">256GB</option>
            <option value="512GB">512GB</option>
            <option value="1TB">1TB</option>
          </select>
        </div>
      </>
    ),
    foods: (
      <>
        <div className="filter-section">
          <h4>Price Range</h4>
          <select value={priceRange} onChange={(e) => setPriceRange(e.target.value)}>
            <option value="">All Prices</option>
            <option value="0-50">0 - 50</option>
            <option value="50-100">50 - 100</option>
            <option value="100-200">100 - 200</option>
            <option value="200-500">200 - 500</option>
          </select>
        </div>
      </>
    ),
  };

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

        {/* Dynamic Filters */}
        {categoryFilters[props.category]}

        {/* Quick Filters */}
        <div className="filter-section">
          <h4>Quick Filters</h4>
          <button
            className={`filter-button ${quickFilters.rating ? 'active' : ''}`}
            onClick={() => setQuickFilters({ ...quickFilters, rating: !quickFilters.rating })}
          >
            Rating 4+
          </button>
          <button
            className={`filter-button ${quickFilters.topBrands ? 'active' : ''}`}
            onClick={() => setQuickFilters({ ...quickFilters, topBrands: !quickFilters.topBrands })}
          >
            Top Brands
          </button>
        </div>

        {/* Offers */}
        <div className="filter-section">
          <h4>Offers</h4>
          <button
            className={`filter-button ${offers.freeDelivery ? 'active' : ''}`}
            onClick={() => setOffers({ ...offers, freeDelivery: !offers.freeDelivery })}
          >
            Free Delivery
          </button>
          <button
            className={`filter-button ${offers.acceptsVouchers ? 'active' : ''}`}
            onClick={() => setOffers({ ...offers, acceptsVouchers: !offers.acceptsVouchers })}
          >
            Accepts Vouchers
          </button>
          <button
            className={`filter-button ${offers.deals ? 'active' : ''}`}
            onClick={() => setOffers({ ...offers, deals: !offers.deals })}
          >
            Deals
          </button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="shopcategory-products">
        {filteredProducts.map((item, i) => (
          <div key={i} className="item">
            <div className="item-image-container" onClick={() => window.location.href = `/product/${item.id}`}>
              <img src={item.image} alt={item.name} className="item-image" />
            </div>
            <div className="item-info">
              <h4>{item.name}</h4>
              <p>₱{item.new_price}</p>
              {item.colors && (
                <div className="color-palette">
                  {item.colors.map((color, index) => (
                    <span key={index} className="color-swatch" style={{ backgroundColor: color }}></span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShopCategory;