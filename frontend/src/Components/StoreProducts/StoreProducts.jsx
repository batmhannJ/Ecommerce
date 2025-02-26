import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Item from "../Item/Item";

const StoreProducts = () => {
  const { id } = useParams();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:4000/store-products/${id}`)
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched products:", data);
        data.forEach(product => console.log("Product details:", product));
        setProducts(data);
      });
  }, [id]);

  return (
    <div>
      <h1>Store Products</h1>
      <hr />
      <div className="popular-item">
  {products.length > 0 ? (
    products.map((product) => {
      const { _doc } = product; // Extract actual data
      console.log("Passing product to Item:", _doc); // Debugging log

      return (
        <Item
          key={_doc._id}
          id={_doc.id}
          name={_doc.name}
          image={`http://localhost:4000/upload/images/${_doc.image}`}
          new_price={_doc.new_price}
          old_price={_doc.old_price}
          stock={_doc.stock}
        />
      );
    })
  ) : (
    <p>No products available for this store.</p>
  )}
</div>
    </div>
  );
};

export default StoreProducts;
