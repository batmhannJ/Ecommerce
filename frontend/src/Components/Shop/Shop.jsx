import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Item from "../Item/Item";
import "./Sidebar.css";

const Shop = ({ products }) => {
  const { category } = useParams();
  
  // States for UI and sorting only (removed filter states)
  const [sortBy, setSortBy] = useState("popular");
  const [activeSubcategory, setActiveSubcategory] = useState(null);
  
  // Filter products by category and subcategory only
  let filteredProducts = products;
  if (category) {
    filteredProducts = products.filter((item) => item.category === category);
  }
  
  if (activeSubcategory) {
    filteredProducts = filteredProducts.filter(
      (item) => item.subcategory === activeSubcategory
    );
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

  return (
    <div className="shop-container">
      {/* Main content area */}
      <main className="shop-main full-width">
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
              <p>Please try selecting a different category or subcategory.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Shop;