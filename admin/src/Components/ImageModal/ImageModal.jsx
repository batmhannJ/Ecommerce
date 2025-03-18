import React, { useEffect, useState } from "react";
import "./ImageModal.css";

function ImageModal({ imageUrl, onClose }) {
  const [active, setActive] = useState(false);
  
  // Set active state after component mounts to trigger animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setActive(true);
    }, 10);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleClose = () => {
    setActive(false);
    setTimeout(onClose, 300); // Wait for animation to complete before unmounting
  };

  return (
    <div className={`image-modal-overlay ${active ? 'active' : ''}`} onClick={handleClose}>
      <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
        <span className="close-button" onClick={handleClose}>&times;</span>
        <img src={imageUrl} alt="Enlarged view" />
      </div>
    </div>
  );
}

export default ImageModal;