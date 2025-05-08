import React, { useState } from 'react';
import './Sidebar.css';
import { Link } from 'react-router-dom';
import add_product_icon from '../../assets/all_product_icon.png';
import list_product_icon from '../../assets/list_product_icon.png';
import order_product_icon from '../../assets/order_product_icon.png';

export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className='sidebar'>
      <div className={`hamburger ${isOpen ? 'open' : ''}`} onClick={toggleSidebar}>
        <span></span>
        <span></span>
        <span></span>
      </div>
      <div className={`sidebar-items ${isOpen ? 'open' : ''}`}>
        <Link to={'riderdashboard'} style={{ textDecoration: 'none' }}>
          <div className='sidebar-item'>
            <img src={add_product_icon} alt='' />
            <p>Dashboard</p>
          </div>
        </Link>
        <Link to={'orders'} style={{ textDecoration: 'none' }}>
          <div className='sidebar-item'>
            <img src={order_product_icon} alt='' />
            <p>Orders List</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;