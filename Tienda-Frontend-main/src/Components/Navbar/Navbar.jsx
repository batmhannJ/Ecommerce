import React, { useContext, useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShopContext } from "../../Context/ShopContext";
import SearchBar from "../SearchBar/SearchBar";
import "./Navbar.css";
import cart_icon from "../Assets/cart_icon.png";
import menu_icon from "../Assets/menu_icon.png";
import profile_icon from "../Assets/profile_icon.png";
import navbar_icon from "../Assets/navbar_icon.png";
import SearchTags from "../SearchTags/SearchTags";

const Navbar = () => {
  const [menu, setMenu] = useState("shop");
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);
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

  const isLoggedIn = !!localStorage.getItem("auth-token");

  return (
    <div className="navbar">
      <div className="nav-left">
        <div className="nav-logo">
          <Link to="/" style={{ textDecoration: "none" }}>
            <img src={navbar_icon} alt="" />
          </Link>
          <Link to="/" style={{ textDecoration: "none" }}>
            <p>TIENDA</p>
          </Link>
        </div>
        <SearchBar />
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
            Home
          </Link>
          {menu === "shop" ? <hr /> : null}
        </li>
        <li onClick={() => setMenu("crafts")}>
          <Link style={{ textDecoration: "none" }} to="/crafts">
            Crafts
          </Link>
          {menu === "crafts" ? <hr /> : null}
        </li>
        <li onClick={() => setMenu("clothes")}>
          <Link style={{ textDecoration: "none" }} to="/clothes">
            Clothes
          </Link>
          {menu === "clothes" ? <hr /> : null}
        </li>
        <li onClick={() => setMenu("food")}>
          <Link style={{ textDecoration: "none" }} to="/food">
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
          <button
            className="nav-logout-btn"
            onClick={() => {
              localStorage.removeItem("auth-token");
              window.location.replace("/");
            }}
          >
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
              <Link to="/user/accountsettings" onClick={closeProfileMenu}>
                <button>Profile</button>
              </Link>
              <Link to="/myorders" onClick={closeProfileMenu}>
                <button>Orders</button>
              </Link>
            </div>
          </div>
        )}
      </div>
      <SearchTags />
    </div>
  );
};

export default Navbar;
