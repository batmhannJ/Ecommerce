import React from "react";
import "./Sidebar.css";

const Sidebar = ({ priceRange, setPriceRange, brands, selectedBrands, setSelectedBrands }) => {
  // Handle price range changes
  const handleMinPriceChange = (e) => {
    setPriceRange([parseInt(e.target.value), priceRange[1]]);
  };

  const handleMaxPriceChange = (e) => {
    setPriceRange([priceRange[0], parseInt(e.target.value)]);
  };

  // Handle brand selection
  const handleBrandChange = (brand) => {
    if (selectedBrands.includes(brand)) {
      setSelectedBrands(selectedBrands.filter(b => b !== brand));
    } else {
      setSelectedBrands([...selectedBrands, brand]);
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-section">
        <h3>Price Range</h3>
        <div className="price-inputs">
          <div className="price-input">
            <span>₱</span>
            <input
              type="number"
              value={priceRange[0]}
              onChange={handleMinPriceChange}
              min="0"
            />
          </div>
          <span>to</span>
          <div className="price-input">
            <span>₱</span>
            <input
              type="number"
              value={priceRange[1]}
              onChange={handleMaxPriceChange}
              min={priceRange[0]}
            />
          </div>
        </div>
      </div>

      <div className="sidebar-section">
        <h3>Brand</h3>
        <div className="brand-filters">
          {brands.map(brand => (
            <div className="brand-checkbox" key={brand}>
              <input
                type="checkbox"
                id={brand}
                checked={selectedBrands.includes(brand)}
                onChange={() => handleBrandChange(brand)}
              />
              <label htmlFor={brand}>{brand}</label>
            </div>
          ))}
        </div>
      </div>

      <div className="sidebar-section">
        <h3>Ratings</h3>
        <div className="rating-filters">
          {[5, 4, 3, 2, 1].map(rating => (
            <div className="rating-option" key={rating}>
              <input type="checkbox" id={`rating-${rating}`} />
              <label htmlFor={`rating-${rating}`}>
                {Array(rating).fill('★').join('')}
                {Array(5-rating).fill('☆').join('')} & Up
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="sidebar-section">
        <h3>Customer Service</h3>
        <div className="service-filters">
          <div className="service-option">
            <input type="checkbox" id="free-shipping" />
            <label htmlFor="free-shipping">Free Shipping</label>
          </div>
          <div className="service-option">
            <input type="checkbox" id="in-stock" />
            <label htmlFor="in-stock">In Stock</label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;