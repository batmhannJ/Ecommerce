import React, { useContext, useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShopContext } from "../../Context/ShopContext";
import "./Navbar.css";
import cart_icon from "../Assets/cart_icon.png";
import menu_icon from "../Assets/menu_icon.png";
import profile_icon from "../Assets/profile_icon.png";
import navbar_icon from "../Assets/bizgo.png";
import { 
  Truck, 
  X, 
  Home, 
  Store, 
  Cpu, 
  Shirt, 
  Utensils, 
  User, 
  Package, 
  LifeBuoy, 
  Settings, 
  LogOut 
} from "lucide-react";

const Navbar = () => {
  const [menu, setMenu] = useState("shop");
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);
  const [isBannerVisible, setIsBannerVisible] = useState(true);
  const [userData, setUserData] = useState({
    name: "",
    email: ""
  });
  const { getTotalCartItems } = useContext(ShopContext);
  const menuRef = useRef();
  const profileMenuRef = useRef();

  const menu_toggle = (e) => {
    menuRef.current.classList.toggle("nav-menu-visible");
    e.target.classList.toggle("open");
  };

  const profile_toggle = () => {
    setProfileMenuVisible(!profileMenuVisible);
  };

  const closeProfileMenu = () => {
    setProfileMenuVisible(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target) &&
        !event.target.classList.contains("nav-profile-icon")
      ) {
        setProfileMenuVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Function to get user ID from token
  const getUserIdFromToken = () => {
    const authToken = localStorage.getItem("auth-token");
    if (authToken) {
      const payload = JSON.parse(atob(authToken.split(".")[1]));
      return payload.user.id;
    }
    return null;
  };

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      const authToken = localStorage.getItem("auth-token");
      const userId = getUserIdFromToken();

      if (!authToken || !userId) {
        console.error("No token or user ID found");
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:4000/api/users/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        setUserData({
          name: data.name || "User",
          email: data.email || "user@example.com"
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    const isLoggedIn = !!localStorage.getItem("auth-token");
    if (isLoggedIn) {
      fetchUserData();
    }
  }, []);

// Handle logout with status update
const handleLogout = async () => {
  const userId = getUserIdFromToken();

  if (userId) {
    try {
      const response = await fetch(
        `http://localhost:4000/api/users/${userId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "Offline" }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to update status:", response.status, errorData);
        alert(`Failed to update status: ${errorData.error || response.statusText}`);
      } else {
        console.log("Status updated successfully");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert(`Error updating status: ${error.message}`);
    }
  } else {
    console.error("No userId found");
    alert("No userId found");
  }

  // Clear token and redirect
  localStorage.removeItem("auth-token");
  window.location.replace("/");
};
  const isLoggedIn = !!localStorage.getItem("auth-token");

  return (
    <div className="navbar-container">
      {isBannerVisible && (
        <div className="business-account-banner">
          <Truck className="truck-icon" size={32} />
          <p>Be one of our partner stores!</p>
          <Link to="/business-signup">
            <button className="business-signup-btn">Sign Up Now</button>
          </Link>
          <X className="close-btn" size={24} onClick={() => setIsBannerVisible(false)} />
        </div>
      )}

      <div className="navbar">
        <div className="nav-left">
          <div className="nav-logo">
            <Link to="/" style={{ textDecoration: "none" }}>
              <img src={navbar_icon} alt="" />
            </Link>
            <Link to="/" style={{ textDecoration: "none" }}>
              <p>BizGo</p>
            </Link>
          </div>
        </div>
        <img
          className="nav-menu-dropdown"
          onClick={menu_toggle}
          src={menu_icon}
          alt="Menu Icon"
        />
        <ul ref={menuRef} className="nav-menu">
          <li onClick={() => setMenu("shop")}>
            <Link style={{ textDecoration: "none" }} to="/">
              <Home size={20} className="nav-menu-icon" />
              Home
            </Link>
            {menu === "shop" ? <hr /> : null}
          </li>
          <li onClick={() => setMenu("store")}>
            <Link style={{ textDecoration: "none" }} to="/store">
              <Store size={20} className="nav-menu-icon" />
              Shops
            </Link>
            {menu === "store" ? <hr /> : null}
          </li>
          <li onClick={() => setMenu("crafts")}>
            <Link style={{ textDecoration: "none" }} to="/gadgets">
              <Cpu size={20} className="nav-menu-icon" />
              Gadgets
            </Link>
            {menu === "crafts" ? <hr /> : null}
          </li>
          <li onClick={() => setMenu("clothes")}>
            <Link style={{ textDecoration: "none" }} to="/clothes">
              <Shirt size={20} className="nav-menu-icon" />
              Clothes
            </Link>
            {menu === "clothes" ? <hr /> : null}
          </li>
          <li onClick={() => setMenu("food")}>
            <Link style={{ textDecoration: "none" }} to="/food">
              <Utensils size={20} className="nav-menu-icon" />
              Food
            </Link>
            {menu === "food" ? <hr /> : null}
          </li>
        </ul>
        <div className="nav-login-cart">
          {!isLoggedIn ? (
            <Link to="/login">
              <button>Login</button>
            </Link>
          ) : (
            <button className="nav-logout-btn" onClick={handleLogout}>
              Logout
            </button>
          )}
          <Link to="/cart">
            <img src={cart_icon} alt="Cart Icon" />
          </Link>
          <div className="nav-cart-count">{getTotalCartItems()}</div>
          {isLoggedIn && (
            <div className="nav-profile-container">
              <img
                className="nav-profile-icon"
                onClick={profile_toggle}
                src={profile_icon}
                alt="Profile Icon"
              />
              <div
                ref={profileMenuRef}
                className={`profile-menu ${
                  profileMenuVisible ? "profile-menu-visible" : ""
                }`}
              >
                <div className="profile-menu-header">
                  <img src={profile_icon} alt="Profile" className="profile-menu-avatar" />
                  <div className="profile-menu-user-info">
                    <p className="profile-menu-username">{userData.name}</p>
                    <p className="profile-menu-email">{userData.email}</p>
                  </div>
                </div>
                <div className="profile-menu-divider"></div>
                <Link to="/user/accountsettings" onClick={closeProfileMenu}>
                  <button>
                    <User size={18} className="menu-icon" /> Profile
                  </button>
                </Link>
                <Link to="/myorders" onClick={closeProfileMenu}>
                  <button>
                    <Package size={18} className="menu-icon" /> Orders
                  </button>
                </Link>
                <div className="profile-menu-divider"></div>
                <button onClick={handleLogout}>
                  <LogOut size={18} className="menu-icon" /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;