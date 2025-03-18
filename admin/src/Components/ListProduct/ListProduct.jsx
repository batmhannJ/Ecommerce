import React, { useEffect, useState } from 'react';
import './ListProduct.css';
import remove_icon from '../../assets/remove_icon.png';
import ImageModal from '../ImageModal/ImageModal'; // Make sure to import the ImageModal component

const ListProduct = () => {
  const [allproducts, setAllProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchInfo = async () => {
    try {
      const res = await fetch('http://localhost:4000/allproducts');
      if (!res.ok) {
        throw new Error("Failed to fetch products");
      }
      const data = await res.json();
      
      // Construct the full image URL for each product
      const updatedProducts = data.map(product => ({
        ...product,
        image: product.editedImage ? `http://localhost:4000/images/${product.editedImage}` : 
                (product.image ? `http://localhost:4000/images/${product.image}` : null) // Use the main image if no edited image
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
      await fetch('http://localhost:4000/removeproduct', {
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

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
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
        <p>Remove</p>
      </div>
      <div className="listproduct-allproducts">
        <hr />
        {allproducts.map((product) => (
          <React.Fragment key={product.id}>
            <div className="listproduct-format-main listproduct-format">
              <img 
                src={product.image} 
                alt={product.name} 
                className="listproduct-product-icon zoomable-image" 
                onClick={() => handleImageClick(product.image)}
                style={{ 
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease',
                  transformOrigin: 'center center'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              />
              <p>{product.name}</p>
              <p>₱{product.old_price}</p>
              <p>₱{product.new_price}</p>
              <p>{product.category}</p>
              <p>{product.stock}</p>
              <img 
                onClick={() => { remove_product(product.id) }} 
                className='listproduct-remove-icon' 
                src={remove_icon} 
                alt="Remove" 
              />
            </div>
            <hr />
          </React.Fragment>
        ))}
      </div>

      {modalOpen && (
        <ImageModal
          imageUrl={selectedImage}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default ListProduct;