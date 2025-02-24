import React, { createContext, useEffect, useState } from "react";
import axios from "axios";
export const ShopContext = createContext(null);

const getDefaultCart = () => {
  let cart = {};
  for (let index = 0; index < 300 + 1; index++) {
    cart[index] = { quantity: 0, size: "", price: 0 };
  }
  return cart;
};

const ShopContextProvider = (props) => {
  const [all_product, setAll_Product] = useState([]);
  const [cartItems, setCartItems] = useState(getDefaultCart());
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [users, setUser] = useState(null);

  const saveCartToDatabase = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      console.error("No user ID found in local storage. Cannot save cart.");
      return;
    }

    try {
      await axios.post("https://tienda-backend-au3t.onrender.com/api/cart", {
        userId,
        cartItems, // Ensure this reflects the updated cart items
      });
      console.log("Cart saved to database successfully.");
    } catch (error) {
      console.error("Error saving cart to database:", error);
    }
  };

  const calculateDeliveryFee = (distance) => {
    // Example logic for delivery fee
    const baseFee = 50; // Base delivery fee
    const perKmRate = 10; // Rate per kilometer
    const fee = baseFee + perKmRate * distance;
    setDeliveryFee(fee);
  };

  const getUserDetails = async () => {
    const token = localStorage.getItem("auth-token");
    if (token) {
      try {
        const response = await axios.get("/api/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
        return response.data; // Return user data
      } catch (error) {
        console.error("Error fetching user details:", error);
        return null; // Handle error accordingly
      }
    }
    return null; // If no token, return null
  };

  // Fetch cart for the specific user
  useEffect(() => {
    const authToken = localStorage.getItem("auth-token");
    const storedUserId = localStorage.getItem("userId");

    if (authToken && storedUserId) {
      setUserId(storedUserId); // Set the userId in state
      fetchCartItems(storedUserId);
    }
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      const products = await fetchAllProducts();
      setAll_Product(products);
    };

    fetchProducts();

    const authToken = localStorage.getItem("auth-token");
    if (authToken) {
      fetch("https://ip-tienda-han-backend.onrender.com/getcart", {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `${authToken}`,
          "Content-Type": "application/json",
        },
        body: "",
      })
        .then((response) => response.json())
        .then((data) => setCartItems(data));
    }
  }, []);

  const fetchAllProducts = async () => {
    try {
      const response = await fetch("https://ip-tienda-han-backend.onrender.com/allproducts");
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const allProducts = await response.json();

      // Construct the full image URL for each product
      const updatedProducts = allProducts.map((product) => {
        // Determine which image to display: edited or main
        const mainImage = product.image
          ? `https://ip-tienda-han-backend.onrender.com/images/${product.image}`
          : null;
        const editedImage = product.editedImage
          ? `https://ip-tienda-han-backend.onrender.com/images/${product.editedImage}`
          : null; // Assuming editedImage is stored in the product object

        // Choose the edited image if it exists; otherwise, use the main image
        const imageToDisplay = editedImage || mainImage;

        return {
          ...product,
          image: imageToDisplay, // Set the selected image
        };
      });

      return updatedProducts;
    } catch (error) {
      console.error("Error fetching products:", error);
      return [];
    }
  };

  const prepareOrderItems = async (cartItems) => {
    const allProducts = await fetchAllProducts();
    console.log("Cart Items:", cartItems); // Debugging line
    console.log("All Products:", allProducts); // Debugging line

    let orderItems = [];
    allProducts.forEach((item) => {
      if (cartItems[item._id] && cartItems[item._id].quantity > 0) {
        let itemInfo = { ...item };
        itemInfo["quantity"] = cartItems[item._id].quantity;
        itemInfo["size"] = cartItems[item._id].size;
        itemInfo["price"] = cartItems[item._id].price;
        orderItems.push(itemInfo);
      }
    });
    console.log("Order Items:", orderItems);
    return orderItems;
  };

  // Function to fetch cart items for a specific user
  const fetchCartItems = async (userId) => {
    try {
      const response = await axios.get(
        `https://ip-tienda-han-backend.onrender.com/api/cart/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
          },
        }
      );
      setCartItems(response.data.cartItems); // Assuming the API returns cartItems in response
    } catch (error) {
      console.error("Error fetching cart items:", error);
    }
  };

  const addToCart = async (
    productId,
    selectedSize,
    adjustedPrice,
    quantity
  ) => {
    const userId = localStorage.getItem("userId"); // Make sure userId exists
    if (!userId) {
      console.error("No user ID found in local storage. Cannot add to cart.");
      return;
    }

    // First, get the existing cart
    try {
      const response = await axios.get(
        `https://ip-tienda-han-backend.onrender.com/api/cart/${userId}`
      );
      const existingCart = response.data.cartItems;

      // Check if the product with the selected size already exists
      const existingItemIndex = existingCart.findIndex(
        (item) => item.productId === productId && item.size === selectedSize
      );

      if (existingItemIndex !== -1) {
        // Item exists, update the quantity
        existingCart[existingItemIndex].quantity += quantity;
      } else {
        // Item doesn't exist, add new item
        existingCart.push({
          productId,
          selectedSize: selectedSize, // Adjusted this line
          adjustedPrice: adjustedPrice,
          quantity,
        });
      }

      // Send the updated cart back to the server
      await axios.post("https://ip-tienda-han-backend.onrender.com/api/cart", {
        userId,
        cartItems: existingCart,
      });
      console.log("Cart updated successfully in frontend"); // Debugging
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.warn("Cart not found, creating a new one.");
        // Create a new cart if it doesn't exist
        await axios.post("https://ip-tienda-han-backend.onrender.com/api/cart", {
          userId,
          cartItems: [
            {
              productId,
              selectedSize: selectedSize,
              adjustedPrice: adjustedPrice,
              quantity,
            },
          ],
        });
      } else {
        console.error("Error fetching/updating cart in frontend:", error);
      }
    }
  };

  const updateQuantity = (key, newQuantity) => {
    setCartItems((prevItems) => {
      return {
        ...prevItems,
        [key]: {
          ...prevItems[key],
          quantity: newQuantity,
        },
      };
    });
  };

  const removeFromCart = async (productId, selectedSize) => {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      console.error("No user ID found.");
      return;
    }

    try {
      // Remove the item from cart (local state)
      setCartItems((prevItems) =>
        prevItems.filter(
          (item) =>
            !(
              item.productId === Number(productId) &&
              item.selectedSize === selectedSize
            )
        )
      );

      // Send DELETE request to backend
      await axios.delete(
        `https://ip-tienda-han-backend.onrender.com/api/cart/${userId}/${productId}?selectedSize=${selectedSize}`
      );

      // Refetch the cart to ensure consistency
      const response = await axios.get(
        `https://ip-tienda-han-backend.onrender.com/api/cart/${userId}`
      );
      setCartItems(response.data.cartItems);
    } catch (error) {
      console.error("Error removing item from cart:", error);
    }
  };

  const clearCart = async () => {
    try {
      const userId = localStorage.getItem("userId"); // Retrieve user ID
      if (!userId) {
        console.error("User ID is missing. Cannot clear cart.");
        return;
      }
  
      // Call backend API to clear cart items in the database
      await axios.delete(`https://ip-tienda-han-backend.onrender.com/api/cart/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
      });
  
      // Clear cart items in the context state
      setCartItems({});
  
      // Remove cart details from local storage
      localStorage.removeItem("cartDetails");
      console.log("Cart cleared successfully.");
    } catch (error) {
      console.error("Error clearing cart:", error);
      //toast.error("Failed to clear cart. Please try again.");
    }
  };
  
  const increaseItemQuantity = async (productId, selectedSize) => {
    const userId = localStorage.getItem("userId");
  
    if (!userId) {
      console.error("No user ID found. Cannot increase item quantity.");
      return;
    }
  
    const key = `${productId}_${selectedSize || "N/A"}`; // Handle undefined size
    console.log("Increasing quantity for item with key:", key);
    console.log("Cart Items:", cartItems);
  
    const itemIndex = cartItems.findIndex((item) => {
      return (
        item.productId === Number(productId) &&
        item.selectedSize.toUpperCase() === selectedSize.toUpperCase()
      );
    });
  
    if (itemIndex !== -1) {
      const currentItem = cartItems[itemIndex];
  
      try {
        const response = await axios.get(`https://ip-tienda-han-backend.onrender.com/api/products/${productId}`);
        const productData = response.data;
  
        if (productData && productData[`${selectedSize.toLowerCase()}_stock`] !== undefined) {
          const availableStock = productData[`${selectedSize.toLowerCase()}_stock`];
  
          if (currentItem.quantity < availableStock) {
            setCartItems((prevItems) => {
              return prevItems.map((cartItem, index) => {
                if (index === itemIndex) {
                  return { ...cartItem, quantity: cartItem.quantity + 1 }; // Update quantity in the local state
                }
                return cartItem;
              });
            });
  
            // After state update, get the updated quantity from state
            const updatedItem = cartItems[itemIndex]; // It might be updated already
            const updatedQuantity = updatedItem.quantity;
  
            // Update the quantity in the database
            try {
              const updateResponse = await axios.patch(
                `https://ip-tienda-han-backend.onrender.com/api/cart/${userId}/${productId}?selectedSize=${selectedSize}`,
                { quantity: updatedQuantity }
              );
              console.log("Cart updated in database successfully:", updateResponse.data);
            } catch (error) {
              console.error("Error updating cart in database:", error.response ? error.response.data : error.message);
            }
          } else {
            alert(`You can't add more than available stock (${availableStock}).`);
          }
        } else {
          console.error(`Stock for size "${selectedSize}" not found in product data.`);
        }
      } catch (error) {
        console.error("Error fetching product data:", error.response ? error.response.data : error.message);
      }
    } else {
      console.error("Item not found in cart:", key);
    }
  };
  

const decreaseItemQuantity = async (productId, selectedSize) => {
  const userId = localStorage.getItem('userId');

  // Check if userId exists
  if (!userId) {
    console.error('No user ID found. Cannot decrease item quantity.');
    return;
  }

  const key = `${productId}_${selectedSize || 'N/A'}`; // Handle undefined size
  console.log("Decreasing quantity for item with key:", key);
  console.log("Cart Items:", cartItems);

  // Find the index of the item to update based on productId and selectedSize
  const itemIndex = cartItems.findIndex(item => {
    return item.productId === Number(productId) && item.selectedSize.toUpperCase() === selectedSize.toUpperCase();
  });

  // If the item is found, decrease the quantity
  if (itemIndex !== -1) {
    const currentQuantity = cartItems[itemIndex].quantity;

    // Only decrease the quantity if it's greater than 1, otherwise remove the item
    if (currentQuantity > 1) {
      // Update the local state to decrease the quantity
      setCartItems(prevItems => {
        return prevItems.map((cartItem, index) => {
          if (index === itemIndex) {
            return { ...cartItem, quantity: cartItem.quantity - 1 }; // Decrease the quantity
          }
          return cartItem;
        });
      });

      // Update the database
      try {
        const updatedQuantity = currentQuantity - 1; // New quantity to update in the database
        const response = await axios.patch(`https://ip-tienda-han-backend.onrender.com/api/cart/${userId}/${productId}?selectedSize=${selectedSize}`, { quantity: updatedQuantity });
        console.log("Cart updated in database successfully:", response.data);
      } catch (error) {
        console.error("Error updating cart in database:", error.response ? error.response.data : error.message);
      }
    } else {
      // Remove the item if the quantity reaches 1 and user wants to decrease it
      setCartItems(prevItems => prevItems.filter((_, index) => index !== itemIndex));

      // Remove item from the database
      try {
        const response = await axios.delete(`https://ip-tienda-han-backend.onrender.com/api/cart/${userId}/${productId}?selectedSize=${selectedSize}`);
        console.log("Item removed from cart in database successfully:", response.data);
      } catch (error) {
        console.error("Error removing item from cart in database:", error.response ? error.response.data : error.message);
      }
    }
  } else {
    console.error('Item not found in cart:', key);
  }
};


  
  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
      if (cartItems[item].quantity > 0) {
        totalAmount += cartItems[item].adjustedPrice * cartItems[item].quantity;
      }
    }
    return totalAmount;
  };

  const getTotalCartItems = () => {
    let totalItem = 0;
    for (const item in cartItems) {
      if (cartItems[item].quantity > 0) {
        totalItem += cartItems[item].quantity;
      }
    }
    return totalItem;
  };

  const [userId, setUserId] = useState(localStorage.getItem("userId")); // Initialize from localStorage

  const contextValue = {
    getTotalCartAmount,
    getTotalCartItems,
    deliveryFee, // Add delivery fee to context
    all_product,
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    prepareOrderItems,
    calculateDeliveryFee,
    getUserDetails,
    users,
    userId,
    setUserId,
    setCartItems,
    saveCartToDatabase,
    clearCart,
    decreaseItemQuantity,
    increaseItemQuantity
  };

  return (
    <ShopContext.Provider value={contextValue}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
