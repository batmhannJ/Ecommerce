import React from 'react';
import './Admin.css';
import { Sidebar } from '../../Components/Sidebar/Sidebar';
import { Routes, Route } from 'react-router-dom';
import ListProduct from '../../Components/ListProduct/ListProduct';
import Orders from '../../Components/Orders/Orders';
import UserManagement from '../../Components/UserManagement/UserManagement';
import TransactionManagement from '../../Components/TransactionManagement/TransactionManagement';
import Dashboard from '../../Components/Dashboard/Dashboard';
import SellerRequest from '../../Components/SellerRequest/SellerRequest';
import RiderRequest from '../../Components/RiderRequest/RiderRequest';
import AccountSettings from '../../Components/AdminProfile/AccountSettings'; // Adjust path as necessary
import SellerList from '../../Components/SellerList/SellerList';
import RiderList from '../../Components/RiderList/RiderList';
import Commission from '../../Components/Commission/Commission';


const Admin = () => {
  return (
    <div className="admin">
      <Sidebar />
      <div className="admin-content">
        <Routes>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="listproduct" element={<ListProduct />} />
          <Route path="orderproduct" element={<Orders />} />
          <Route path="usermanagement" element={<UserManagement />} />
          <Route path="transactionmanagement" element={<TransactionManagement />} />
          <Route path="sellerrequest" element={<SellerRequest />} />
          <Route path="riderrequest" element={<RiderRequest />} />
          <Route path="accountsettings" element={<AccountSettings />} />
          <Route path="sellerlist" element={<SellerList />} />
          <Route path="riderlist" element={<RiderList />} />
          <Route path="commission" element={<Commission />} />
        </Routes>
      </div>
    </div>
  );
};

export default Admin;
