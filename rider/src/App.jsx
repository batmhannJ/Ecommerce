import React from 'react';
import { Navbar } from './Components/Navbar/Navbar';
import Seller from './Pages/Seller/Seller';
import { Routes, Route, Navigate } from 'react-router-dom';
import SLoginSignup from './Components/SLoginSignUp/SLoginSignup';


const App = () => {
  const isAuthenticated = !!localStorage.getItem('admin_token');
  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <SLoginSignup /> : <Navigate to="/seller/addproduct" />} />
      <Route
        path="/*"
        element={
          isAuthenticated ? (
            <>
              <Navbar />
              <Seller />
            </>
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App