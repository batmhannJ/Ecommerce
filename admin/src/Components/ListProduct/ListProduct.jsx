import React, { useEffect, useState } from 'react';
import './ListProduct.css';
import './modal.css';
import ImageModal from '../ImageModal/ImageModal';

const ListProduct = () => {
  const [allproducts, setAllProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    old_price: '',
    new_price: '',
    category: '',
    s_stock: '',
    m_stock: '',
    l_stock: '',
    xl_stock: '',
    stock: '',
    image: null,
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchInfo = async () => {
    try {
      const res = await fetch('http://localhost:4000/allproducts');
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      const updatedProducts = data.map(product => ({
        ...product,
        image: product.editedImage
          ? `http://localhost:4000/images/${product.editedImage}?t=${new Date().getTime()}`
          : product.image
          ? `http://localhost:4000/images/${product.image}?t=${new Date().getTime()}`
          : null,
      }));
      setAllProducts(updatedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchInfo();
  }, []);

  const remove_product = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const res = await fetch('http://localhost:4000/removeproduct', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id }),
        });
        if (!res.ok) throw new Error("Failed to delete product");
        await fetchInfo();
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedImage(null);
  };

  const handleEdit = (product) => {
    setEditProduct(product);
    setFormData({
      name: product.name || '',
      old_price: product.old_price || '',
      new_price: product.new_price || '',
      category: product.category || '',
      s_stock: product.s_stock || '',
      m_stock: product.m_stock || '',
      l_stock: product.l_stock || '',
      xl_stock: product.xl_stock || '',
      stock: product.stock || '',
      image: product.image || null,
    });
    setIsEditModalOpen(true);
  };

  const updateProduct = async () => {
    if (!formData.name || !formData.old_price || !formData.new_price || !formData.category) {
      alert('Please fill out all required fields.');
      return;
    }

    const computedStock =
      (parseInt(formData.s_stock) || 0) +
      (parseInt(formData.m_stock) || 0) +
      (parseInt(formData.l_stock) || 0) +
      (parseInt(formData.xl_stock) || 0);

    const formDataToSend = new FormData();
    formDataToSend.append('id', editProduct.id);
    formDataToSend.append('name', formData.name);
    formDataToSend.append('old_price', formData.old_price);
    formDataToSend.append('new_price', formData.new_price);
    formDataToSend.append('category', formData.category);
    formDataToSend.append('s_stock', formData.s_stock || 0);
    formDataToSend.append('m_stock', formData.m_stock || 0);
    formDataToSend.append('l_stock', formData.l_stock || 0);
    formDataToSend.append('xl_stock', formData.xl_stock || 0);
    formDataToSend.append('stock', computedStock);
    if (formData.image && typeof formData.image !== 'string') {
      formDataToSend.append('image', formData.image);
    }

    try {
      const response = await fetch('http://localhost:4000/editproduct', {
        method: 'POST',
        body: formDataToSend,
      });
      if (response.ok) {
        setIsEditModalOpen(false);
        setEditProduct(null);
        await fetchInfo();
      } else {
        console.error('Error updating product:', await response.json());
        alert('Failed to update product.');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert('An error occurred while updating the product.');
    }
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditProduct(null);
    setFormData({
      name: '',
      old_price: '',
      new_price: '',
      category: '',
      s_stock: '',
      m_stock: '',
      l_stock: '',
      xl_stock: '',
      stock: '',
      image: null,
    });
  };

  return (
    <div className='list-product'>
      <h3>All Products List</h3>
      <div className="listproduct-allproducts">
        <div className="listproduct-format-main">
          <p>Products</p>
          <p>Title</p>
          <p>Old Price</p>
          <p>New Price</p>
          <p>Category</p>
          <p>Stock</p>
          <p>Action</p>
        </div>
        <hr />
        {allproducts.map((product) => (
          <React.Fragment key={product.id}>
            <div className="listproduct-format">
              <img
                src={product.image}
                alt={product.name}
                className="listproduct-product-icon"
                onClick={() => handleImageClick(product.image)}
              />
              <p>{product.name}</p>
              <p>₱{product.old_price}</p>
              <p>₱{product.new_price}</p>
              <p>{product.category}</p>
              <p>{product.stock}</p>
              <div className="button">
                <button onClick={() => handleEdit(product)} className="edit-button">
                  Edit
                </button>
                <button onClick={() => remove_product(product.id)} className="delete-button">
                  Delete
                </button>
              </div>
            </div>
            <hr />
          </React.Fragment>
        ))}
      </div>

      {modalOpen && <ImageModal imageUrl={selectedImage} onClose={closeModal} />}

      {isEditModalOpen && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-image-sidebar">
              <div className="image-upload-area">
                {formData.image ? (
                  <img
                    src={
                      typeof formData.image === 'string'
                        ? formData.image
                        : URL.createObjectURL(formData.image)
                    }
                    alt="Product"
                  />
                ) : (
                  <span className="image-upload-placeholder">📷</span>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="image-upload-input"
                  onChange={handleFileChange}
                />
              </div>
              <div className="image-upload-label">Click to upload image</div>
            </div>
            <div className="modal-form-section">
              <h2>Edit Product</h2>
              <div className="form-grid">
                <div className="input-group">
                  <label htmlFor="product-name">Product Name</label>
                  <input
                    id="product-name"
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Product Name"
                    autoFocus
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="old-price">Old Price</label>
                  <input
                    id="old-price"
                    type="number"
                    value={formData.old_price}
                    onChange={(e) =>
                      setFormData({ ...formData, old_price: e.target.value })
                    }
                    placeholder="Old Price"
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="new-price">New Price</label>
                  <input
                    id="new-price"
                    type="number"
                    value={formData.new_price}
                    onChange={(e) =>
                      setFormData({ ...formData, new_price: e.target.value })
                    }
                    placeholder="New Price"
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                  >
                    <option value="" disabled>
                      Select Category
                    </option>
                    <option value="crafts">Craft</option>
                    <option value="food">Food</option>
                    <option value="clothes">Clothes</option>
                  </select>
                </div>
                <div className="input-group">
                  <label htmlFor="s-stock">Small Stock</label>
                  <input
                    id="s-stock"
                    type="number"
                    value={formData.s_stock}
                    onChange={(e) =>
                      setFormData({ ...formData, s_stock: e.target.value })
                    }
                    placeholder="Small Stock"
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="m-stock">Medium Stock</label>
                  <input
                    id="m-stock"
                    type="number"
                    value={formData.m_stock}
                    onChange={(e) =>
                      setFormData({ ...formData, m_stock: e.target.value })
                    }
                    placeholder="Medium Stock"
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="l-stock">Large Stock</label>
                  <input
                    id="l-stock"
                    type="number"
                    value={formData.l_stock}
                    onChange={(e) =>
                      setFormData({ ...formData, l_stock: e.target.value })
                    }
                    placeholder="Large Stock"
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="xl-stock">XL Stock</label>
                  <input
                    id="xl-stock"
                    type="number"
                    value={formData.xl_stock}
                    onChange={(e) =>
                      setFormData({ ...formData, xl_stock: e.target.value })
                    }
                    placeholder="XL Stock"
                  />
                </div>
              </div>
              <div className="modal-buttons">
                <button className="update-button" onClick={updateProduct}>
                  Update
                </button>
                <button className="cancel-button" onClick={closeEditModal}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListProduct;