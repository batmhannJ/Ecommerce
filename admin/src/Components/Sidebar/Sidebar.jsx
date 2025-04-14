import React, { useState } from 'react';
import './Sidebar.css';
import { Link } from 'react-router-dom';
import dashboard from '../../assets/dashboard.png';
import commission from '../../assets/dashboard.png';
import list_product_icon from '../../assets/list_product_icon.png';
import order_product_icon from '../../assets/order_product_icon.png';
import user_management_icon from '../../assets/user_management_icon.png';
import seller from '../../assets/seller.png';
import transaction from '../../assets/transaction.png';
import request from '../../assets/request.png';

export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className='sidebar'>
      <div className="hamburger" onClick={toggleSidebar}>
        <span></span>
        <span></span>
        <span></span>
      </div>
      <div className={`sidebar-items ${isOpen ? 'open' : ''}`}>
        <Link to='/admin/dashboard' style={{ textDecoration: 'none' }}>
          <div className="sidebar-item">
            <img src={dashboard} alt="Dashboard" />
            <p>Dashboard</p>
          </div>
        </Link>
        <Link to='/admin/commission' style={{ textDecoration: 'none' }}>
          <div className="sidebar-item">
            <img src={commission} alt="Commission" />
            <p>Commission</p>
          </div>
        </Link>
        <Link to='/admin/listproduct' style={{ textDecoration: 'none' }}>
          <div className="sidebar-item">
            <img src={list_product_icon} alt="Product List Icon" />
            <p>Product List</p>
          </div>
        </Link>
        <Link to='/admin/orderproduct' style={{ textDecoration: 'none' }}>
          <div className="sidebar-item">
            <img src={order_product_icon} alt="Orders List Icon" />
            <p>Orders List</p>
          </div>
        </Link>
        <Link to='/admin/usermanagement' style={{ textDecoration: 'none' }}>
          <div className="sidebar-item">
            <img src={user_management_icon} alt="User Management Icon" />
            <p>User Manager</p>
          </div>
        </Link>
        <Link to='/admin/sellerlist' style={{ textDecoration: 'none' }}>
          <div className="sidebar-item">
            <img src={seller} alt="Seller" />
            <p>Seller List</p>
          </div>
        </Link>
        <Link to='/admin/riderlist' style={{ textDecoration: 'none' }}>
          <div className="sidebar-item">
            <img src={seller} alt="Rider" />
            <p>Rider List</p>
          </div>
        </Link>
        <Link to='/admin/transactionmanagement' style={{ textDecoration: 'none' }}>
          <div className="sidebar-item">
            <img src={transaction} alt="Transaction" />
            <p>Transactions</p>
          </div>
        </Link>
        <Link to='/admin/sellerrequest' style={{ textDecoration: 'none' }}>
          <div className="sidebar-item">
            <img src={request} alt="Request" />
            <p>Seller Requests</p>
          </div>
        </Link>
        <Link to='/admin/riderrequest' style={{ textDecoration: 'none' }}>
          <div className="sidebar-item">
            <img src={request} alt="Request" />
            <p>Rider Requests</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;