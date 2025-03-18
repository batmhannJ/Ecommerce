import React from 'react'
import './Sidebar.css'
import { Link } from 'react-router-dom'
import add_product_icon from '../../assets/all_product_icon.png'
import list_product_icon from '../../assets/list_product_icon.png'
import order_product_icon from '../../assets/order_product_icon.png'

export const Sidebar = () => {
  return (
    <div className='sidebar'>
      <Link to={'addproduct'} style={{ textDecoration: "none" }}>
      <div className="sidebar-item">
        <img src={add_product_icon} alt="" />
        <p>Add Product</p>
      </div>
      </Link>
      
      <Link to={'listproduct'} style={{ textDecoration: "none" }}>
      <div className="sidebar-item">
        <img src={list_product_icon} alt="" />
        <p>Product List</p>
      </div>
      </Link>

      <Link to={'orders'} style={{ textDecoration: "none" }}>
      <div className="sidebar-item">
        <img src={order_product_icon} alt="" />
        <p>Orders List</p>
      </div>
      </Link>
    </div>
  )
}

export default Sidebar;