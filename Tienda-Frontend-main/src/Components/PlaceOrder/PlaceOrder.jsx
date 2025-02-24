import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../../Context/ShopContext";
import "./PlaceOrder.css";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom"; // useLocation for URL
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
  latitude: 14.628488, // Sunnymede IT Center latitude
  longitude: 121.03342,
};

export const PlaceOrder = () => {
  const { getTotalCartAmount, all_product, cartItems, clearCart } =
    useContext(ShopContext);
  const token = localStorage.getItem("auth-token");
  const navigate = useNavigate();
  const location = useLocation();
  const { itemDetails } = location.state || {};

  const [transactionId, setTransactionId] = useState(null);
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
    provinceCode: "", // Add a state to hold the selected province code
    provinces: [],
  });

  const [deliveryFee, setDeliveryFee] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          "https://ip-tienda-han-backend.onrender.com/api/users",
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
          } = loggedInUser.address || {}; // Safely access address fields
  
          // Fetch barangay, city, and province names
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
  
          // Log and store userData
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
      fetchUserData(); // Call to fetch user data
      fetchProvinceData(); // Call to fetch province data
    } else {
      toast.error("Please log in to proceed.");
      navigate("/login");
    }
  }, [token, navigate]);
  

  const fetchCoordinates = async (address) => {
    const apiKey = process.env.REACT_APP_POSITION_STACK_API_KEY; // Set this in your .env file
    console.log("Position Stack API Key:", apiKey);
    const url = `https://api.positionstack.com/v1/forward?access_key=1e898dd6e9c8d306350d701870c5e1a8&query=${address}`;

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
        data.state === "Metro Manila" || data.region === "NCR";

      let baseFee = isSameRegion ? 20 : 40; // Lower base fee within NCR
      let feePerMile = isSameRegion ? 2 : 3; // Lower fee per mile within NCR

      let totalFee = baseFee + feePerMile * Math.ceil(distanceMiles);

      const maxDeliveryFee = isSameRegion ? 100 : 200; // Lower cap for same region
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
  const handleProceedToCheckout = async (event) => {
    event.preventDefault();
  
    if (!data.street || !data.city || !data.state || !data.zipcode) {
      toast.error("Please provide your complete address to proceed with checkout.");
      return;
    }
  
    if (!token) {
      toast.error("You are not logged in. Please log in to proceed.");
      navigate("/login");
      return;
    }
  
    const referenceNumber = generateReferenceNumber();
    const cartDetails = itemDetails.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price || item.adjustedPrice,
      quantity: item.quantity,
      size: item.size,
    }));
  
    const paymongoUrl = "https://api.paymongo.com/v1";
    const secretKey = process.env.REACT_APP_PAYMONGO_SECRET_KEY;
    if (!secretKey) {
      toast.error("Payment configuration error. Please contact support.");
      return;
    }
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Basic ${btoa(secretKey)}`,
    };
  
    const totalAmount = (getTotalCartAmount() + deliveryFee) * 100; // Amount in cents
  
    try {
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
            success_url: `https://ip-tienda-han.onrender.com/myorders?message=true`,
            cancel_url: `https://ip-tienda-han.onrender.com/cart?message=false`,
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
        console.log("Storing userData in localStorage:", data);

        localStorage.setItem("referenceNumber", referenceNumber);
        localStorage.setItem("cartDetails", JSON.stringify(cartDetails));
        localStorage.setItem("deliveryFee", deliveryFee);
        localStorage.setItem("userData", JSON.stringify(data));
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
          <button type="submit">PROCEED TO PAYMENT</button>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
