import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "./AddProduct.css";

export const AddProduct = () => {
  const [image, setImage] = useState(null);
  const [thumbnail1, setThumbnail1] = useState(null);
  const [thumbnail2, setThumbnail2] = useState(null);
  const [thumbnail3, setThumbnail3] = useState(null);
  const [gadgetType, setGadgetType] = useState(""); // Phone o Laptop
  const [color, setColor] = useState("");
  const [ram, setRam] = useState("");
  const [rom, setRom] = useState("");
  const [perspectiveImages, setPerspectiveImages] = useState([null, null, null, null, null]);
  const [grams, setGrams] = useState(""); // For food category
  const [productDetails, setProductDetails] = useState({
    name: "",
    image: "",
    thumbnail1: "",
    thumbnail2: "",
    thumbnail3: "",
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

  const thumbnailHandler = (e, thumbnailNumber) => {
    const file = e.target.files[0];
    switch (thumbnailNumber) {
      case 1:
        setThumbnail1(file);
        break;
      case 2:
        setThumbnail2(file);
        break;
      case 3:
        setThumbnail3(file);
        break;
      default:
        break;
    }
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

  const uploadImage = async (file) => {
    if (!file) return null;
    
    let formData = new FormData();
    formData.append("product", file);
    
    try {
      const response = await fetch("http://localhost:4000/upload", {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });
      
      const data = await response.json();
      return data.success ? data.image_url : null;
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
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

    if (parseFloat(new_price) >= parseFloat(old_price)) {
      toast.error("Offer price must be lower than the original price", {
        position: "top-left",
      });
      return;
    }

    // Upload main image and thumbnails
    toast.info("Uploading images...", { position: "top-left" });
    
    const mainImageUrl = await uploadImage(image);
    if (!mainImageUrl) {
      toast.error("Failed to upload main image", { position: "top-left" });
      return;
    }
    
    const thumbnail1Url = await uploadImage(thumbnail1);
    const thumbnail2Url = await uploadImage(thumbnail2);
    const thumbnail3Url = await uploadImage(thumbnail3);
    
    let product = { 
      ...productDetails, 
      grams,
      image: mainImageUrl,
      thumbnail1: thumbnail1Url || "",
      thumbnail2: thumbnail2Url || "",
      thumbnail3: thumbnail3Url || ""
    };

    // Add product to database
    try {
      const response = await fetch("http://localhost:4000/addproduct", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(product),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success("Product Added", { position: "top-left" });
        setProductDetails({
          name: "",
          image: "",
          thumbnail1: "",
          thumbnail2: "",
          thumbnail3: "",
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
        setThumbnail1(null);
        setThumbnail2(null);
        setThumbnail3(null);
        setGrams("");
      } else {
        toast.error("Failed to add product", { position: "top-left" });
      }
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Failed to add product", { position: "top-left" });
    }
  };

  return (
    <div className="add-product">
      <h3>Add Product</h3>
      
      <div className="addproduct-itemfield">
        <p>Product Title</p>
        <input
          value={productDetails.name}
          onChange={changeHandler}
          type="text"
          name="name"
          placeholder="Enter product title"
        />
      </div>
      
      <div className="addproduct-description">
        <p>Product Description</p>
        <textarea
          name="description"
          rows="5"
          placeholder="Enter product description"
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
            placeholder="Enter original price"
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
            placeholder="Enter offer price"
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
            <option value="crafts">Select Category</option>
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
            <p>Stock</p>
            <input
              type="number"
              name="stock"
              value={productDetails.stock}
              onChange={changeHandler}
              placeholder="Enter stock"
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
            placeholder="Enter tags (e.g. electronics, smartphone, accessories)"
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

      <div className="addproduct-images">
        <div className="addproduct-itemfield">
          <p>Main Product Image</p>
          <label htmlFor="file-input" className="addproduct-thumbnail-img">
            {image ? (
              <img
                src={URL.createObjectURL(image)}
                className="file-preview"
                alt="Main product"
              />
            ) : (
              <div className="upload-placeholder">
                <div className="upload-icon">+</div>
                <div className="upload-text">Upload Image</div>
              </div>
            )}
          </label>
          <input
            onChange={imageHandler}
            type="file"
            name="image"
            id="file-input"
            hidden
          />
        </div>

        <div className="addproduct-thumbnails">
          <p>Additional Product Views (Thumbnails)</p>
          <div className="thumbnail-containers">
            {/* Thumbnail 1 */}
            <div className="thumbnail-container">
              <label htmlFor="thumbnail1-input" className="addproduct-thumbnail-img">
                {thumbnail1 ? (
                  <img
                    src={URL.createObjectURL(thumbnail1)}
                    className="file-preview"
                    alt="Thumbnail 1"
                  />
                ) : (
                  <div className="upload-placeholder">
                    <div className="upload-icon">+</div>
                    <div className="upload-text">View 1</div>
                  </div>
                )}
              </label>
              <span>Front View</span>
              <input
                onChange={(e) => thumbnailHandler(e, 1)}
                type="file"
                name="thumbnail1"
                id="thumbnail1-input"
                hidden
              />
            </div>

            {/* Thumbnail 2 */}
            <div className="thumbnail-container">
              <label htmlFor="thumbnail2-input" className="addproduct-thumbnail-img">
                {thumbnail2 ? (
                  <img
                    src={URL.createObjectURL(thumbnail2)}
                    className="file-preview"
                    alt="Thumbnail 2"
                  />
                ) : (
                  <div className="upload-placeholder">
                    <div className="upload-icon">+</div>
                    <div className="upload-text">View 2</div>
                  </div>
                )}
              </label>
              <span>Side View</span>
              <input
                onChange={(e) => thumbnailHandler(e, 2)}
                type="file"
                name="thumbnail2"
                id="thumbnail2-input"
                hidden
              />
            </div>

            {/* Thumbnail 3 */}
            <div className="thumbnail-container">
              <label htmlFor="thumbnail3-input" className="addproduct-thumbnail-img">
                {thumbnail3 ? (
                  <img
                    src={URL.createObjectURL(thumbnail3)}
                    className="file-preview"
                    alt="Thumbnail 3"
                  />
                ) : (
                  <div className="upload-placeholder">
                    <div className="upload-icon">+</div>
                    <div className="upload-text">View 3</div>
                  </div>
                )}
              </label>
              <span>Detail View</span>
              <input
                onChange={(e) => thumbnailHandler(e, 3)}
                type="file"
                name="thumbnail3"
                id="thumbnail3-input"
                hidden
              />
            </div>
          </div>
        </div>
      </div>

      <button onClick={Add_Product} className="addproduct-btn">
        ADD PRODUCT
      </button>
    </div>
  );
};

export default AddProduct;