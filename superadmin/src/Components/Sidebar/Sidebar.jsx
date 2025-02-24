import React from 'react';
import './Sidebar.css';
import { Link } from 'react-router-dom';
import list_product_icon from '../../assets/list_product_icon.png';
import order_product_icon from '../../assets/order_product_icon.png';
import user_management_icon from '../../assets/user_management_icon.png'; // Add this line

export const Sidebar = () => {
  return (
    <div className='sidebar'>
      <Link to='/superadmin/usermanagement' style={{ textDecoration: 'none' }}>
        <div className="sidebar-item">
          <img src={user_management_icon} alt="User Management Icon" />
          <p>Admin Manager</p>
        </div>
      </Link>
      <Link to='/superadmin/sellerrequest' style={{ textDecoration: 'none' }}>
        <div className="sidebar-item">
          <img src={user_management_icon} alt="User Management Icon" />
          <p>Admin Requests</p>
        </div>
      </Link>
    </div>
  );
};

export default Sidebar;
