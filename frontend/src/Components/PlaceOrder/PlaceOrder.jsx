import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../../Context/ShopContext";
import "./PlaceOrder.css";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  regions,
  provincesByCode,
  cities,
  barangays,
} from "select-philippines-address";

const generateReferenceNumber = () => {
  return `REF-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
};

const getUserIdFromToken = () => {
  const authToken = localStorage.getItem("auth-token");
  if (authToken) {
    const payload = JSON.parse(atob(authToken.split(".")[1]));
    return payload.user.id;
  }
  return null;
};

const MAIN_OFFICE_COORDINATES = {
  latitude: 15.4866, // ASKI Building latitude
  longitude: 120.9730, // ASKI Building longitude
};

export const PlaceOrder = () => {
  const { getTotalCartAmount, all_product, cartItems, clearCart } =
    useContext(ShopContext);
  const token = localStorage.getItem("auth-token");
  const navigate = useNavigate();
  const location = useLocation();
  const { itemDetails } = location.state || {};
  const [transactionId, setTransactionId] = useState(null);
  const [markupValue, setMarkupValue] = useState(0);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(""); // To track selected payment method
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
    size: "",
    provinceCode: "",
    provinces: [],
  });

  const [deliveryFee, setDeliveryFee] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:4000/api/users",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const allUsersData = response.data;
        const loggedInUserId = localStorage.getItem("userId");
  
        const loggedInUser = allUsersData.find(
          (user) => user._id === loggedInUserId
        );
  
        if (loggedInUser) {
          const {
            barangay,
            municipality,
            province,
            region,
            street,
            zip,
            country,
          } = loggedInUser.address || {};
  
          const barangayName = municipality ? await barangays(municipality) : [];
          const cityData = province ? await cities(province) : [];
          const provincesData = region ? await provincesByCode(region) : [];
  
          const selectedBarangay =
            barangayName.find((b) => b.brgy_code === barangay)?.brgy_name || "";
          const selectedCity =
            cityData.find((c) => c.city_code === municipality)?.city_name || "";
          const selectedProvince =
            provincesData.find((p) => p.province_code === province)
              ?.province_name || "";
  
          const userData = {
            firstName: loggedInUser.name?.split(" ")[0] || "",
            lastName: loggedInUser.name?.split(" ")[1] || "",
            email: loggedInUser.email || "",
            street: street || "",
            barangay: selectedBarangay || "",
            city: selectedCity || "",
            state: selectedProvince || "",
            zipcode: zip || "",
            country: country || "Philippines",
            phone: loggedInUser.phone || "",
          };
  
          console.log("Fetched User Data:", userData);
          setData(userData);
          localStorage.setItem("userData", JSON.stringify(userData));
        } else {
          console.error("Logged-in user not found.");
          toast.error("Error fetching logged-in user's data.");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Error fetching user data.");
      }
    };
  
    const fetchProvinceData = async () => {
      try {
        const regionCode = "some-region-code"; // Ensure regionCode is dynamically fetched
        const provincesData = await provincesByCode(regionCode);
  
        if (provincesData) {
          setData((prevData) => ({ ...prevData, provinces: provincesData }));
          console.log("Provinces Data:", provincesData);
        } else {
          console.error("No provinces data found for region:", regionCode);
        }
      } catch (error) {
        console.error("Error fetching province data:", error);
      }
    };
  
    if (token) {
      fetchUserData();
      fetchProvinceData();
    } else {
      toast.error("Please log in to proceed.");
      navigate("/login");
    }
  }, [token, navigate]);
  
  const fetchCoordinates = async (address) => {
    const apiKey = process.env.REACT_APP_POSITION_STACK_API_KEY;
    console.log("Position Stack API Key:", apiKey);
    const url = `https://api.positionstack.com/v1/forward?access_key=48ceab57881e0d4b21c7d7c68d31d792&query=${address}`;

    try {
      const response = await axios.get(url);
      return {
        latitude: response.data.data[0].latitude,
        longitude: response.data.data[0].longitude,
      };
    } catch (error) {
      console.error("Error fetching coordinates:", error);
      toast.error("Error fetching coordinates.");
      return null;
    }
  };

  const calculateDeliveryFee = async () => {
    const customerAddress = `${data.street}, ${data.city}`;
    const coordinates = await fetchCoordinates(customerAddress);

    if (coordinates) {
      const distanceKm = getDistanceFromLatLonInKm(
        MAIN_OFFICE_COORDINATES.latitude,
        MAIN_OFFICE_COORDINATES.longitude,
        coordinates.latitude,
        coordinates.longitude
      );

      const distanceMiles = distanceKm * 0.621371;

      const isSameRegion =
        data.state === "Nueva Ecija" || data.region === "Region III";

      let baseFee = isSameRegion ? 20 : 40;
      let feePerMile = isSameRegion ? 2 : 3;

      let totalFee = baseFee + feePerMile * Math.ceil(distanceMiles);

      const maxDeliveryFee = isSameRegion ? 100 : 200;
      totalFee = totalFee > maxDeliveryFee ? maxDeliveryFee : totalFee;

      setDeliveryFee(totalFee);
    }
  };

  const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = degreesToRadians(lat2 - lat1);
    const dLon = degreesToRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(degreesToRadians(lat1)) *
        Math.cos(degreesToRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  const degreesToRadians = (degrees) => {
    return degrees * (Math.PI / 180);
  };

  useEffect(() => {
    if (data.street && data.city) {
      calculateDeliveryFee();
    }
  }, [data.street, data.city]);

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData((prevData) => ({ ...prevData, [name]: value }));
  };

  const togglePaymentOptions = (e) => {
    e.preventDefault();
    
    // Validate address information before showing payment options
    if (!data.street || !data.city || !data.state || !data.zipcode) {
      toast.error("Please provide your complete address to proceed with checkout.");
      return;
    }
    
    if (!token) {
      toast.error("You are not logged in. Please log in to proceed.");
      navigate("/login");
      return;
    }
    
    setShowPaymentOptions(!showPaymentOptions);
  };

  const handlePaymentSelection = (method) => {
    setPaymentMethod(method);
    
    if (method === "cod") {
      processCashOnDelivery();
    } else if (method === "acash") {
      redirectToACashPayment();
    } else if (method === "paymongo") {
      redirectToPaymongoCheckout();
    }
    
    setShowPaymentOptions(false);
  };

  const processCashOnDelivery = async () => {
    try {
      const userId = getUserIdFromToken() || localStorage.getItem("userId");
      const referenceNumber = generateReferenceNumber();
      
      // Format phone number with country code if needed
      const formattedPhone = data.phone.startsWith("+")
        ? data.phone
        : `+63${data.phone.startsWith("0") ? data.phone.substring(1) : data.phone}`;
  
      // Format complete address including barangay
      const formattedAddress = `${data.street}, ${data.barangay || data.city}, ${data.city || data.state}, ${data.state}, ${data.zipcode}, ${data.country}`;
  
      // Calculate total amount
      const totalAmount = getTotalCartAmount() + deliveryFee;
  
      // Prepare order items and calculate total markup value
      const orderItems = itemDetails.map(item => {
        const product = all_product.find(p => p.id === item.id);
        return {
          productId: item.id,
          name: item.name,
          price: item.price || item.adjustedPrice,
          quantity: item.quantity,
          size: item.size || "N/A",
          markup_value: product?.markup_value || 0
        };
      });
  
      // Calculate total markup value from orderItems
      const totalMarkupValue = orderItems.reduce(
        (sum, item) => sum + (item.markup_value || 0) * item.quantity,
        0
      );
  
      const deliveryComm = deliveryFee * 0.2;
      const riderId = localStorage.getItem("riderId") || "unassigned";
  
      const transactionData = {
        transactionId: referenceNumber,
        date: new Date(),
        name: `${data.firstName} ${data.lastName}`,
        contact: formattedPhone,
        email: data.email,
        item: orderItems.map((item) => item.name).join(", "),
        quantity: orderItems.reduce((sum, item) => sum + item.quantity, 0),
        amount: totalAmount,
        deliveryFee: deliveryFee,
        address: formattedAddress,
        status: "Pending",
        userId: userId,
        riderId: riderId,
        markupValue: totalMarkupValue,
        deliveryComm: deliveryComm,
        paymentMethod: "Cash on Delivery"
      };
  
      console.log("Sending transaction data:", transactionData);
  
      // Save transaction details to the backend
      const response = await axios.post(
        "http://localhost:4000/api/transactions",
        transactionData
      );
  
      console.log("Transaction saved successfully:", response.data);
  
      // Update stock information
      await axios.post("http://localhost:4000/api/updateStock", {
        updates: orderItems.map((item) => ({
          id: item.productId.toString(),
          size: item.size,
          quantity: item.quantity,
        })),
      });
  
      console.log("Clearing cart...");
      clearCart();
      console.log("Cart cleared");
  
      toast.success("Order successfully placed!");
      navigate("/myorders");
    } catch (error) {
      console.error("Error processing Cash on Delivery order:", error);
      
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
  
        if (error.response.data && error.response.data.errors) {
          const errorFields = Object.keys(error.response.data.errors).join(", ");
          toast.error(`Missing required fields: ${errorFields}. Please contact support.`);
        } else {
          toast.error(`Failed to process order: ${error.response.data.message || "Server error"}`);
        }
      } else if (error.request) {
        console.error("Error request:", error.request);
        toast.error("Failed to connect to server. Please check your connection.");
      } else {
        toast.error(`Error: ${error.message}`);
      }
    }
  };

  const redirectToACashPayment = async () => {
    try {
      const referenceNumber = generateReferenceNumber();
      const cartDetails = itemDetails.map((item) => {
        const product = all_product.find((p) => p.id === item.id);
        return {
          id: item.id,
          name: item.name,
          price: item.price || item.adjustedPrice,
          quantity: item.quantity,
          size: item.size,
          markup_value: product?.markup_value || 0,
        };
      });
      
      // Store data for after payment completion
      localStorage.setItem("referenceNumber", referenceNumber);
      localStorage.setItem("cartDetails", JSON.stringify(cartDetails));
      localStorage.setItem("deliveryFee", deliveryFee);
      localStorage.setItem("userData", JSON.stringify(data));
      localStorage.setItem("paymentMethod", "acash");
      
      // Redirect to ACash payment gateway
      // Replace with actual ACash payment URL
      window.location.href = "http://localhost:3000/acash-payment?amount=" + 
        (getTotalCartAmount() + deliveryFee) + "&reference=" + referenceNumber;
      
      toast.success("Redirecting to ACash payment gateway...");
    } catch (error) {
      console.error("Error redirecting to ACash:", error);
      toast.error("Failed to process ACash payment. Please try again.");
    }
  };

  const redirectToPaymongoCheckout = async () => {
    try {
      const referenceNumber = generateReferenceNumber();
      const cartDetails = itemDetails.map((item) => {
        const product = all_product.find((p) => p.id === item.id);
        return {
          id: item.id,
          name: item.name,
          price: item.price || item.adjustedPrice,
          quantity: item.quantity,
          size: item.size,
          markup_value: product?.markup_value || 0,
        };
      });
    
      const paymongoUrl = "https://api.paymongo.com/v1";
      const secretKey = process.env.REACT_APP_PAYMONGO_SECRET_KEY;
      console.log("PayMongo Secret Key:", process.env.REACT_APP_PAYMONGO_SECRET_KEY);

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(`${secretKey}:`)}`,
      };
    
      const totalAmount = (getTotalCartAmount() + deliveryFee) * 100; // Amount in cents
    
      const deliveryFeeItem = {
        name: "Delivery Fee",
        description: "Delivery to your address",
        amount: deliveryFee * 100, // Convert to cents
        quantity: 1,
        currency: "PHP",
      };
    
      const checkoutSessionPayload = {
        data: {
          attributes: {
            amount: totalAmount,
            description: `Payment for Order ${referenceNumber}`,
            currency: "PHP",
            payment_method_types: ["gcash", "grab_pay", "paymaya", "card"],
            livemode: false,
            statement_descriptor: "Tienda",
            success_url: `http://localhost:3000/myorders?message=true`,
            cancel_url: `http://localhost:3000/cart?message=false`,
            metadata: {
              reference_number: referenceNumber,
              delivery_fee: deliveryFee,
            },
            line_items: [
              ...cartDetails.map((item) => ({
                name: item.name,
                description: `Size: ${item.size || "N/A"}`,
                amount: item.price * 100,
                quantity: item.quantity,
                currency: "PHP",
              })),
              deliveryFeeItem,
            ],
          },
        },
      };
    
      const sessionResponse = await axios.post(
        `${paymongoUrl}/checkout_sessions`,
        checkoutSessionPayload,
        { headers }
      );
    
      const checkoutSession = sessionResponse.data.data;
    
      if (checkoutSession.attributes.checkout_url) {
        localStorage.setItem("referenceNumber", referenceNumber);
        localStorage.setItem("cartDetails", JSON.stringify(cartDetails));
        localStorage.setItem("deliveryFee", deliveryFee);
        localStorage.setItem("userData", JSON.stringify(data));
        localStorage.setItem("paymentMethod", "paymongo");
        window.location.href = checkoutSession.attributes.checkout_url;
        toast.success("Redirecting to payment gateway...");
      } else {
        toast.error("Failed to create checkout session. Please try again.");
      }
    } catch (error) {
      console.error("Checkout Error:", error.response || error);
      toast.error("Failed to process payment. Please try again.");
    }
  };

  const handleProceedToCheckout = (event) => {
    event.preventDefault();
    togglePaymentOptions(event);
  };

  useEffect(() => {
    if (getTotalCartAmount() === 0) {
      navigate("/cart");
    }
  }, [navigate, getTotalCartAmount]);


  return (
    <form noValidate onSubmit={handleProceedToCheckout} className="place-order">
      <div className="place-order-left">
        <p className="title">Delivery Information</p>
        <div className="multi-fields">
          <input
            required
            name="firstName"
            onChange={onChangeHandler}
            value={data.firstName}
            type="text"
            placeholder="First Name"
          />
          <input
            required
            name="lastName"
            onChange={onChangeHandler}
            value={data.lastName}
            type="text"
            placeholder="Last Name"
          />
        </div>
        <input
          required
          name="email"
          onChange={onChangeHandler}
          value={data.email}
          type="email"
          placeholder="Email Address"
        />
        <input
          required
          name="street"
          onChange={onChangeHandler}
          value={data.street}
          type="text"
          placeholder="Street"
        />
        <div className="multi-fields">
          <input
            required
            name="city"
            onChange={onChangeHandler}
            value={data.barangay}
            type="text"
            placeholder="City"
          />
          <input
            required
            name="state"
            onChange={onChangeHandler}
            value={data.city}
            type="text"
            placeholder="State"
          />
        </div>
        <div className="multi-fields">
          <input
            required
            name="province"
            onChange={onChangeHandler}
            value={data.state}
            type="text"
            placeholder="Province"
          />
          <input
            required
            name="country"
            onChange={onChangeHandler}
            value={data.country}
            type="text"
            placeholder="Country"
          />
        </div>
        <div className="multi-fields">
          <input
            required
            name="zipcode"
            onChange={onChangeHandler}
            value={data.zipcode}
            type="text"
            placeholder="Zip Code"
          />
          <input
            required
            name="phone"
            onChange={onChangeHandler}
            value={data.phone}
            type="text"
            placeholder="Phone"
          />
        </div>
      </div>
      <div className="place-order-right">
        <div className="cartitems-total">
          <h1>Cart Totals</h1>
          <div>
            <div className="cartitems-total-item">
              <p>Subtotal</p>
              <p>₱{getTotalCartAmount()}</p>
            </div>
            <hr />
            <div className="cartitems-total-item">
              <p>Delivery Fee</p>
              <p> ₱{deliveryFee}</p>
            </div>
            <hr />
            <div className="cartitems-total-item">
              <h3>Total</h3>
              <h3>
                ₱
                {getTotalCartAmount() === 0
                  ? 0
                  : getTotalCartAmount() + deliveryFee}
              </h3>
            </div>
          </div>
          
          <div className="payment-methods-container">
            <button 
              type="submit" 
              className="checkout-button"
            >
              Select Payment Method
            </button>
            
            {showPaymentOptions && (
              <div className="payment-options-dropdown">
                <button 
                  type="button" 
                  onClick={() => handlePaymentSelection("cod")}
                  className="payment-option"
                >
                  Cash on Delivery
                </button>
                <button 
                  type="button" 
                  onClick={() => handlePaymentSelection("acash")}
                  className="payment-option"
                >
                  ACash
                </button>
                <button 
                  type="button" 
                  onClick={() => handlePaymentSelection("paymongo")}
                  className="payment-option"
                >
                  PayMongo
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;