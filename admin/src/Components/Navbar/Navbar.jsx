import React, { useState, useRef, useEffect } from 'react';
import './Navbar.css';
import { Link } from 'react-router-dom';
import navProfile from '../../assets/nav-pro.png';
import navLogo from '../../assets/bizgo.png';

export const Navbar = () => {
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);
  const profileMenuRef = useRef();

  const toggleProfileMenu = () => {
    setProfileMenuVisible(!profileMenuVisible);
  };

  const closeProfileMenu = () => {
    setProfileMenuVisible(false);
  };

  const handleLogout = () => {
    console.log('Logging out...');
    localStorage.removeItem('admin_token');
    console.log('Token removed from localStorage');
    window.location.replace("/");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className='navbar'>
      <div className="navbar-brand">
        <img src={navLogo} alt="Bizgo Logo" className="nav-logo" />
        <div className="brand-divider"></div>
        <div className="panel-badge">ADMIN PANEL</div>
      </div>
      
      <div className="nav-profile-container">
        <div className="profile-section">
          <img
            src={navProfile}
            alt="Profile"
            className='nav-profile'
            onClick={toggleProfileMenu}
          />
          {profileMenuVisible && (
            <div ref={profileMenuRef} className="profile-menu">
              <div className="menu-header">
                <span className="menu-welcome">Welcome</span>
                <span className="user-status">Admin</span>
              </div>
              <div className="menu-items">
                <Link to="/admin/accountsettings" onClick={closeProfileMenu}>
                  <button>
                    <span className="menu-icon profile-icon"></span>
                    <span>Profile</span>
                  </button>
                </Link>
                <button onClick={handleLogout}>
                  <span className="menu-icon logout-icon"></span>
                  <span>Logout</span>
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