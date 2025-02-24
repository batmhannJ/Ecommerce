import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "./AddProduct.css";
import upload_area from "../../assets/upload_area.png";

export const AddProduct = () => {
  const [image, setImage] = useState(null);
  const [productDetails, setProductDetails] = useState({
    name: "",
    image: "",
    category: "crafts",
    new_price: "",
    old_price: "",
    s_stock: 0,
    m_stock: 0,
    l_stock: 0,
    xl_stock: 0,
    stock: 0,
    description: "",
  });
  //const [addedProduct, setAddedProduct] = useState(null); // State to store added product details

  const computeTotalStock = () => {
    const { s_stock, m_stock, l_stock, xl_stock } = productDetails;
    return s_stock + m_stock + l_stock + xl_stock;
  };

  useEffect(() => {
    setProductDetails((prevDetails) => ({
      ...prevDetails,
      stock: computeTotalStock(),
    }));
  }, [
    productDetails.s_stock,
    productDetails.m_stock,
    productDetails.l_stock,
    productDetails.xl_stock,
  ]);

  const [errors, setErrors] = useState({
    old_price: "",
    new_price: "",
    tags: "",
  });

  const imageHandler = (e) => {
    setImage(e.target.files[0]);
  };

  const changeHandler = (e) => {
    const { name, value } = e.target;

    // Handle numeric stock fields
    if (["s_stock", "m_stock", "l_stock", "xl_stock"].includes(name)) {
      if (!/^\d*$/.test(value)) {
        return; // Only allow numeric input
      }
      setProductDetails((prevDetails) => ({
        ...prevDetails,
        [name]: value === "" ? "" : parseInt(value) || 0, // Allow empty input
      }));
    } else if (name === "old_price" || name === "new_price") {
      if (!/^\d*\.?\d*$/.test(value)) {
        setErrors({
          ...errors,
          [name]: "Price must be a number",
        });
      } else {
        setErrors({
          ...errors,
          [name]: "",
        });
      }
      setProductDetails((prevDetails) => ({
        ...prevDetails,
        [name]: value,
      }));
    } else if (name === "tags") {
      const tags = value
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag !== "");
      if (tags.length > 5) {
        setErrors({
          ...errors,
          tags: "Maximum 5 tags allowed",
        });
        setProductDetails((prevDetails) => ({
          ...prevDetails,
          [name]: value.substring(0, value.lastIndexOf(",")),
        }));
      } else {
        setErrors({
          ...errors,
          tags: "",
        });
        setProductDetails((prevDetails) => ({
          ...prevDetails,
          [name]: value,
        }));
      }
    } else {
      setProductDetails((prevDetails) => ({
        ...prevDetails,
        [name]: value,
      }));
    }
    // Validate that the offer price is not higher than the original price
    if (
      name === "new_price" &&
      value &&
      parseFloat(value) >= parseFloat(productDetails.old_price)
    ) {
      setErrors({
        ...errors,
        new_price: "Offer price must be lower than the original price",
      });
    } else if (
      name === "old_price" &&
      value &&
      parseFloat(productDetails.new_price) >= parseFloat(value)
    ) {
      setErrors({
        ...errors,
        new_price: "Offer price must be lower than the original price",
      });
    } else if (name === "new_price" && !/^\d*\.?\d*$/.test(value)) {
      setErrors({
        ...errors,
        new_price: "Offer price must be a number",
      });
    } else {
      setErrors({
        ...errors,
        new_price: "",
      });
    }
  };

  const Add_Product = async () => {
    const {
      name,
      description,
      old_price,
      new_price,
      s_stock,
      m_stock,
      l_stock,
      xl_stock,
      category,
      tags
    } = productDetails;

    if (
      !name ||
      !description ||
      !old_price ||
      !new_price ||
      (!s_stock && s_stock !== 0) ||
      (!m_stock && m_stock !== 0) ||
      (!l_stock && l_stock !== 0) ||
      (!xl_stock && xl_stock !== 0) ||
      !image ||
      !category ||
      !tags
    ) {
      toast.error("Please fill in all fields.", { position: "top-left" });
      return;
    }
    
    if (errors.old_price || errors.new_price || errors.tags) {
      toast.error("Please fix the errors before submitting", {
        position: "top-left",
      });
      return;
    }
  
    // Validate that the offer price is not higher than the original price
    if (
      parseFloat(productDetails.new_price) >=
      parseFloat(productDetails.old_price)
    ) {
      toast.error("Offer price must be lower than the original price", {
        position: "top-left",
      });
      return;
    }
  
    console.log(productDetails);
    let responseData;
    let product = productDetails;
  
    let formData = new FormData();
    formData.append("product", image);
  
    await fetch("https://ip-tienda-han-backend.onrender.com/upload", {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: formData,
    })
      .then((resp) => resp.json())
      .then((data) => {
        responseData = data;
      });
  
    if (responseData.success) {
      // Construct the image URL using the correct format
      product.image = responseData.image_url; 
      console.log(product);
      await fetch("https://ip-tienda-han-backend.onrender.com/addproduct", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(product),
      })
        .then((resp) => resp.json())
        .then((data) => {
          if (data.success) {
            toast.success("Product Added", { position: "top-left" });
            setProductDetails({
              name: "",
              image: "",
              category: "crafts",
              new_price: "",
              old_price: "",
              s_stock: 0,
              m_stock: 0,
              l_stock: 0,
              xl_stock: 0,
              stock: "",
              description: "",
              tags: "",
            });
            setImage(null); // Clear image
          }
           else {
            toast.error("Failed", {
              position: "top-left",
            });
          }
        });
    }
  };
  

  return (
    <div className="add-product">
      <div className="addproduct-itemfield">
        <h3>Add Product</h3>
        <p>Product Title</p>
        <input
          value={productDetails.name}
          onChange={changeHandler}
          type="text"
          name="name"
          placeholder="Type Here"
        />
      </div>
      <div className="addproduct-description">
        <p>Product Description</p>
        <textarea
          name="description"
          rows="6"
          placeholder="Write description here"
          value={productDetails.description} // Bind to state
          onChange={changeHandler}
          required
        ></textarea>
      </div>
      <div className="addproduct-price">
        <div className="addproduct-itemfield">
          <p>Market Value Price</p>
          <input
            value={productDetails.old_price}
            onChange={changeHandler}
            type="text"
            name="old_price"
            placeholder="Type Here"
            onInput={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, '')} // Prevent non-numeric input
          />
          {errors.old_price && (
            <span className="error-text">{errors.old_price}</span>
          )}
        </div>
        <div className="addproduct-itemfield">
          <p>Seller Offer Price</p>
          <input
            value={productDetails.new_price}
            onChange={changeHandler}
            type="text"
            name="new_price"
            placeholder="Type Here"
            onInput={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, '')}
          />
          {errors.new_price && (
            <span className="error-text">{errors.new_price}</span>
          )}
        </div>
      </div>
      <div className="addproduct-price">
        <div className="addproduct-itemfield">
          <div className="size-stock">
            <p>Size and stock</p>
            <label>
              Small:{" "}
              <input
                type="number"
                name="s_stock"
                min="0"
                value={productDetails.s_stock} // Bind to state
                onChange={changeHandler}
              ></input>
            </label>
            <label>
              Medium:{" "}
              <input
                type="number"
                name="m_stock"
                min="0"
                value={productDetails.m_stock} // Bind to state
                onChange={changeHandler}
              ></input>
            </label>
            <label>
              Large:{" "}
              <input
                type="number"
                name="l_stock"
                min="0"
                value={productDetails.l_stock} // Bind to state
                onChange={changeHandler}
              ></input>
            </label>
            <label>
              XL:{" "}
              <input
                type="number"
                name="xl_stock"
                min="0"
                value={productDetails.xl_stock} // Bind to state
                onChange={changeHandler}
              ></input>
            </label>
          </div>
        </div>
        <div className="addproduct-itemfield">
          <p>Product Category</p>
          <select
            value={productDetails.category}
            onChange={changeHandler}
            name="category"
            className="add-product-selector"
          >
            <option value="crafts">Crafts</option>
            <option value="clothes">Clothes</option>
            <option value="food">Food</option>
          </select>
        </div>
      </div>

      <div className="addproduct-price">
        <div className="addproduct-itemfield">
          <p>Product Tags (separate by commas, max 5)</p>
          <input
            type="text"
            name="tags"
            value={productDetails.tags}
            placeholder="Type Here"
            onChange={changeHandler}
          />
          {errors.tags && <span className="error-text">{errors.tags}</span>}
          <div className="tags-container">
            {productDetails.tags &&
              productDetails.tags.split(",").map((tag, index) => (
                <div key={index} className="tag-box">
                  <span className="tag">{tag.trim()}</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      <div className="addproduct-itemfield">
        <label htmlFor="file-input">
          <img
            src={image ? URL.createObjectURL(image) : upload_area}
            className="addproduct-thumbnail-img"
            alt=""
          />
        </label>
        <input
          onChange={imageHandler}
          type="file"
          name="image"
          id="file-input"
          hidden
        />
      </div>

      <button onClick={Add_Product} className="addproduct-btn">
        ADD
      </button>
    </div>
  );
};

export default AddProduct;
