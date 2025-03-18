import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Item from "../Item/Item";
import "./Sidebar.css";

const Shop = ({ products }) => {
  const { category } = useParams();
  
  // States for filters and UI
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [sortBy, setSortBy] = useState("popular");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [activeSubcategory, setActiveSubcategory] = useState(null);
  
  // Extract all available brands and subcategories
  const allBrands = [...new Set(products.map(item => item.brand))].sort();
  
  // Filter products by category and subcategory
  let filteredProducts = products;
  if (category) {
    filteredProducts = products.filter((item) => item.category === category);
  }
  
  if (activeSubcategory) {
    filteredProducts = filteredProducts.filter(
      (item) => item.subcategory === activeSubcategory
    );
  }
  
  // Apply price filter
  filteredProducts = filteredProducts.filter(
    item => item.new_price >= priceRange[0] && item.new_price <= priceRange[1]
  );
  
  // Apply brand filter
  if (selectedBrands.length > 0) {
    filteredProducts = filteredProducts.filter(
      item => selectedBrands.includes(item.brand)
    );
  }
  
  // Apply ratings filter (assuming products have a rating property)
  if (selectedRatings.length > 0) {
    filteredProducts = filteredProducts.filter(item => {
      const rating = Math.floor(item.rating || 0);
      return selectedRatings.includes(rating);
    });
  }
  
  // Apply sorting
  if (sortBy === "price-low-high") {
    filteredProducts.sort((a, b) => a.new_price - b.new_price);
  } else if (sortBy === "price-high-low") {
    filteredProducts.sort((a, b) => b.new_price - a.new_price);
  } else if (sortBy === "newest") {
    filteredProducts.sort((a, b) => new Date(b.date) - new Date(a.date));
  } else if (sortBy === "rating") {
    filteredProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }
  
  // Group products by subcategory
  const subcategories = {};
  filteredProducts.forEach(item => {
    if (!subcategories[item.subcategory]) {
      subcategories[item.subcategory] = [];
    }
    subcategories[item.subcategory].push(item);
  });

  // Handle price range changes
  const handlePriceChange = (index, value) => {
    const newPriceRange = [...priceRange];
    newPriceRange[index] = Number(value);
    setPriceRange(newPriceRange);
  };

  // Handle brand selection
  const handleBrandChange = (brand) => {
    if (selectedBrands.includes(brand)) {
      setSelectedBrands(selectedBrands.filter(b => b !== brand));
    } else {
      setSelectedBrands([...selectedBrands, brand]);
    }
  };

  // Handle rating selection
  const handleRatingChange = (rating) => {
    if (selectedRatings.includes(rating)) {
      setSelectedRatings(selectedRatings.filter(r => r !== rating));
    } else {
      setSelectedRatings([...selectedRatings, rating]);
    }
  };

  // Toggle mobile filter visibility
  const toggleMobileFilter = () => {
    setIsMobileFilterOpen(!isMobileFilterOpen);
  };

  // Reset all filters
  const resetFilters = () => {
    setPriceRange([0, 100000]);
    setSelectedBrands([]);
    setSelectedRatings([]);
    setActiveSubcategory(null);
  };

  return (
    <div className="shop-container">
      {/* Mobile Filter Toggle Button */}
      <button 
        className="mobile-filter-toggle" 
        onClick={toggleMobileFilter}
      >
        {isMobileFilterOpen ? "Hide Filters" : "Show Filters"}
      </button>
      
      {/* Sidebar with filters */}
      <aside className={`shop-sidebar ${isMobileFilterOpen ? 'open' : ''}`}>
        <div className="sidebar">
          <div className="sidebar-header">
            <h2>Filters</h2>
            <button onClick={resetFilters} className="reset-filters">Reset All</button>
          </div>
          
          {/* Price Range Filter */}
          <div className="sidebar-section">
            <h3>Price Range</h3>
            <div className="price-inputs">
              <div className="price-input">
                <span>$</span>
                <input 
                  type="number" 
                  value={priceRange[0]} 
                  onChange={(e) => handlePriceChange(0, e.target.value)}
                  min="0"
                />
              </div>
              <span>to</span>
              <div className="price-input">
                <span>$</span>
                <input 
                  type="number" 
                  value={priceRange[1]} 
                  onChange={(e) => handlePriceChange(1, e.target.value)}
                  min="0"
                />
              </div>
            </div>
          </div>
          
          {/* Brand Filter */}
          <div className="sidebar-section">
            <h3>Brands</h3>
            <div className="brand-filters">
              {allBrands.map(brand => (
                <div key={brand} className="brand-checkbox">
                  <input 
                    type="checkbox" 
                    id={`brand-${brand}`}
                    checked={selectedBrands.includes(brand)}
                    onChange={() => handleBrandChange(brand)}
                  />
                  <label htmlFor={`brand-${brand}`}>{brand}</label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Rating Filter */}
          <div className="sidebar-section">
            <h3>Customer Reviews</h3>
            <div className="rating-filters">
              {[4, 3, 2, 1].map(rating => (
                <div key={rating} className="rating-option">
                  <input 
                    type="checkbox" 
                    id={`rating-${rating}`}
                    checked={selectedRatings.includes(rating)}
                    onChange={() => handleRatingChange(rating)}
                  />
                  <label htmlFor={`rating-${rating}`}>
                    {Array(rating).fill("★").join("")}
                    {Array(5-rating).fill("☆").join("")} & Up
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Shipping Options */}
          <div className="sidebar-section">
            <h3>Shipping & Delivery</h3>
            <div className="service-options">
              <div className="service-option">
                <input type="checkbox" id="free-shipping" />
                <label htmlFor="free-shipping">Free Shipping</label>
              </div>
              <div className="service-option">
                <input type="checkbox" id="same-day" />
                <label htmlFor="same-day">Same-day Delivery</label>
              </div>
            </div>
          </div>
        </div>
      </aside>
      
      {/* Main content area */}
      <main className="shop-main">
        {/* Page header with title and sorting */}
        <header className="shop-header">
          <div className="shop-title">
            <h1>{category || "All Products"}</h1>
            <p>{filteredProducts.length} results</p>
          </div>
          
          <div className="shop-controls">
            <div className="shop-sort">
              <label htmlFor="sort-select">Sort by:</label>
              <select 
                id="sort-select"
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="popular">Featured</option>
                <option value="rating">Top Rated</option>
                <option value="newest">Newest Arrivals</option>
                <option value="price-low-high">Price: Low to High</option>
                <option value="price-high-low">Price: High to Low</option>
              </select>
            </div>
          </div>
        </header>
        
        {/* Subcategory slider */}
        <section className="shop-categories">
          <div className="subcategory-cards">
            <div 
              className={`subcategory-card ${activeSubcategory === null ? 'active' : ''}`}
              onClick={() => setActiveSubcategory(null)}
            >
              <div className="subcategory-icon all">
                <span>All</span>
              </div>
              <p>All Items</p>
            </div>
            
            {Object.keys(subcategories).map(subcategory => (
              <div 
                className={`subcategory-card ${activeSubcategory === subcategory ? 'active' : ''}`} 
                key={subcategory}
                onClick={() => setActiveSubcategory(subcategory === activeSubcategory ? null : subcategory)}
              >
                <div className="subcategory-icon">
                  {subcategories[subcategory][0] && (
                    <img src={subcategories[subcategory][0].image} alt={subcategory} />
                  )}
                </div>
                <p>{subcategory}</p>
              </div>
            ))}
          </div>
        </section>
        
        {/* Products grid */}
        <section className="shop-products">
          {filteredProducts.length > 0 ? (
            <div className="shop-products-grid">
              {filteredProducts.map((item) => (
                <Item
                  key={item.id}
                  id={item.id}
                  name={item.name}
                  image={item.image}
                  new_price={item.new_price}
                  old_price={item.old_price}
                  brand={item.brand}
                  rating={item.rating}
                  reviews={item.reviews}
                />
              ))}
            </div>
          ) : (
            <div className="no-products">
              <h3>No products found</h3>
              <p>Please try adjusting your filters or search terms.</p>
              <button onClick={resetFilters} className="reset-button">Reset All Filters</button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Shop;