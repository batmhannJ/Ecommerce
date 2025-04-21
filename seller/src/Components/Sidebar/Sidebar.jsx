import React, { useState } from 'react';
import './Sidebar.css';
import { Link } from 'react-router-dom';
import add_product_icon from '../../assets/all_product_icon.png';
import list_product_icon from '../../assets/list_product_icon.png';
import order_product_icon from '../../assets/order_product_icon.png';

export const Sidebar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="sidebar">
      {/* Hamburger Icon for Mobile */}
      <div className={`hamburger ${isMenuOpen ? 'open' : ''}`} onClick={toggleMenu}>
        <span></span>
        <span></span>
        <span></span>
      </div>

      {/* Sidebar Items */}
      <div className={`sidebar-items ${isMenuOpen ? 'open' : ''}`}>
        {/* Close Button for Mobile */}
        <div className="close-button" onClick={toggleMenu}></div>

        <Link to={'addproduct'} style={{ textDecoration: "none" }} onClick={() => setIsMenuOpen(false)}>
          <div className="sidebar-item">
            <img src={add_product_icon} alt="Add Product" />
            <p>Add Product</p>
          </div>
        </Link>

        <Link to={'listproduct'} style={{ textDecoration: "none" }} onClick={() => setIsMenuOpen(false)}>
          <div className="sidebar-item">
            <img src={list_product_icon} alt="Product List" />
            <p>Product List</p>
          </div>
        </Link>

        <Link to={'orders'} style={{ textDecoration: "none" }} onClick={() => setIsMenuOpen(false)}>
          <div className="sidebar-item">
            <img src={order_product_icon} alt="Orders List" />
            <p>Orders List</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;