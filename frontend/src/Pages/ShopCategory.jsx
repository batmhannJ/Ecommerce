import React, { useContext, useState, useEffect } from "react";
import { ShopContext } from "../Context/ShopContext";
import { motion } from "framer-motion";
import "./CSS/ShopCategory.css";

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
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [selectedColorFilter, setSelectedColorFilter] = useState(null);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [viewMode, setViewMode] = useState("grid");

  // Calculate active filters count
  useEffect(() => {
    let count = 0;
    if (searchTerm) count++;
    if (sortBy !== "relevance") count++;
    if (brand) count++;
    if (priceRange) count++;
    if (ram) count++;
    if (storage) count++;
    if (quickFilters.rating) count++;
    if (quickFilters.topBrands) count++;
    if (offers.freeDelivery) count++;
    if (offers.acceptsVouchers) count++;
    if (offers.deals) count++;
    setActiveFiltersCount(count);
  }, [searchTerm, sortBy, brand, priceRange, ram, storage, quickFilters, offers]);

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

  // Reset all filters
  const resetAllFilters = () => {
    setSearchTerm("");
    setSortBy("relevance");
    setQuickFilters({ rating: false, topBrands: false });
    setOffers({ freeDelivery: false, acceptsVouchers: false, deals: false });
    setBrand("");
    setPriceRange("");
    setRam("");
    setStorage("");
    setSelectedColorFilter(null);
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
    filteredProducts = filteredProducts.filter((item) => item.markup_price >= minPrice && item.markup_price <= maxPrice);
  }

  // Apply RAM filter
  if (ram) {
    filteredProducts = filteredProducts.filter((item) => item.ram === ram);
  }

  // Apply storage filter
  if (storage) {
    filteredProducts = filteredProducts.filter((item) => item.storage === storage);
  }

  // Apply color filter if selected
  if (selectedColorFilter) {
    filteredProducts = filteredProducts.filter((item) => 
      item.colors && item.colors.some(color => color === selectedColorFilter)
    );
  }

  // Sort products
  if (sortBy === "fastest") {
    filteredProducts.sort((a, b) => a.deliveryTime - b.deliveryTime);
  } else if (sortBy === "distance") {
    filteredProducts.sort((a, b) => a.distance - b.distance);
  } else if (sortBy === "priceHigh") {
    filteredProducts.sort((a, b) => b.markup_price - a.markup_price);
  } else if (sortBy === "priceLow") {
    filteredProducts.sort((a, b) => a.markup_price - b.markup_price);
  }

  // Define filters for each category
  const categoryFilters = {
    clothes: (
      <>
        <div className="filter-accordion">
          <div className="filter-header" onClick={() => document.getElementById('brands-panel').classList.toggle('active')}>
            <h4>Brands</h4>
            <span className="toggle-icon">+</span>
          </div>
          <div className="filter-panel" id="brands-panel">
            <div className="custom-select">
              <select value={brand} onChange={(e) => setBrand(e.target.value)}>
                <option value="">All Brands</option>
                <option value="nike">Nike</option>
                <option value="adidas">Adidas</option>
                <option value="puma">Puma</option>
                <option value="zara">Zara</option>
              </select>
            </div>
          </div>
        </div>
        <div className="filter-accordion">
          <div className="filter-header" onClick={() => document.getElementById('price-panel').classList.toggle('active')}>
            <h4>Price Range</h4>
            <span className="toggle-icon">+</span>
          </div>
          <div className="filter-panel" id="price-panel">
            <div className="custom-select">
              <select value={priceRange} onChange={(e) => setPriceRange(e.target.value)}>
                <option value="">All Prices</option>
                <option value="0-100">₱0 - ₱100</option>
                <option value="100-500">₱100 - ₱500</option>
                <option value="500-1000">₱500 - ₱1000</option>
                <option value="1000-2000">₱1000 - ₱2000</option>
              </select>
            </div>
          </div>
        </div>
        <div className="filter-accordion">
          <div className="filter-header" onClick={() => document.getElementById('color-panel').classList.toggle('active')}>
            <h4>Colors</h4>
            <span className="toggle-icon">+</span>
          </div>
          <div className="filter-panel" id="color-panel">
            <div className="color-filters">
              {["#000000", "#FFFFFF", "#FF0000", "#0000FF", "#FFFF00", "#00FF00"].map((color) => (
                <div 
                  key={color} 
                  className={`color-filter ${selectedColorFilter === color ? 'selected' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColorFilter(selectedColorFilter === color ? null : color)}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </>
    ),
    gadgets: (
      <>
        <div className="filter-accordion">
          <div className="filter-header" onClick={() => document.getElementById('gadget-brands-panel').classList.toggle('active')}>
            <h4>Brands</h4>
            <span className="toggle-icon">+</span>
          </div>
          <div className="filter-panel" id="gadget-brands-panel">
            <div className="custom-select">
              <select value={brand} onChange={(e) => setBrand(e.target.value)}>
                <option value="">All Brands</option>
                <option value="apple">Apple</option>
                <option value="samsung">Samsung</option>
                <option value="sony">Sony</option>
                <option value="lg">LG</option>
                <option value="dell">Dell</option>
              </select>
            </div>
          </div>
        </div>
        <div className="filter-accordion">
          <div className="filter-header" onClick={() => document.getElementById('gadget-price-panel').classList.toggle('active')}>
            <h4>Price Range</h4>
            <span className="toggle-icon">+</span>
          </div>
          <div className="filter-panel" id="gadget-price-panel">
            <div className="custom-select">
              <select value={priceRange} onChange={(e) => setPriceRange(e.target.value)}>
                <option value="">All Prices</option>
                <option value="0-100">₱0 - ₱100</option>
                <option value="100-500">₱100 - ₱500</option>
                <option value="500-1000">₱500 - ₱1000</option>
                <option value="1000-2000">₱1000 - ₱2000</option>
                <option value="2000-5000">₱2000 - ₱5000</option>
              </select>
            </div>
          </div>
        </div>
        <div className="filter-accordion">
          <div className="filter-header" onClick={() => document.getElementById('ram-panel').classList.toggle('active')}>
            <h4>RAM</h4>
            <span className="toggle-icon">+</span>
          </div>
          <div className="filter-panel" id="ram-panel">
            <div className="custom-select">
              <select value={ram} onChange={(e) => setRam(e.target.value)}>
                <option value="">All RAM</option>
                <option value="4GB">4GB</option>
                <option value="8GB">8GB</option>
                <option value="16GB">16GB</option>
                <option value="32GB">32GB</option>
              </select>
            </div>
          </div>
        </div>
        <div className="filter-accordion">
          <div className="filter-header" onClick={() => document.getElementById('storage-panel').classList.toggle('active')}>
            <h4>Storage</h4>
            <span className="toggle-icon">+</span>
          </div>
          <div className="filter-panel" id="storage-panel">
            <div className="custom-select">
              <select value={storage} onChange={(e) => setStorage(e.target.value)}>
                <option value="">All Storage</option>
                <option value="128GB">128GB</option>
                <option value="256GB">256GB</option>
                <option value="512GB">512GB</option>
                <option value="1TB">1TB</option>
              </select>
            </div>
          </div>
        </div>
      </>
    ),
    foods: (
      <>
        <div className="filter-accordion">
          <div className="filter-header" onClick={() => document.getElementById('food-price-panel').classList.toggle('active')}>
            <h4>Price Range</h4>
            <span className="toggle-icon">+</span>
          </div>
          <div className="filter-panel" id="food-price-panel">
            <div className="custom-select">
              <select value={priceRange} onChange={(e) => setPriceRange(e.target.value)}>
                <option value="">All Prices</option>
                <option value="0-50">₱0 - ₱50</option>
                <option value="50-100">₱50 - ₱100</option>
                <option value="100-200">₱100 - ₱200</option>
                <option value="200-500">₱200 - ₱500</option>
              </select>
            </div>
          </div>
        </div>
        <div className="filter-accordion">
          <div className="filter-header" onClick={() => document.getElementById('dietary-panel').classList.toggle('active')}>
            <h4>Dietary Options</h4>
            <span className="toggle-icon">+</span>
          </div>
          <div className="filter-panel" id="dietary-panel">
            <div className="tag-filters">
              <span className="tag-filter">Vegetarian</span>
              <span className="tag-filter">Gluten-Free</span>
              <span className="tag-filter">Organic</span>
              <span className="tag-filter">Sugar-Free</span>
            </div>
          </div>
        </div>
      </>
    ),
  };

  return (
    <div className="shopcategory-container">
      {/* Mobile Filter Toggle */}
      <div className={`mobile-filter-toggle ${isFiltersOpen ? 'active' : ''}`} onClick={() => setIsFiltersOpen(!isFiltersOpen)}>
        <span className="filter-icon"></span>
        <span>Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
      </div>

      {/* Sidebar Filters */}
      <div className={`shopcategory-filters-container ${isFiltersOpen ? 'open' : ''}`}>
        <div className="filters-header">
          <h3>Filters</h3>
          {activeFiltersCount > 0 && (
            <button className="clear-filters" onClick={resetAllFilters}>
              Clear All
            </button>
          )}
          <button className="close-filters-mobile" onClick={() => setIsFiltersOpen(false)}>×</button>
        </div>

        {/* Search Bar */}
        <div className="shopcategory-searchbar">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm("")}>×</button>
          )}
        </div>

        {/* Sort By */}
        <div className="filter-accordion">
          <div className="filter-header" onClick={() => document.getElementById('sort-panel').classList.toggle('active')}>
            <h4>Sort By</h4>
            <span className="toggle-icon">+</span>
          </div>
          <div className="filter-panel" id="sort-panel">
            <div className="custom-select">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="relevance">Relevance</option>
                <option value="priceLow">Price: Low to High</option>
                <option value="priceHigh">Price: High to Low</option>
                <option value="fastest">Fastest Delivery</option>
                <option value="distance">Distance</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dynamic Filters */}
        {categoryFilters[props.category]}

        {/* Quick Filters */}
        <div className="filter-accordion">
          <div className="filter-header" onClick={() => document.getElementById('quick-filters-panel').classList.toggle('active')}>
            <h4>Quick Filters</h4>
            <span className="toggle-icon">+</span>
          </div>
          <div className="filter-panel" id="quick-filters-panel">
            <button
              className={`filter-chip ${quickFilters.rating ? 'active' : ''}`}
              onClick={() => setQuickFilters({ ...quickFilters, rating: !quickFilters.rating })}
            >
              Rating 4+
              {quickFilters.rating && <span className="remove-filter">×</span>}
            </button>
            <button
              className={`filter-chip ${quickFilters.topBrands ? 'active' : ''}`}
              onClick={() => setQuickFilters({ ...quickFilters, topBrands: !quickFilters.topBrands })}
            >
              Top Brands
              {quickFilters.topBrands && <span className="remove-filter">×</span>}
            </button>
          </div>
        </div>

        {/* Offers */}
        <div className="filter-accordion">
          <div className="filter-header" onClick={() => document.getElementById('offers-panel').classList.toggle('active')}>
            <h4>Offers</h4>
            <span className="toggle-icon">+</span>
          </div>
          <div className="filter-panel" id="offers-panel">
            <button
              className={`filter-chip ${offers.freeDelivery ? 'active' : ''}`}
              onClick={() => setOffers({ ...offers, freeDelivery: !offers.freeDelivery })}
            >
              Free Delivery
              {offers.freeDelivery && <span className="remove-filter">×</span>}
            </button>
            <button
              className={`filter-chip ${offers.acceptsVouchers ? 'active' : ''}`}
              onClick={() => setOffers({ ...offers, acceptsVouchers: !offers.acceptsVouchers })}
            >
              Accepts Vouchers
              {offers.acceptsVouchers && <span className="remove-filter">×</span>}
            </button>
            <button
              className={`filter-chip ${offers.deals ? 'active' : ''}`}
              onClick={() => setOffers({ ...offers, deals: !offers.deals })}
            >
              Deals
              {offers.deals && <span className="remove-filter">×</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Products Display */}
      <div className="shopcategory-content">
        {/* Results Header */}
        <div className="results-header">
          <div className="results-count">
            <span>{filteredProducts.length} products</span>
          </div>
          <div className="view-options">
            <button 
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`} 
              onClick={() => setViewMode('grid')}
              aria-label="Grid View"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
              </svg>
            </button>
            <button 
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`} 
              onClick={() => setViewMode('list')}
              aria-label="List View"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="active-filters">
            <span className="active-filters-label">Active Filters:</span>
            <div className="active-filters-list">
              {searchTerm && (
                <span className="active-filter-tag">
                  Search: {searchTerm}
                  <button onClick={() => setSearchTerm("")}>×</button>
                </span>
              )}
              {sortBy !== "relevance" && (
                <span className="active-filter-tag">
                  Sort: {sortBy.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  <button onClick={() => setSortBy("relevance")}>×</button>
                </span>
              )}
              {brand && (
                <span className="active-filter-tag">
                  Brand: {brand}
                  <button onClick={() => setBrand("")}>×</button>
                </span>
              )}
              {priceRange && (
                <span className="active-filter-tag">
                  Price: ₱{priceRange.replace('-', ' - ₱')}
                  <button onClick={() => setPriceRange("")}>×</button>
                </span>
              )}
              {ram && (
                <span className="active-filter-tag">
                  RAM: {ram}
                  <button onClick={() => setRam("")}>×</button>
                </span>
              )}
              {storage && (
                <span className="active-filter-tag">
                  Storage: {storage}
                  <button onClick={() => setStorage("")}>×</button>
                </span>
              )}
              {quickFilters.rating && (
                <span className="active-filter-tag">
                  Rating 4+
                  <button onClick={() => setQuickFilters({...quickFilters, rating: false})}>×</button>
                </span>
              )}
              {quickFilters.topBrands && (
                <span className="active-filter-tag">
                  Top Brands
                  <button onClick={() => setQuickFilters({...quickFilters, topBrands: false})}>×</button>
                </span>
              )}
              {offers.freeDelivery && (
                <span className="active-filter-tag">
                  Free Delivery
                  <button onClick={() => setOffers({...offers, freeDelivery: false})}>×</button>
                </span>
              )}
              {offers.acceptsVouchers && (
                <span className="active-filter-tag">
                  Accepts Vouchers
                  <button onClick={() => setOffers({...offers, acceptsVouchers: false})}>×</button>
                </span>
              )}
              {offers.deals && (
                <span className="active-filter-tag">
                  Deals
                  <button onClick={() => setOffers({...offers, deals: false})}>×</button>
                </span>
              )}
              {selectedColorFilter && (
                <span className="active-filter-tag color-filter-tag">
                  Color: <span className="color-preview" style={{backgroundColor: selectedColorFilter}}></span>
                  <button onClick={() => setSelectedColorFilter(null)}>×</button>
                </span>
              )}
            </div>
          </div>
        )}

        {/* Products Grid/List */}
        <div className={`shopcategory-products ${viewMode === 'list' ? 'list-view' : 'grid-view'}`}>
          {filteredProducts.length === 0 ? (
            <div className="no-results">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                <line x1="11" y1="8" x2="11" y2="14"></line>
                <line x1="8" y1="11" x2="14" y2="11"></line>
              </svg>
              <h3>No products found</h3>
              <p>Try adjusting your filters or search term</p>
              <button className="reset-search-btn" onClick={resetAllFilters}>Reset All Filters</button>
            </div>
          ) : (
            filteredProducts.map((item, i) => (
              <motion.div 
                key={i} 
                className="product-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                data-category={props.category}
                whileHover={{ y: -5 }}
              >
                {/* Product Badge */}
                {(item.isNew || item.discount > 0 || item.freeDelivery) && (
                  <div className="product-badges">
                    {item.isNew && <span className="badge new-badge">NEW</span>}
                    {item.discount > 0 && <span className="badge discount-badge">-{item.discount}%</span>}
                    {item.freeDelivery && <span className="badge delivery-badge">FREE DELIVERY</span>}
                  </div>
                )}
                
                {/* Product Image Container */}
                <div className="product-image-container" onClick={() => window.location.href = `/product/${item.id}`}>
                  <img src={item.image} alt={item.name} className="product-image" />
                  
                  {/* Quick View Button */}
                  <div className="quick-view-overlay">
                    <button className="quick-view-btn">Quick View</button>
                  </div>

                  {/* Color Options Preview (for clothes and gadgets) */}
                  {item.colors && item.colors.length > 0 && (
                    <div className="color-options-preview">
                      {item.colors.map((color, index) => (
                        <span 
                          key={index} 
                          className="color-option" 
                          style={{ backgroundColor: color }}
                          title={`Color option ${index + 1}`}
                        ></span>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Product Info */}
                <div className="product-info">
                  {/* Brand Name (if available) */}
                  {item.brand && (
                    <div className="product-brand">{item.brand}</div>
                  )}
                  
                  {/* Product Name */}
                  <h4 className="product-name1" onClick={() => window.location.href = `/product/${item.id}`}>
                    {item.name}
                  </h4>
                  
                  {/* Rating Display */}
                  {item.rating && (
                    <div className="product-rating">
                      <div className="stars" style={{ '--rating': item.rating }}>
                        <span>★★★★★</span>
                      </div>
                      <span className="rating-count">({item.reviews || 0})</span>
                    </div>
                  )}
                  
                  {/* Price Display */}
                  <div className="product-price">
                    {item.old_price && item.old_price > item.markup_price ? (
                      <>
                        <span className="current-price">₱{item.markup_price}</span>
                      </>
                    ) : (
                      <span className="current-price">₱{item.markup_price}</span>
                    )}
                  </div>
                  
                  {/* Additional Specs (for gadgets) */}
                  {props.category === 'gadgets' && (
                    <div className="product-specs">
                      {item.ram && <span className="spec">{item.ram}</span>}
                      {item.storage && <span className="spec">{item.storage}</span>}
                      {item.processor && <span className="spec">{item.processor}</span>}
                    </div>
                  )}
                  
                  {/* List View Additional Information */}
                  {viewMode === 'list' && (
                    <div className="product-description">
                      <p>{item.description || 'No description available'}</p>
                      {item.deliveryTime && (
                        <div className="delivery-info">
                          <span className="delivery-icon">🚚</span>
                          <span>Delivery in {item.deliveryTime} day(s)</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="product-actions">
                    <button className="add-to-cart-btn">Add to Cart</button>
                    <button className="wishlist-btn" title="Add to Wishlist">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopCategory;