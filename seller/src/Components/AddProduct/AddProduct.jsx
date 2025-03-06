import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "./AddProduct.css";
import upload_area from "../../assets/upload_area.png";

export const AddProduct = () => {
  const [image, setImage] = useState(null);
  const [gadgetType, setGadgetType] = useState(""); // Phone o Laptop
  const [color, setColor] = useState("");
  const [ram, setRam] = useState("");
  const [rom, setRom] = useState("");
  const [grams, setGrams] = useState(""); // For food category
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
    sellerId: "",
  });

  const getUserIdFromToken = () => {
    const authToken = localStorage.getItem("admin_token");
    if (authToken) {
      try {
        const payload = JSON.parse(atob(authToken.split(".")[1]));
        return payload.id;
      } catch (error) {
        console.error("Error decoding token:", error);
        return null;
      }
    }
    return null;
  };

  useEffect(() => {
    const sellerId = getUserIdFromToken();
    if (sellerId) {
      setProductDetails((prevDetails) => ({
        ...prevDetails,
        sellerId,
      }));
    } else {
      toast.error("Failed to retrieve seller ID. Please log in again.", { position: "top-left" });
    }
  }, []);

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

    if (["s_stock", "m_stock", "l_stock", "xl_stock"].includes(name)) {
      if (!/^\d*$/.test(value)) return;
      setProductDetails((prevDetails) => ({
        ...prevDetails,
        [name]: value === "" ? "" : parseInt(value) || 0,
      }));
    } else if (name === "old_price" || name === "new_price") {
      if (!/^\d*\.?\d*$/.test(value)) {
        setErrors({ ...errors, [name]: "Price must be a number" });
      } else {
        setErrors({ ...errors, [name]: "" });
      }
      setProductDetails((prevDetails) => ({
        ...prevDetails,
        [name]: value,
      }));
    } else if (name === "tags") {
      const tags = value.split(",").map((tag) => tag.trim()).filter((tag) => tag !== "");
      if (tags.length > 5) {
        setErrors({ ...errors, tags: "Maximum 5 tags allowed" });
        setProductDetails((prevDetails) => ({
          ...prevDetails,
          [name]: value.substring(0, value.lastIndexOf(",")),
        }));
      } else {
        setErrors({ ...errors, tags: "" });
        setProductDetails((prevDetails) => ({
          ...prevDetails,
          [name]: value,
        }));
      }
    } else if (name === "grams") {
      setGrams(value);
    } else {
      setProductDetails((prevDetails) => ({
        ...prevDetails,
        [name]: value,
      }));
    }

    if (name === "category") {
      setProductDetails((prev) => ({
        ...prev,
        [name]: value,
        s_stock: 0,
        m_stock: 0,
        l_stock: 0,
        xl_stock: 0,
        stock: 0,
      }));
      setGadgetType("");
      setColor("");
      setRam("");
      setRom("");
      setGrams("");
    } else if (["gadgetType", "color", "ram", "rom"].includes(name)) {
      if (name === "gadgetType") setGadgetType(value);
      if (name === "color") setColor(value);
      if (name === "ram") setRam(value);
      if (name === "rom") setRom(value);
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
      stock,
      sellerId,
      category,
      tags,
    } = productDetails;

    if (
      !name ||
      !description ||
      !old_price ||
      !new_price ||
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

    if (category === "gadgets" && (!gadgetType || !color || !ram || !rom || productDetails.stock <= 0)) {
      toast.error("Please fill in all gadget details.", { position: "top-left" });
      return;
    }

    if (category === "food" && !grams) {
      toast.error("Please specify the grams for food items.", { position: "top-left" });
      return;
    }

    if (parseFloat(new_price) >= parseFloat(old_price)) {
      toast.error("Offer price must be lower than the original price", {
        position: "top-left",
      });
      return;
    }

    let responseData;
    let product = { ...productDetails, grams };

    let formData = new FormData();
    formData.append("product", image);

    await fetch("http://localhost:4000/upload", {
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
      product.image = responseData.image_url;
      await fetch("http://localhost:4000/addproduct", {
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
              stock: 0,
              description: "",
              tags: "",
              sellerId,
            });
            setImage(null);
            setGrams("");
          } else {
            toast.error("Failed", { position: "top-left" });
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
          value={productDetails.description}
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
            onInput={(e) => (e.target.value = e.target.value.replace(/[^0-9]/g, ""))}
          />
          {errors.old_price && <span className="error-text">{errors.old_price}</span>}
        </div>
        <div className="addproduct-itemfield">
          <p>Seller Offer Price</p>
          <input
            value={productDetails.new_price}
            onChange={changeHandler}
            type="text"
            name="new_price"
            placeholder="Type Here"
            onInput={(e) => (e.target.value = e.target.value.replace(/[^0-9]/g, ""))}
          />
          {errors.new_price && <span className="error-text">{errors.new_price}</span>}
        </div>
      </div>
      <div className="addproduct-price">
        <div className="addproduct-itemfield">
          <p>Product Category</p>
          <select
            value={productDetails.category}
            onChange={changeHandler}
            name="category"
            className="add-product-selector"
          >
            {/*<option value="crafts">Crafts</option>*/}
            <option value="gadgets">Gadgets</option>
            <option value="clothes">Clothes</option>
            <option value="food">Food</option>
          </select>
        </div>

        {/* Conditional rendering based on category */}
        {productDetails.category === "gadgets" && (
          <>
            <div className="addproduct-itemfield">
              <p>Gadget Type</p>
              <select name="gadgetType" value={gadgetType} onChange={changeHandler}>
                <option value="">Select</option>
                <option value="phone">Phone</option>
                <option value="laptop">Laptop</option>
              </select>
            </div>
            <div className="addproduct-itemfield">
              <p>Color</p>
              <input type="text" name="color" value={color} onChange={changeHandler} placeholder="e.g. Black, Blue"/>
            </div>
            <div className="addproduct-itemfield">
              <p>RAM</p>
              <input type="text" name="ram" value={ram} onChange={changeHandler} placeholder="e.g. 8GB, 16GB"/>
            </div>
            <div className="addproduct-itemfield">
              <p>ROM</p>
              <input type="text" name="rom" value={rom} onChange={changeHandler} placeholder="e.g. 128GB, 512GB"/>
            </div>
            <div className="addproduct-itemfield">
              <p>Overall Stock</p>
              <input type="number" name="stock" value={productDetails.stock} onChange={changeHandler}/>
            </div>
          </>
        )}

        {productDetails.category === "clothes" && (
          <div className="addproduct-itemfield">
            <div className="size-stock">
              <p>Size and stock</p>
              <label>
                Small:{" "}
                <input
                  type="number"
                  name="s_stock"
                  min="0"
                  value={productDetails.s_stock}
                  onChange={changeHandler}
                />
              </label>
              <label>
                Medium:{" "}
                <input
                  type="number"
                  name="m_stock"
                  min="0"
                  value={productDetails.m_stock}
                  onChange={changeHandler}
                />
              </label>
              <label>
                Large:{" "}
                <input
                  type="number"
                  name="l_stock"
                  min="0"
                  value={productDetails.l_stock}
                  onChange={changeHandler}
                />
              </label>
              <label>
                XL:{" "}
                <input
                  type="number"
                  name="xl_stock"
                  min="0"
                  value={productDetails.xl_stock}
                  onChange={changeHandler}
                />
              </label>
            </div>
          </div>
        )}

        {productDetails.category === "food" && (
          <div className="addproduct-itemfield">
            <p>Grams</p>
            <input
              type="text"
              name="grams"
              value={grams}
              onChange={changeHandler}
              placeholder="e.g. 500g, 1kg"
            />
          </div>
        )}
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