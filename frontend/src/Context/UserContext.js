import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const userData = localStorage.getItem('user-data');
    if (userData && userData !== 'undefined') {
      try {
        return JSON.parse(userData);
      } catch (error) {
        console.error("Failed to parse user-data from localStorage:", error);
        localStorage.removeItem('user-data');
        return null;
      }
    }
    return null;
  });

  const [token, setToken] = useState(() => {
    const authToken = localStorage.getItem('auth-token');
    return authToken && authToken !== 'undefined' ? authToken : null;
  });

  const login = (userData, authToken) => {
    console.log('Logging in user:', userData); // Debugging
    console.log('Token:', authToken); // Debugging
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('user-data', JSON.stringify(userData));
    localStorage.setItem('auth-token', authToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user-data');
    localStorage.removeItem('auth-token');
  };

  return (
    <UserContext.Provider value={{ user, token, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);