import React, { useEffect, useState } from "react";
import "./Popular.css";
import Item from "../Item/Item";

const Popular = () => {
  const [popularProducts, setPopularProducts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:4000/popularincrafts")
      .then((response) => response.json())
      .then((data) => {
        console.log("API Response:", data);
        if (Array.isArray(data)) {
          setPopularProducts(data);
        } else {
          console.error("Expected an array but got:", data);
          setPopularProducts([]);
        }
      })
      .catch((error) => console.error("Fetch error:", error));
  }, []);
  

  return (
    <div id="popular" className="popular">
      <h1>POPULAR IN CRAFTS</h1>
      <hr />
      <div className="popular-item">
        {Array.isArray(popularProducts) && popularProducts.map((item, i) => (
          <Item
            key={i}
            id={item.id}
            name={item.name}
            image={item.image}
            new_price={item.new_price}
          />
        ))}
      </div>
    </div>
  );
};

export default Popular;
