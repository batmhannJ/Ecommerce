import React, { useEffect, useState } from 'react';
import './ListProduct.css';
import './modal.css';

export const ListProduct = () => {
  const [allproducts, setAllProducts] = useState([]);
  const [editProduct, setEditProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '', old_price: '', new_price: '', category: '', s_stock: '', m_stock: '', l_stock: '', xl_stock: '', stock: '', image: null
  });
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility state

  const fetchInfo = async () => {
    const res = await fetch('https://ip-tienda-han-backend.onrender.com/allproducts');
    const data = await res.json();
    console.log('Fetched data:', data); // Check what is returned

    // Append a timestamp query to force image refresh
  const updatedProducts = data.map(product => ({
    ...product,
    image: product.image ? `https://ip-tienda-han-backend.onrender.com/images/${product.image}?t=${new Date().getTime()}` : null
  }));
  console.log('Fetched products with updated images:', updatedProducts); // Log the updated products

    setAllProducts(updatedProducts);
  };
  
  const fetchAllProducts = async () => {
    try {
      const response = await fetch("https://ip-tienda-han-backend.onrender.com/allproducts");
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const allProducts = await response.json();
      
      // Construct the full image URL for each product
      const updatedProducts = allProducts.map(product => ({
        ...product,
        image: product.image ? `https://ip-tienda-han-backend.onrender.com/images/${product.image}?t=${new Date().getTime()}` : null
      }));

      return updatedProducts;
    } catch (error) {
      console.error("Error fetching products:", error);
      return [];
    }
  };

  useEffect(() => {
    fetchInfo();
  }, []);

  const remove_product = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      await fetch('https://ip-tienda-han-backend.onrender.com/removeproduct', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id })
      });
      await fetchInfo();
    }
  };

  const handleEdit = (product) => {
    console.log('Editing product ID:', product._id); // I-log ang ID ng product
  
    setEditProduct(product);
    setFormData({
      name: product.name,
      old_price: product.old_price,
      new_price: product.new_price,
      category: product.category,
      s_stock: product.s_stock || '',
      m_stock: product.m_stock || '',
      l_stock: product.l_stock || '',
      xl_stock: product.xl_stock || '',
      image: product.image || null
    });
    setIsModalOpen(true);
  };

  const updateProduct = async () => {
    // Validate form data
    if (!formData.name || !formData.old_price || !formData.new_price || !formData.category) {
      alert('Please fill out all required fields.');
      return;
    }

    const computedStock = (parseInt(formData.s_stock) || 0) +
      (parseInt(formData.m_stock) || 0) +
      (parseInt(formData.l_stock) || 0) +
      (parseInt(formData.xl_stock) || 0);
  
    const formDataToSend = new FormData();
    formDataToSend.append('_id', editProduct._id);
    formDataToSend.append('name', formData.name);
    formDataToSend.append('old_price', formData.old_price);
    formDataToSend.append('new_price', formData.new_price);
    formDataToSend.append('category', formData.category);
    formDataToSend.append('s_stock', formData.s_stock);
    formDataToSend.append('m_stock', formData.m_stock);
    formDataToSend.append('l_stock', formData.l_stock);
    formDataToSend.append('xl_stock', formData.xl_stock);
    formDataToSend.append('stock', computedStock);
  
    // Assuming formData.image is a file input (HTML input type="file")
    if (formData.image) {
      formDataToSend.append('image', formData.image);
    }
  
    const response = await fetch('https://ip-tienda-han-backend.onrender.com/editproduct', {
      method: 'POST',
      body: formDataToSend, // No need for 'Content-Type', fetch will handle it automatically
    });
  
    const data = await response.json();
    console.log('Response from server:', data);
  
    if (!response.ok) {
      console.error('Error updating product:', data.message);
    } else {
      setIsModalOpen(false);
      await fetchInfo();
      const updatedProducts = await fetchAllProducts(); // Fetch updated products after edit
      setAllProducts(updatedProducts); // Update state with the new products
    }
  };

  // Close modal when clicking outside of it
  const closeModal = (e) => {
    if (e.target.className === 'modal-overlay') {
      setIsModalOpen(false);
    }
  };

const handleFileChange = (e) => {
  const file = e.target.files[0];
  console.log('Selected file:', file); // Check if the file is selected
  setFormData({ ...formData, image: file });
};

  return (
    <div className='list-product'>
      <h3>All Products List</h3>
      <div className="listproduct-format-main">
        <p>Products</p>
        <p>Title</p>
        <p>Old Price</p>
        <p>New Price</p>
        <p>Category</p>
        <p>Stock</p>
        <p>Action</p>
      </div>
      <div className="listproduct-allproducts">
        <hr />
        {allproducts.map((product) => (
          <React.Fragment key={product.id}>
            <div className="listproduct-format-main listproduct-format">
              <img src={product.image} alt={product.name} className="listproduct-product-icon" />
              <p>{product.name}</p>
              <p>₱{product.old_price}</p>
              <p>₱{product.new_price}</p>
              <p>{product.category}</p>
              <p>{product.stock}</p>
              <div class="button">
              <button onClick={() => handleEdit(product)} className="edit-button">Edit</button>
              <button onClick={() => remove_product(product.id)} className='delete-button'>
                Delete
              </button>
              </div>
            </div>
            <hr />
          </React.Fragment>
        ))}
      </div>

      {/* Modal for Editing Product */}
{isModalOpen && (
  <div className="modal-overlay" onClick={closeModal}>
    <div className="edit-form">
      <h2>Edit Product</h2>

      <div className="input-group">
        <label htmlFor="product-name">Product Name</label>
        <input
          id="product-name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
          onChange={(e) => setFormData({ ...formData, old_price: e.target.value })}
          placeholder="Old Price"
        />
      </div>

      <div className="input-group">
        <label htmlFor="new-price">New Price</label>
        <input
          id="new-price"
          type="number"
          value={formData.new_price}
          onChange={(e) => setFormData({ ...formData, new_price: e.target.value })}
          placeholder="New Price"
        />
      </div>

      <div className="input-group">
        <label htmlFor="category">Category</label>
        <select
          id="category"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        >
          <option value="" disabled>Select Category</option>
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
          onChange={(e) => setFormData({ ...formData, s_stock: e.target.value || 0})}
          placeholder="Small Stock"
        />
      </div>

      <div className="input-group">
        <label htmlFor="m-stock">Medium Stock</label>
        <input
          id="m-stock"
          type="number"
          value={formData.m_stock}
          onChange={(e) => setFormData({ ...formData, m_stock: e.target.value || 0})}
          placeholder="Medium Stock"
        />
      </div>

      <div className="input-group">
        <label htmlFor="l-stock">Large Stock</label>
        <input
          id="l-stock"
          type="number"
          value={formData.l_stock}
          onChange={(e) => setFormData({ ...formData, l_stock: e.target.value || 0})}
          placeholder="Large Stock"
        />
      </div>

      <div className="input-group">
        <label htmlFor="xl-stock">XL Stock</label>
        <input
          id="xl-stock"
          type="number"
          value={formData.xl_stock}
          onChange={(e) => setFormData({ ...formData, xl_stock: e.target.value || 0})}
          placeholder="XL Stock"
        />
      </div>

      {/* Image input field */}
      <div className="input-group">
        <label htmlFor="image">Product Image</label>
        <input type="file" id="image" name="image" onChange={handleFileChange} />
      </div>

      <button className="update-button" onClick={updateProduct}>Update</button>
<button
  className="cancel-button"
  onClick={() => {
    setEditProduct(null);
    setIsModalOpen(false); // Close the modal when canceling
  }} >
  Cancel
</button>

    </div>
  </div>
)}
    </div>
  );
};

export default ListProduct;