import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Item from "../Item/Item";
import Sidebar from "../Shop/Sidebar";
import CategoryHeader from "./Category"; // Import the new component
import "./StoreProducts.css";

const StoreProducts = () => {
  const { id } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [storeInfo, setStoreInfo] = useState(null);
  
  // States for filters
  const [priceRange, setPriceRange] = useState([0, 151200]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [sortBy, setSortBy] = useState("featured");
  const [activeCategory, setActiveCategory] = useState(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  
  useEffect(() => {
    // Reset states when store changes
    resetFilters();
    setLoading(true);
    setError(null);
    
    // Only fetch products for now (we'll add store info in a separate request if needed)
    fetch(`http://localhost:4000/store-products/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Fetched products:", data);
        // Make sure data is an array
        const productsArray = Array.isArray(data) ? data : [];
        setProducts(productsArray);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching products:", error);
        setError("Failed to load products. Please try again later.");
        setLoading(false);
      });
  }, [id]);
  
  // Extract all available brands from products
  const allBrands = [...new Set(products.map(item => {
    const productData = item._doc || item;
    return productData.brand;
  }))].filter(Boolean).sort();
  
  // Extract categories dynamically from the products of this specific store
  const storeCategories = [...new Set(products.map(item => {
    const productData = item._doc || item;
    return productData.category;
  }))].filter(Boolean);
  
  // Filter products based on selected criteria
  let filteredProducts = [...products]; // Create a copy to avoid modifying original array
  
  // Apply brand filter if any brands are selected
  if (selectedBrands.length > 0) {
    filteredProducts = filteredProducts.filter(item => {
      const productData = item._doc || item;
      return selectedBrands.includes(productData.brand);
    });
  }
  
  // Apply category filter if a category is selected
  if (activeCategory) {
    filteredProducts = filteredProducts.filter(item => {
      const productData = item._doc || item;
      return productData.category === activeCategory;
    });
  }
  
  // Apply price filter
  filteredProducts = filteredProducts.filter(item => {
    const productData = item._doc || item;
    const price = parseFloat(productData.new_price) || 0;
    return price >= priceRange[0] && price <= priceRange[1];
  });
  
  // Apply sorting
  if (sortBy === "price-low-high") {
    filteredProducts.sort((a, b) => {
      const aData = a._doc || a;
      const bData = b._doc || b;
      return parseFloat(aData.new_price) - parseFloat(bData.new_price);
    });
  } else if (sortBy === "price-high-low") {
    filteredProducts.sort((a, b) => {
      const aData = a._doc || a;
      const bData = b._doc || b;
      return parseFloat(bData.new_price) - parseFloat(aData.new_price);
    });
  } else if (sortBy === "newest") {
    filteredProducts.sort((a, b) => {
      const aData = a._doc || a;
      const bData = b._doc || b;
      return new Date(bData.date || 0) - new Date(aData.date || 0);
    });
  } else if (sortBy === "rating") {
    filteredProducts.sort((a, b) => {
      const aData = a._doc || a;
      const bData = b._doc || b;
      return (parseFloat(bData.rating) || 0) - (parseFloat(aData.rating) || 0);
    });
  }
  
  // Toggle mobile filter visibility
  const toggleMobileFilter = () => {
    setIsMobileFilterOpen(!isMobileFilterOpen);
  };
  
  // Reset all filters
  const resetFilters = () => {
    setPriceRange([0, 151200]);
    setSelectedBrands([]);
    setSelectedRatings([]);
    setActiveCategory(null);
    // Don't reset sorting - users often expect sorting to persist
  };

  // Debug data output - remove in production
  console.log("Products count:", products.length);
  console.log("Filtered products count:", filteredProducts.length);
  console.log("Categories found:", storeCategories);

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
        <Sidebar 
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          brands={allBrands}
          selectedBrands={selectedBrands}
          setSelectedBrands={setSelectedBrands}
        />
      </aside>
      
      {/* Main content area */}
      <main className="shop-main">
        {/* New Category Header Component */}
        {storeCategories.length > 0 && (
          <CategoryHeader 
            categories={storeCategories}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
          />
        )}
        
        {/* Page header with title and sorting */}
        <header className="shop-header">
          <div className="shop-title">
            <h1>{activeCategory || "All Products"}</h1>
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
                <option value="featured">Featured</option>
                <option value="rating">Top Rated</option>
                <option value="newest">Newest Arrivals</option>
                <option value="price-low-high">Price: Low to High</option>
                <option value="price-high-low">Price: High to Low</option>
              </select>
            </div>
          </div>
        </header>
        
        {/* Products grid with better error handling */}
        <section className="shop-products">
          {loading ? (
            <div className="loading">Loading products...</div>
          ) : error ? (
            <div className="error-message">
              <h3>Error</h3>
              <p>{error}</p>
              <button onClick={() => window.location.reload()} className="reset-button">Try Again</button>
            </div>
          ) : products.length === 0 ? (
            <div className="no-products">
              <h3>No products available</h3>
              <p>This store doesn't have any products listed yet.</p>
            </div>
          ) : products.length > 0 ? (
            <div className="shop-products-grid">
              {products.map((product) => {
                const { _doc } = product; // Extract actual data
                return (
                  <Item
                  key={_doc._id}
                  id={_doc.id}
                  name={_doc.name}
                  image={`http://localhost:4000/upload/images/${_doc.image}`}
                  new_price={_doc.new_price}
                  old_price={_doc.old_price}
                  stock={_doc.stock}
                />
                );
              })}
            </div>
          ) : (
            <div className="no-products">
              <h3>No products match your filters</h3>
              <p>Please try adjusting your filters or search terms.</p>
              <button onClick={resetFilters} className="reset-button">Reset All Filters</button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default StoreProducts;