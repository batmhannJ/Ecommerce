import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import './NewCollections.css';
import { ShopContext } from '../../Context/ShopContext'; // Adjust path as needed

const NewCollections = () => {
  const [new_collection, setNew_Collection] = useState([]);
  const [cartQuantities, setCartQuantities] = useState({});
  const [shopDetails, setShopDetails] = useState({});
  const { addToCart } = useContext(ShopContext);

  useEffect(() => {
    // Fetch collection items with shop details
    fetch('http://localhost:4000/newcollections')
      .then((response) => response.json())
      .then((data) => {
        setNew_Collection(data.slice(0, 8));
        
        // Get unique shop IDs to fetch shop details
        const shopIds = [...new Set(data.map(item => item.shop_id))].filter(id => id);
        
        if (shopIds.length > 0) {
          // Fetch shop details for each product
          fetch('http://localhost:4000/shops')
            .then((response) => response.json())
            .then((shopData) => {
              const shopMap = {};
              shopData.forEach(shop => {
                shopMap[shop.id] = {
                  name: shop.shopName,
                  location: shop.businessLocation
                };
              });
              setShopDetails(shopMap);
            });
        }
      });
      
    // Get cart data from localStorage if available
    const cartData = localStorage.getItem('cart-items');
    if (cartData) {
      try {
        const parsedCart = JSON.parse(cartData);
        const quantities = {};
        Object.keys(parsedCart).forEach(itemId => {
          quantities[itemId] = parsedCart[itemId].quantity;
        });
        setCartQuantities(quantities);
      } catch (e) {
        console.error("Error parsing cart data:", e);
      }
    }
  }, []);

  const handleClick = () => {
    window.scrollTo(0, 0);
  };
  
  const handleAddToCart = (e, item) => {
    e.preventDefault(); // Prevent navigation to product page
    e.stopPropagation(); // Prevent event bubbling
    
    const authToken = localStorage.getItem("auth-token");
    
    if (authToken) {
      // Add to cart with default size (if applicable), base price, and quantity 1
      addToCart(item.id, "", item.new_price, 1);
      
      // Update local quantity tracking
      setCartQuantities(prev => ({
        ...prev,
        [item.id]: (prev[item.id] || 0) + 1
      }));
      
      // Show toast notification (if you have a toast system)
      if (window.toast) {
        window.toast.success("Added to cart!", { position: "top-right" });
      }
    } else {
      // Redirect to login or show login prompt
      if (window.toast) {
        window.toast.error("Please log in to add items to cart", { position: "top-right" });
      }
      // Optional: window.location.href = '/login';
    }
  };

  // Calculate discount percentage
  const calculateDiscount = (oldPrice, newPrice) => {
    return Math.round(((oldPrice - newPrice) / oldPrice) * 100);
  };

  return (
    <div id='new-collections' className='new-collections'>
      <h1>NEW COLLECTIONS</h1>
      <hr />
      <div className="collections">
        {new_collection.map((item, i) => (
          <div key={i} className="item">
            <Link to={`/product/${item.id}`} onClick={handleClick}>
              <div className="item_img">
                <img src={item.image} alt={item.name} />
                
                {/* Store badge */}
                {item.shop_id && shopDetails[item.shop_id] && (
                  <div className="store_badge">
                    <span className="store_name">{shopDetails[item.shop_id].name}</span>
                  </div>
                )}
              </div>
              <div className="item_content">
                <p className="item_name">{item.name}</p>
                
                {/* Shop information */}
                {item.shop_id && shopDetails[item.shop_id] && (
                  <div className="item_shop">
                    <span className="shop_name">{shopDetails[item.shop_id].name}</span>
                    <div className="store_location">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      <span>{shopDetails[item.shop_id].location}</span>
                    </div>
                  </div>
                )}
                
                
                <div className="item_prices">
                  <div className="item_price_new">₱{item.new_price}</div>
                  
                </div>
                
           
                
                {/* Stock status */}
                <div className="item_stock_info">
                  {item.stock <= 5 ? (
                    <span className="low_stock">Only {item.stock} left!</span>
                  ) : (
                    <span className="in_stock">{item.stock} in stock</span>
                  )}
                </div>
                
              </div>
            </Link>
            
            {/* New styled Add to Cart button */}
            <div 
              className="add_to_cart_button"
              onClick={(e) => handleAddToCart(e, item)}
            >
              {cartQuantities[item.id] ? (
                <>
                  <span className="cart_icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="9" cy="21" r="1"></circle>
                      <circle cx="20" cy="21" r="1"></circle>
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                  </span>
                  <span className="cart_quantity">{cartQuantities[item.id]}</span>
                </>
              ) : (
                <>
                  <span className="cart_icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="9" cy="21" r="1"></circle>
                      <circle cx="20" cy="21" r="1"></circle>
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                  </span>
                  <span className="add_text">Add to Cart</span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewCollections;