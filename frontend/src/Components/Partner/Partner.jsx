import React, { useEffect, useState } from "react";
import "./Partner.css";
import Item from "../Item/Item";
import ShopList from "../ShopList/ShopList";

const Partner = () => {
  const [stores, setStores] = useState([]);

  useEffect(() => {
    fetch("http://localhost:4000/partner-stores")
      .then((response) => response.json())
      .then((data) => setStores(data));
  }, []);

  return (
    <div id="popular" className="popular">
      <h1>PARTNER STORES</h1>
      <hr />
      <div className="popular-item">
        {stores.map((store, i) => (
          <ShopList
            key={i}
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
