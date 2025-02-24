import React from 'react';
import './Sidebar.css';
import { Link } from 'react-router-dom';
import list_product_icon from '../../assets/list_product_icon.png';
import order_product_icon from '../../assets/order_product_icon.png';
import user_management_icon from '../../assets/user_management_icon.png'; // Add this line

export const Sidebar = () => {
  return (
    <div className='sidebar'>
      <Link to='/admin/dashboard' style={{ textDecoration: 'none' }}>
        <div className="sidebar-item">
          <img src={list_product_icon} alt="Product List Icon" />
          <p>Dasboard</p>
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
      <Link to='/admin/transactionmanagement' style={{ textDecoration: 'none' }}>
        <div className="sidebar-item">
          <img src={user_management_icon} alt="User Management Icon" />
          <p>Transactions</p>
        </div>
      </Link>
      <Link to='/admin/sellerrequest' style={{ textDecoration: 'none' }}>
        <div className="sidebar-item">
          <img src={user_management_icon} alt="User Management Icon" />
          <p>Requests</p>
        </div>
      </Link>
    </div>
  );
};

export default Sidebar;
