import React, { useEffect } from "react";
import "./App.css";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./Components/Navbar/Navbar";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Shop from "./Pages/Shop";
import Store from "./Pages/Store";
import Product from "./Pages/Product";
import ShopCategory from "./Pages/ShopCategory";
import Cart from "./Pages/Cart";
import LoginSignup from "./Pages/LoginSignup";
import SLoginSignup from "./Pages/SLoginSignup";
import Footer from "./Components/Footer/Footer";
import PlaceOrder from "./Components/PlaceOrder/PlaceOrder";
import Crafts_Banner from "./Components/Assets/Clothes_Banner.png";
import Clothes_Banner from "./Components/Assets/Crafts_Banner.png";
import Food_Banner from "./Components/Assets/Food_Banner.png";
import Verify from "./Components/Verify/Verify";
import MyOrders from "./Components/MyOrders/MyOrders";
import About from "./Components/About/About";
import Terms from "./Components/Terms/Terms";
import UserProfile from "./Pages/User/UserProfile";
import UserSideBar from "./Components/UserProfile/UserSideBar";
import AccountSettings from "./Components/UserProfile/AccountSettings";
import Offices from "./Components/Offices/Offices"; 
import Partner from "./Components/Partner/Partner";
import StoreProducts from "./Components/StoreProducts/StoreProducts";


import {
  regions,
  provincesByCode,
  cities,
  barangays,
} from "select-philippines-address";
import SearchBar from "./Components/SearchBar/SearchBar";
import SearchResults from "./Components/SearchBar/SearchResults";

function App() {
  // Fetch regions, provinces, cities, and barangays
  const fetchAddressDetails = async () => {
    try {
      // Fetch regions
      const regionList = await regions();
      console.log("Regions:", regionList);

      // Get the first region's code
      const regionCode = regionList[0]?.region_code;
      if (!regionCode) throw new Error("Region code not found");

      // Fetch provinces by region code
      const provinceList = await provincesByCode(regionCode);
      console.log("Provinces:", provinceList);

      // Get the first province's code
      const provinceCode = provinceList[0]?.province_code;
      if (!provinceCode) throw new Error("Province code not found");

      // Fetch cities by province code
      const cityList = await cities(provinceCode);
      console.log("Cities:", cityList);

      // Get the first city's code
      const cityCode = cityList[0]?.city_code;
      if (!cityCode) throw new Error("City code not found");

      // Fetch barangays by city code
      const barangayList = await barangays(cityCode);
      console.log("Barangays:", barangayList);
    } catch (error) {
      console.error("Error fetching address details:", error);
    }
  };

  // Use useEffect to trigger fetch when the component mounts
  useEffect(() => {
    fetchAddressDetails();
  }, []); // Empty dependency array ensures this only runs once when the component mounts.

  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Shop />} />
        <Route path="/about" element={<About />} />
        <Route
          path="/crafts"
          element={<ShopCategory banner={Crafts_Banner} category="crafts" />}
        />
        <Route path="/gadgets" element={<ShopCategory category="gadgets" />} />
        <Route path="/store" element={<Store />} category="store" />
        <Route
          path="/clothes"
          element={<ShopCategory banner={Clothes_Banner} category="clothes" />}
        />
        <Route
          path="/food"
          element={<ShopCategory banner={Food_Banner} category="food" />}
        />
        <Route path="/product" element={<Product />}>
          <Route path=":productId" element={<Product />} />
        </Route>
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<LoginSignup />} />
        <Route path="/business-signup" element={<SLoginSignup />} />
        <Route path="/order" element={<PlaceOrder />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/myorders" element={<MyOrders />} />
        <Route path="/user/:activepage" element={<UserProfile />} />
        <Route path="usersidebar" element={<UserSideBar />} />
        <Route path="accountsettings" element={<AccountSettings />} />
        <Route path="/offices" element={<Offices />} /> 
        <Route path="/terms" element={<Terms />} /> 
        <Route path="/about" element={<About />} /> 
        <Route path="/" element={<SearchBar />} />
        <Route path="/search-results" element={<SearchResults />} />
        <Route path="/partner" element={<Partner />} />
        <Route path="/store/:id" element={<StoreProducts />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
