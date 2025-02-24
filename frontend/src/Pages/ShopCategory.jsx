import React, { useContext } from "react";
import "./CSS/ShopCategory.css";
import { ShopContext } from "../Context/ShopContext";
import Item from "../Components/Item/Item";

const ShopCategory = (props) => {
  const { all_product } = useContext(ShopContext);

  // Create a function to filter products with unique names
  const getUniqueProducts = (products) => {
    const uniqueNames = new Set();
    return products.filter((product) => {
      if (!uniqueNames.has(product.name)) {
        uniqueNames.add(product.name);
        return true;
      }
      return false;
    });
  };

  // Get the unique products
  const uniqueProducts = getUniqueProducts(all_product);

  return (
    <div className="shop-category">
      <img className="shopcategory-banner" src={props.banner} alt="" />
      <div className="shopcategory-products">
        {uniqueProducts
          .filter((item) => props.category === item.category)
          .map((item, i) => (
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

export default ShopCategory;
