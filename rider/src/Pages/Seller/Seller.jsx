import React from "react";
import "./Seller.css";
import { Sidebar } from "../../Components/Sidebar/Sidebar";
import { Routes, Route } from "react-router-dom";
import AddProduct from "../../Components/AddProduct/AddProduct";
import ListProduct from "../../Components/ListProduct/ListProduct";
import Orders from "../../Components/Orders/Orders";
import SAccountSettings from '../../Components/SellerProfile/SAccountSettings'; // Adjust path as necessary

const Seller = () => {
  return (
    <div className="admin">
      <Sidebar />
      <Routes>
        <Route path="addproduct" element={<AddProduct />} /> {/* Remove leading / */}
        <Route path="listproduct" element={<ListProduct />} /> {/* Remove leading / */}
        <Route path="orders" element={<Orders />} /> {/* Remove leading / */}\
        <Route path="saccountsettings" element={<SAccountSettings />} />
      </Routes>
    </div>
  );
};

export default Seller;
