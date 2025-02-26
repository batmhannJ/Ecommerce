import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Item from "../Item/Item"; // Import your Item component

const StoreProducts = () => {
  const { id } = useParams(); // Get seller ID from URL
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:4000/store-products/${id}`)
      .then((response) => response.json())
      .then((data) => setProducts(data));
  }, [id]);

  return (
    <div>
      <h1>Store Products</h1>
      <hr />
      <div className="popular-item">
        {products.length > 0 ? (
          products.map((product) => (
            <Item
              key={product._id}
              name={product.name}
              image={product.image}
              new_price={product.new_price}
              old_price={product.old_price}
              stock={product.stock}
            />
          ))
        ) : (
          <p>No products available for this store.</p>
        )}
      </div>
    </div>
  );
};

export default StoreProducts;
