import React, { useEffect, useState } from "react";
import "./Partner.css";
import ShopList from "../ShopList/ShopList";
import coverImage from "../Assets/partner.png";

const Partner = () => {
  const [stores, setStores] = useState([]);

  useEffect(() => {
    fetch("http://localhost:4000/partner-stores")
      .then((response) => response.json())
      .then((data) => setStores(data));
  }, []);

  return (
    <div className="partner-section">
      <div className="partner-banner">
        <img 
          src={coverImage} 
          alt="Partner Banner" 
        />
      </div>
      <div className="popular-item">
        {stores.map((store) => (
          <ShopList
            key={store._id}
            id={store._id}
            shopName={store.shopName}
            image={store.idPicture}
            businessLocation={store.businessLocation}
          />
        ))}
      </div>
    </div>
  );
};

export default Partner;
