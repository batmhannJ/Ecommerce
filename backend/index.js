const port = 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const path = require("path");
const cors = require("cors");
const multer = require("multer");
const socketIo = require("socket.io"); 
const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");
const helmet = require("helmet");
const server = require("http").createServer(app);

// import routes
const superAdminRoutes = require("./routes/superAdminRoute");
const adminRoutes = require("./routes/adminRoute");
const orderRouter = require("./routes/orderRoute");
const sellerRouter = require("./routes/sellerRoute");
const userRoutes = require("./routes/userRoute");
const transactionRoutes = require("./routes/transactionRoute");
const productRoute = require("./routes/productRoute");
const cartRoute = require("./routes/cartRoute");
const riderRoutes = require('./routes/riderRoute');
const shopRoutes = require('./routes/shopRoute');
const commissionRoutes = require('./routes/commissionRoute');
const { signup } = require("./controllers/sellerController");
const { getUsers } = require("./controllers/userController");
const { searchAdmin } = require("./controllers/adminController");
const { getCartWithProductDetails } = require("./controllers/cartController"); // Adjust path as necessary

const { ObjectId } = require('mongodb');

require("dotenv").config();

const mongoURI = process.env.MONGODB_URI;

const sendEmail = async (to, subject, text) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        reject(error);
      } else {
        console.log("Email sent:", info.response);
        resolve(info.response);
      }
    });
  });
};
const allowedOrigins = [  
  'http://localhost:3000', 
  'http://localhost:28429',
  'http://localhost:5173', 
  'http://localhost:5174', 
  'http://localhost:46631',
  'http://localhost:47106',
  'http://localhost:4000',
  'http://localhost:5175',
  'http://localhost:51549',
  'http://localhost:60375',
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "DELETE", "PATCH", "PUT"], // Allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization", "xx-token"], // Headers needed for requests
    exposedHeaders: ["Content-Length", "X-Foo", "X-Bar"], // Expose additional headers if needed
    credentials: true, // Allow cookies or credentials in the request
  })
);
app.use(express.json());
app.use("/api/transactions", transactionRoutes);
app.use("/api", productRoute);
app.use("/api/cart", cartRoute);
app.use((req, res, next) => {
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");

  res.setHeader("Referrer-Policy", "no-referrer");

  res.setHeader("X-Content-Type-Options", "nosniff");

  res.setHeader("X-Frame-Options", "SAMEORIGIN");

  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  );

  next();
});

mongoose
  .connect(mongoURI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.get("/", (req, res) => {
  res.send("Express App is Running");
});

app.get("/api/transactions", (req, res) => {
  res.json({ message: "This is the transactions endpoint" });
});
app.get('/api/users/search', getUsers);
app.get('/api/admin/search', searchAdmin);


app.listen(port, (error) => {
  if (!error) {
    console.log("Server Running on Port: " + port);
  } else {
    console.log("Error: " + error);
  }
});

const storage = multer.diskStorage({
  destination: "./upload/images",
  filename: (req, file, cb) => {
    return cb(
      null,
      `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({ storage: storage });

app.use((req, res, next) => {
  //console.log(`${req.method} ${req.path} - Preflight Check`);

  res.header('Access-Control-Allow-Origin', '*'); 
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS'); 
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization'); 

  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    return res.status(200).json({}); 
  }

  next();
});


app.use(
  "/upload",
  express.static(path.join(__dirname, "upload"), {
    setHeaders: (res) => {
      res.set("Access-Control-Allow-Origin", "*"); 
      res.set("Content-Security-Policy", "default-src 'self'; img-src * data: blob:;");
    },
  })
);

app.use("/images", express.static("upload/images", {
  setHeaders: (res) => {
    res.set("Access-Control-Allow-Origin", "*"); 
    console.log("Headers set for image request:", res.getHeaders());
  }
}));
app.use('/upload', express.static('upload'));
app.use('/upload/images', express.static('upload/images'));



app.post("/upload", upload.single("product"), (req, res) => {
  res.json({
    success: 1,
    image_url: req.file.filename,
  });
});

app.post("/api/signup", upload.single("idPicture"), signup);

const CartItems = require("./models/orderedItemsModel");

const Product = require("./models/productModels");

const { authMiddleware: fetchUser } = require("./middleware/auth");

const Users = require("./models/userModels");
const Admin = require("./models/adminUserModel");
const Rider = require("./models/riderModel");
const Seller = require("./models/sellerModels");
const Cart = require('./models/cartModel'); 

const Transaction = require("./models/transactionModel");

app.use("/api/order", orderRouter);

app.use("/api/seller", sellerRouter);

app.get("/users", async (req, res) => {
  try {
    const users = await Users.find({});
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

//app.post("/api/ordered-items", orderedItemsRouter);
//app.get("/getPaidItems", orderedItemsRouter);
/*app.get("/getOrderedItemsById/:id", async (req, res) => {
  try {
    const orders = await Order.find({});
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});*/
//change password api

app.post("/updatepassword/:id", async (req, res) => {
  const { id } = req.params;
  const { password: password } = req.body;

  const user = await Users.findByIdAndUpdate(id, password);
  console.log(id);
  console.log(password);
  user.password = password;
  await user.save();
});

app.get("/fetchuser/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const user = await Users.findById(id);
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});
app.post("/addproduct", async (req, res) => {
  let products = await Product.find({});
  let id;

  if (products.length > 0) {
    let last_product_array = products.slice(-1);
    let last_product = last_product_array[0];
    id = last_product.id + 1;
  } else {
    id = 1;
  }

  const {
    name,
    image,
    thumbnail1,
    thumbnail2,
    thumbnail3,
    category,
    new_price,
    old_price,
    s_stock,
    m_stock,
    l_stock,
    xl_stock,
    stock,
    description,
    tags,
    sellerId, // Extract sellerId from request body
  } = req.body;

  if (!sellerId) {
    return res.status(400).json({ success: false, message: "Seller ID is required" });
  }

  const product = new Product({
    id,
    name,
    image,
    thumbnail1,
    thumbnail2,
    thumbnail3,
    category,
    new_price,
    old_price,
    s_stock,
    m_stock,
    l_stock,
    xl_stock,
    stock,
    description,
    tags,
    sellerId, // Save sellerId in database
  });

  await product.save();
  console.log("Product Added:", product);

  res.json({
    success: true,
    message: "Product added successfully!",
    product,
  });

  console.log("Received Product Data:", {
    name,
    image,
    thumbnail1,
    thumbnail2,
    thumbnail3,
    category,
    new_price,
    old_price,
    s_stock,
    m_stock,
    l_stock,
    xl_stock,
    stock,
    description,
    tags,
    sellerId,
  });
});


app.get("/store-products/:sellerId", async (req, res) => {
  const { sellerId } = req.params;

  try {
    const products = await Product.find({ sellerId: sellerId });

    if (!products.length) {
      return res.json([]);
    }
    const updatedProducts = products.map((product) => ({
      ...product,
      image: `http://localhost:4000/upload/images/${product.image}`,
    }));

    console.log("Fetched products from DB:", products);


    res.json(updatedProducts);
  } catch (error) {
    console.error("Error fetching store products:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


// Creating API for deleting Products
app.post("/removeproduct", async (req, res) => {
  const productId = req.body.id;

  try {
    // Delete the product
    await Product.findOneAndDelete({ id: productId });

    // Remove cart items that reference the deleted product
    await Cart.updateMany(
      { "cartItems.productId": productId },
      { $pull: { cartItems: { productId } } }
    );

    console.log("Product and associated cart items removed successfully.");
    res.json({
      success: true,
      name: req.body.name,
    });
  } catch (error) {
    console.error("Error removing product and associated cart items:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove product and associated cart items",
    });
  }
});
// Creating API for getting All Products
app.get("/allproducts", async (req, res) => {
  let products = await Product.find({});
  console.log("All Products Fetched");
  res.send(products);
});

// Creating Endpoint for Registering the user
app.post("/signup", async (req, res) => {
  let check = await Users.findOne({ email: req.body.email });
  if (check) {
    return res
      .status(400)
      .json({ success: false, errors: "Existing User Found" });
  }

  let cart = {};
  for (let i = 0; i < 300; i++) {
    cart[i] = 0;
  }

  const user = new Users({
    name: req.body.username,
    email: req.body.email,
    phone: req.body.phone,
    password: req.body.password,
    cartData: cart,
  });

  // Debugging log
  console.log("User data before saving:", user);

  try {
    await user.save();
  } catch (error) {
    console.error("Error saving user:", error);
    return res
      .status(500)
      .json({ success: false, errors: "Error saving user." });
  }

  const data = { user: { id: user.id } };
  const token = jwt.sign(data, "secret_ecom");
  res.json({ success: true, token });
});

// Creating Endpoint for User Login
app.post("/login", async (req, res) => {
  let user = await Users.findOne({ email: req.body.email });
  if (user) {
    const passCompare = req.body.password === user.password;
    if (passCompare) {
      const data = {
        user: {
          id: user.id,
        },
      };
      const token = jwt.sign(data, "secret_ecom");
      // Ibalik ang user ID kasama ang token
      res.json({ success: true, token, userId: user._id }); // Idagdag ang user ID dito
    } else {
      res.json({ success: false, errors: "Error: Wrong Password" });
    }
  } else {
    res.json({ success: false, errors: "Error: Wrong Email Address" });
  }
});

// Creating Endpoint for NewCollection Data
app.get("/newcollections", async (req, res) => {
  try {
    let products = await Product.find({});
    let newcollection = products.slice(1).slice(-8); // Get the last 8 products after the first one

    // Map through the products to construct the full image URL
    const updatedProducts = newcollection.map(product => {
      // Determine which image to display: edited or main
      const mainImage = product.image ? `http://localhost:4000/images/${product.image}` : null;
      const editedImage = product.editedImage ? `http://localhost:4000/images/${product.editedImage}` : null; // Assuming editedImage is stored in the product object

      // Choose the edited image if it exists; otherwise, use the main image
      const imageToDisplay = editedImage || mainImage;

      return {
        ...product.toObject(), // Convert Mongoose object to plain JavaScript object
        image: imageToDisplay // Set the selected image
      };
    });

    console.log("New Collection Fetched");
    res.send(updatedProducts);
  } catch (error) {
    console.error("Error fetching new collections:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
});


// Creating Endpoint for Popular in Crafts Section
app.get("/popularincrafts", async (req, res) => {
  try {
    let products = await Product.find({ category: "crafts" });
    let popular_in_crafts = products.slice(5, 9);

    // Map through the products to construct the full image URL
    const updatedProducts = popular_in_crafts.map(product => {
      // Determine which image to display: edited or main
      const mainImage = product.image ? `http://localhost:4000/images/${product.image}` : null;
      const editedImage = product.editedImage ? `http://localhost:4000/images/${product.editedImage}` : null; // Assuming editedImage is stored in the product object

      // Choose the edited image if it exists; otherwise, use the main image
      const imageToDisplay = editedImage || mainImage;

      return {
        ...product.toObject(), // Convert Mongoose object to plain JavaScript object
        image: imageToDisplay // Set the selected image
      };
    });

    console.log("Popular in Crafts Fetched");
    res.send(updatedProducts);
  } catch (error) {
    console.error("Error fetching popular products in crafts:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

// Creating Endpoint for adding products in CartData
app.post("/addtocart", fetchUser, async (req, res) => {
  console.log("added", req.body.itemId);
  let userData = await Users.findOne({ _id: req.user.id });
  userData.cartData[req.body.itemId] += 1;
  await Users.findOneAndUpdate(
    { _id: req.user.id },
    { cartData: userData.cartData }
  );
  res.send("Added");
});

// API endpoint to update item quantity
/*app.put('/items/:id', async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  try {
    const updatedItem = await Cart.findOneAndUpdate(
      { id: id }, // find item by id
      { quantity: quantity }, // update quantity
      { new: true } // return the updated document
    );

    if (!updatedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json(updatedItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating item quantity' });
  }
})*/

// Creating Endpoint to remove product from CartData
app.post("/removefromcart", fetchUser, async (req, res) => {
  console.log("removed", req.body.itemId);
  let userData = await Users.findOne({ _id: req.user.id });
  if (userData.cartData[req.body.itemId] > 0)
    userData.cartData[req.body.itemId] -= 1;
  await Users.findOneAndUpdate(
    { _id: req.user.id },
    { cartData: userData.cartData }
  );
  res.send("Removed");
});

// Create Endpoint to get CartData
app.post("/getcart", fetchUser, async (req, res) => {
  console.log("GetCart");
  let userData = await Users.findOne({ _id: req.user.id });
  res.json(userData.cartData);
});

// Corrected endpoint to fetch related products based on category
app.get("/relatedproducts/:category", async (req, res) => {
  const category = req.params.category;
  try {
    const relatedProducts = await Product.find({ category });

    // Map through the related products to construct the full image URL
    const updatedRelatedProducts = relatedProducts.map(product => {
      // Determine which image to display: edited or main
      const mainImage = product.image ? `http://localhost:4000/images/${product.image}` : null;
      const editedImage = product.editedImage ? `http://localhost:4000/images/${product.editedImage}` : null; // Assuming editedImage is stored in the product object

      // Choose the edited image if it exists; otherwise, use the main image
      const imageToDisplay = editedImage || mainImage;

      return {
        ...product.toObject(), // Convert Mongoose object to plain JavaScript object
        image: imageToDisplay // Set the selected image
      };
    });

    console.log("Related Products Fetched");
    res.json(updatedRelatedProducts);
  } catch (error) {
    console.error("Error fetching related products:", error);
    res.status(500).json({ error: "Failed to fetch related products" });
  }
});


let otpStore = {};

// Set up nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail", // Use your email service provider (like Gmail)
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASSWORD, // Your email password
  },
  tls: {
    rejectUnauthorized: false, // Disable SSL certificate validation
  },
});

app.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  console.log("Request Body:", req.body);
  // Check if the email is already used
  let check = await Users.findOne({ email });
  if (check) {
    return res
      .status(400)
      .json({ success: false, errors: "Existing User Found" });
  }

  // Generate OTP
  const otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
  });
  otpStore[email] = otp;

  // Send OTP via email
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is ${otp}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending OTP:", error);
      return res
        .status(500)
        .json({ success: false, errors: "Failed to send OTP" });
    }
    console.log("OTP sent:", info.response);
    res.json({ success: true, message: "OTP sent to your email" });
  });
});

// Endpoint to verify OTP and sign up user
app.post("/verify-otp", async (req, res) => {
  const { email, otp, username, phone, password } = req.body;

  // Check if the OTP is valid
  if (otpStore[email] !== otp) {
    return res.status(400).json({ success: false, errors: "Invalid OTP" });
  }

  // Clear OTP after successful verification
  delete otpStore[email];

  // Create user after OTP is verified
  let cart = {};
  for (let i = 0; i < 300; i++) {
    cart[i] = 0;
  }
  const user = new Users({
    name: username,
    email,
    password,
    phone,
    cartData: cart,
  });

  await user.save();

  const data = {
    user: {
      id: user.id,
    },
  };

  const token = jwt.sign(data, "secret_ecom");
  res.json({ success: true, token });
});

// Function to generate a 6-digit OTP

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // Generates a number between 100000 and 999999
};
// In your Express.js backend
app.post("/forgot-password", async (req, res) => {
  console.log("Forgot Password route hit");
  const { email } = req.body;

  // Check if email exists in your database
  try {
    // Check if email exists in your database
    const user = await Users.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, errors: "User not found." });
    }

    // Generate OTP
    const otp = generateOTP(); // Function to generate OTP
    user.otp = otp; // Save OTP to user record
    await user.save();

    // Send OTP to the user's email
    await sendEmail(user.email, `Your OTP: ${otp}`);

    return res
      .status(200)
      .json({ success: true, message: "OTP sent successfully." });
  } catch (error) {
    console.error("Error processing forgot password request:", error);
    res.status(500).json({ success: false, errors: "Internal server error." });
  }
});

app.post("/verify-otp", async (req, res) => {
  const { email, otp, newPassword } = req.body;

  // Check if the OTP is valid
  if (otpStore[email] !== otp) {
    return res.status(400).json({ success: false, errors: "Invalid OTP" });
  }

  // Clear OTP after successful verification
  delete otpStore[email];

  // Update user password
  try {
    const user = await Users.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, errors: "User not found" });
    }
    user.password = newPassword; // Consider hashing the password before saving
    await user.save();
    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    res
      .status(500)
      .json({ success: false, errors: "Failed to update password" });
  }
});

app.post("/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res
      .status(400)
      .json({ success: false, errors: "Please provide all required fields." });
  }

  try {
    // Find user by email
    const user = await Users.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, errors: "User not found." });
    }

    // Verify OTP (You should implement your own OTP verification logic here)
    if (user.otp !== otp) {
      return res.status(400).json({ success: false, errors: "Invalid OTP." });
    }

    // Update the user's password directly (plain text)
    user.password = newPassword;
    user.otp = null; // Clear OTP after successful reset
    await user.save();

    // Respond with success
    res.json({ success: true, message: "Password successfully reset." });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ success: false, errors: "Server error." });
  }
});

app.get("/transactions/totalAmount", async (req, res) => {
  try {
    const transactions = await Transaction.find({}); // Fetch all transactions

    if (!transactions.length) {
      return res.json(0); // Return 0 if no transactions
    }

    // Calculate the total amount
    const totalAmount = transactions.reduce((total, Transaction) => {
      return total + Transaction.amount; // Assuming 'amount' is a number
    }, 0);

    res.json(totalAmount); // Return total amount
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

const fetchSalesGrowthRateFromDB = async () => {
  // Simulate a database call
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Example data
      const data = [
        { date: "2024-01-01", totalSales: 1000 },
        { date: "2024-01-02", totalSales: 1500 },
        // Add more data here
      ];
      resolve(data);
    }, 1000);
  });
};

app.get("/api/transactions/salesGrowthRate", async (req, res) => {
  try {
    const data = await fetchSalesGrowthRateFromDB();
    res.json(data);
  } catch (error) {
    console.error("Error fetching sales growth rate:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/users/:userId", (req, res) => {
  const userId = req.params.userId;

  Users.findById(userId)
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: "User not found" });
      }
      res.send(user);
    })
    .catch((err) => res.status(500).send({ message: "Error fetching user" }));
});

app.patch("/api/edituser/address", async (req, res) => {
  try {
    const { userId, addressData } = req.body;

    if (!userId || !addressData) {
      return res.status(400).json({ error: "Missing userId or addressData" });
    }

    const updatedUser = await Users.findByIdAndUpdate(
      userId,
      { address: addressData },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res
      .status(200)
      .json({ message: "User updated successfully", data: updatedUser });
  } catch (error) {
    console.error(error); // Log the actual error in your server
    res.status(500).json({ error: "Failed to update user" });
  }
});

// PATCH endpoint to update transaction status
app.patch("/api/transactions/:transactionId", async (req, res) => {
  const { transactionId } = req.params;
  const { status } = req.body; // Destructure status from the request body

  try {
    const updatedTransaction = await Transaction.findOneAndUpdate(
      { transactionId }, // Use transactionId to find the document
      { status }, // Update the status field
      { new: true } // Return the updated document
    );

    if (!updatedTransaction) {
      return res.status(404).send({ message: "Transaction not found" });
    }

    res.send(updatedTransaction);
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error updating transaction status", error });
  }
});
const io = socketIo(server, {
    cors: {
        origin: "*", // Lagyan ng tamang origin kung may frontend ka
        methods: ["GET", "POST"]
    }
});
io.on("connection", (socket) => {
  console.log("New rider connected");

  // When a rider accepts a pending order
  socket.on("acceptOrder", async (data) => {
    const { orderId, riderId } = data;
    
    // Broadcast to all OTHER riders that this order is now accepted
    socket.broadcast.emit("orderAccepted", orderId);
    
    // You would typically update your database here or in the API call
    // from the frontend
    
    // Emit back to the accepting rider to confirm
    socket.emit("orderUpdated", {
      _id: orderId,
      status: "Cart Processing",
      riderId: riderId
    });
  });
  
  socket.on("disconnect", () => {
    console.log("Rider disconnected");
  });
});

app.post('/editproduct', upload.single('image'), async (req, res) => {
  const { _id, name, old_price, new_price, category, s_stock, m_stock, l_stock, xl_stock, stock } = req.body;

  console.log('Received ID:', _id);
  console.log('Received Image File:', req.file); // This should log the file details

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({ success: false, message: 'Invalid product ID' });
  }

  try {
    const objectId = new mongoose.Types.ObjectId(_id);

    const updateData = {
      name,
      old_price,
      new_price,
      category,
      s_stock,
      m_stock,
      l_stock,
      xl_stock,
      stock,
    };

    // If an image file is provided, add its filename or URL to the updateData
    if (req.file) {
      updateData.image = req.file.filename;  // Or store URL based on your storage solution
    }

    const updatedProduct = await Product.findByIdAndUpdate(objectId, updateData, { new: true });

    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ success: false, message: 'Error updating product', error: error.message });
  }
});
//----------------RESET PASSWORD FOR SELLER--------------------//
app.post("/api/seller/forgot-password-seller", async (req, res) => {
  console.log("Forgot Password route hit");
  const { email } = req.body;

  // Check if email exists in your database
  try {
    const user = await Seller.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, errors: "Seller not found." });
    }

    // Generate OTP
    const otp = generateOTP(); // Function to generate OTP

    // Log the generated OTP
    console.log("Generated OTP for email:", email, "is:", otp); 

    user.otp = otp; // Save OTP to user record
    await user.save();

    // Send OTP to the user's email
    await sendEmail(user.email, `Your OTP: ${otp}`);

    return res
      .status(200)
      .json({ success: true, message: "OTP sent successfully." });
  } catch (error) {
    console.error("Error processing forgot password request:", error);
    res.status(500).json({ success: false, errors: "Internal server error." });
  }
});

app.post("/api/seller/verify-otp-seller", async (req, res) => {
  const { email, otp, newPassword } = req.body;

  // Check if the OTP is valid
  if (otpStore[email] !== otp) {
    return res.status(400).json({ success: false, errors: "Invalid OTP" });
  }

  // Clear OTP after successful verification
  delete otpStore[email];

  // Update user password
  try {
    const user = await Seller.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, errors: "User not found" });
    }
    user.password = newPassword; // Consider hashing the password before saving
    await user.save();
    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    res
      .status(500)
      .json({ success: false, errors: "Failed to update password" });
  }
});

app.post("/api/seller/reset-password-seller", async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await Seller.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, errors: "Seller not found." });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ success: false, errors: "Invalid OTP." });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword; // Save the hashed password
    user.otp = null; // Clear OTP after successful reset

    await user.save();

    return res.status(200).json({ success: true, message: "Password updated successfully." });
    navi
  } catch (error) {
    console.error("Error processing reset password request:", error);
    res.status(500).json({ success: false, errors: "Internal server error." });
  }
});
app.post('/cart', async (req, res) => {
  const { userId, cartItems } = req.body;

  // Create an array of cart items based on incoming request
  const itemsToAdd = cartItems.map(item => ({
    productId: item.productId,
    size: item.size,
    price: item.price,
    quantity: item.quantity
  }));

  // Check if a cart exists for the user, if not create one
  let cart = await Cart.findOne({ userId });

  if (!cart) {
    cart = new Cart({ userId, cartItems: itemsToAdd });
  } else {
    // Add new items to the existing cart
    itemsToAdd.forEach(newItem => {
      const existingItemIndex = cart.cartItems.findIndex(existingItem => 
        existingItem.productId === newItem.productId && existingItem.size === newItem.size
      );

      if (existingItemIndex > -1) {
        // If the item already exists, update the quantity
        cart.cartItems[existingItemIndex].quantity += newItem.quantity;
      } else {
        // If it doesn't exist, add the new item
        cart.cartItems.push(newItem);
      }
    });
  }

  try {
    await cart.save();
    res.status(200).json({ message: 'Cart updated successfully' });
  } catch (error) {
    console.error('Error saving cart:', error);
    res.status(500).json({ message: 'Error saving cart', error });
  }
});

app.get('/api/cart/:userId', async (req, res) => {
  const { userId } = req.params;
  console.log("Fetching cart for user:", userId);  // Log the userId being used
  try {
      const cart = await Cart.findOne({ userId });
      if (!cart) {
          return res.status(404).json({ message: "No cart found for this user" });
      }
      res.status(200).json(cart);
  } catch (err) {
      console.error("Error fetching cart:", err);  // Log error details
      res.status(500).json({ message: "Server error", error: err.message });
  }
});

// DELETE item from the cart
app.delete('/api/cart/:userId/:productId', async (req, res) => {
  const { userId, productId } = req.params;
  const selectedSize = req.query.selectedSize;

  console.log(`DELETE request received for user: ${userId}, productId: ${productId}, selectedSize: ${selectedSize}`);

  // Find the user's cart
  const cart = await Cart.findOne({ userId });
  if (!cart) {
      console.log('Cart not found for user:', userId);
      return res.status(404).json({ message: 'Cart not found' });
  }

  console.log('Current cart items:', cart.cartItems);

  // Find the index of the item to be removed
  const itemIndex = cart.cartItems.findIndex(
      item => item.productId === parseInt(productId) && item.selectedSize === selectedSize
  );

  console.log(`Item index for productId ${productId} and selectedSize ${selectedSize}:`, itemIndex);

  // If item not found, return 404
  if (itemIndex === -1) {
      console.log('Item not found in the cart:', { productId, selectedSize });
      return res.status(404).json({ message: 'Item not found in the cart' });
  }

  // Remove the item
  console.log('Removing item:', cart.cartItems[itemIndex]);
  cart.cartItems.splice(itemIndex, 1);
  console.log('Cart items after removal:', cart.cartItems);

  // Save the updated cart to the database
  try {
      await cart.save(); // Ensure this line is present to persist changes
      console.log('Cart saved successfully:', cart.cartItems);
      res.status(200).json({ message: 'Item removed from database successfully' });
  } catch (error) {
      console.error('Error saving cart:', error);
      res.status(500).json({ message: 'Error saving updated cart' });
  }
});

app.patch('/api/cart/:userId/:productId', async (req, res) => {
  try {
    const { userId, productId } = req.params; // Extracting userId and productId from the URL params
    const { selectedSize } = req.query; // Extracting selectedSize from the query parameters

    // Find the cart for this user and update the quantity of the selected product
    const cart = await Cart.findOneAndUpdate(
      { userId, "cartItems.productId": productId, "cartItems.selectedSize": selectedSize },
      {
        $inc: { "cartItems.$.quantity": 1 } // Increment the quantity of the selected product
      },
      { new: true } // Return the updated cart
    );

    if (!cart) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    res.status(200).json(cart);
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


app.get('/api/users/search', async (req, res) => {
  const searchTerm = req.query.term;
  
  try {
    const users = await Users.find({
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } }, // case-insensitive search
        { email: { $regex: searchTerm, $options: 'i' } }
      ]
    });
    res.json(users);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Error fetching user" });
  }
});

app.get('/api/products/:productId', async (req, res) => {
  try {
    const productId = req.params.productId;
    // Find the product in the database by ID
    const product = await Product.findOne({ id: productId });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(product); // Send product data as response
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete("/api/cart/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    await Cart.deleteMany({ userId }); // Assuming your cart items are stored by userId
    res.status(200).json({ message: "Cart cleared successfully." });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ error: "Failed to clear cart." });
  }
});

app.get("/partner-stores", async (req, res) => {
  try {
    const approvedSellers = await Seller.find({ isApproved: true }, "shopName idPicture businessLocation");

    const updatedSellers = approvedSellers.map((seller) => {
      return {
        ...seller.toObject(),
        idPicture: seller.idPicture
          ? `http://localhost:4000/upload/${seller.idPicture}`
          : null,
      };
    });

    console.log("Partner Stores Fetched");
    res.json(updatedSellers);
  } catch (error) {
    console.error("Error fetching partner stores:", error);
    res.status(500).json({ error: "Failed to fetch partner stores" });
  }
});

app.delete("/api/products/:id", async (req, res) => {
  try {
      const productId = req.params.id;
      
      // Delete product from Products collection
      await Product.findByIdAndDelete(productId);

      // Delete related cart items
      await Cart.deleteMany({ productId });

      res.status(200).json({ message: "Product and related cart items deleted successfully" });
  } catch (error) {
      res.status(500).json({ message: "Error deleting product", error });
  }
});


app.get('/api/page', async (req, res) => {
    console.log("Shop route accessed");
    console.log("SHOP ROUTEEEEEE");

    try {
        const { municipality } = req.query;

        if (!municipality) {
            return res.status(400).json({ error: "Municipality parameter is required" });
        }

        console.log("Searching for shops in:", municipality);
        
        // Use regex for partial match instead of exact match
        const sellers = await Seller.find({
            businessLocation: { $regex: municipality, $options: 'i' },  // Case-insensitive partial match
            isApproved: true
        }).select('shopName businessLocation idPicture rating reviewCount minOrder freeDeliveryMinimum');

        console.log(`Found ${sellers.length} approved shops matching "${municipality}"`);
        
        res.json(sellers);
    } catch (error) {
        console.error("Error fetching shops:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


app.get("/api/markup-values", async (req, res) => {
  try {
    // Kunin muna lahat ng transactions para i-check kung may data
    const transactions = await Transaction.find({});
    if (!transactions || transactions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No transactions found in the database",
      });
    }

    // Sum ng markupValue, gamit ang $ifNull para i-default sa 0 kung wala
    const markupAggregation = await Transaction.aggregate([
      {
        $group: {
          _id: null, // Walang grouping per field, kunin lang lahat
          totalMarkupValue: {
            $sum: { $ifNull: ["$markupValue", 0] }, // Default sa 0 kung missing ang markupValue
          },
        },
      },
    ]);

    const totalMarkupValue = markupAggregation[0]?.totalMarkupValue || 0;

    // Kunin ang mga detalye ng markup, i-default din sa 0 kung wala
    const markupDetails = transactions.map((trans) => ({
      productName: trans.item || "Unknown Product",
      markup_value: trans.markupValue || 0, // Default sa 0 kung wala
      occurrences: 1, // Simple count; pwede i-adjust kung may quantity field
      subtotal: trans.markupValue || 0, // Default sa 0 kung wala
    }));

    res.json({
      success: true,
      totalMarkupValue,
      markupDetails,
    });
  } catch (error) {
    console.error("Error in /markup-values endpoint:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

app.get("/api/delivery-comm", async (req, res) => {
  try {
    const transactions = await Transaction.find({});
    if (!transactions || transactions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No transactions found in the database",
      });
    }

    // Sum ng deliveryComm
    const aggregation = await Transaction.aggregate([
      {
        $group: {
          _id: null,
          totalDeliveryComm: { $sum: { $ifNull: ["$deliveryComm", 0] } }, // Default sa 0 kung wala
        },
      },
    ]);

    const totalDeliveryComm = aggregation[0]?.totalDeliveryComm || 0;

    res.json({
      success: true,
      totalDeliveryComm,
    });
  } catch (error) {
    console.error("Error in /delivery-comm endpoint:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

app.get("/api/monthly-commissions", async (req, res) => {
  try {
    const transactions = await Transaction.find({});
    if (!transactions || transactions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No transactions found in the database",
      });
    }

    // Aggregate monthly totals
    const monthlyAggregation = await Transaction.aggregate([
      {
        $group: {
          _id: {
            month: { $month: "$date" }, // Group by month
            year: { $year: "$date" },   // Include year to avoid mixing data across years
          },
          seller: { $sum: { $ifNull: ["$markupValue", 0] } },   // Total markupValue per month
          rider: { $sum: { $ifNull: ["$deliveryComm", 0] } },   // Total deliveryComm per month
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }, // Sort by year and month
      },
    ]);

    // Map to readable format
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    const monthlyRevenue = monthlyAggregation.map((item) => ({
      month: monthNames[item._id.month - 1], // Convert month number to name
      seller: item.seller,
      rider: item.rider,
    }));

    res.json({
      success: true,
      monthlyRevenue,
    });
  } catch (error) {
    console.error("Error in /monthly-commissions endpoint:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});
app.post("/api/login-role", async (req, res) => {
  console.log("Login request received:", req.body);
  const { email, password } = req.body;

  if (!email || !password) {
    console.log("Missing email or password in request");
    return res.status(400).json({ success: false, errors: "Email and password are required" });
  }

  try {
    // Check Users table
    console.log("Checking Users table for email:", email);
    let user = await Users.findOne({ email });
    if (user) {
      console.log("User found in Users table:", user._id);
      if (password === user.password) {
        const data = {
          user: {
            id: user.id,
            role_id: 1 // Users table
          }
        };
        const token = jwt.sign(data, "secret_ecom");
        console.log("Login successful for user:", user._id, "Role ID: 1");
        return res.json({ 
          success: true, 
          token, 
          userId: user._id,
          roleId: 1,
          firstName: user.name.split(' ')[0],
          lastName: user.name.split(' ').slice(1).join(' '),
          phone: user.phone
        });
      }
      console.log("Password mismatch for user:", user._id);
      return res.json({ success: false, errors: "Error: Wrong Password" });
    }

    // Check Admins table
    console.log("Checking Admins table for email:", email);
    let admin = await Admin.findOne({ email });
    if (admin) {
      console.log("User found in Admins table:", admin._id);
      if (password === admin.password) {
        const data = {
          user: {
            id: admin.id,
            role_id: 2 // Admins table
          }
        };
        const token = jwt.sign(data, "secret_ecom");
        console.log("Login successful for admin:", admin._id, "Role ID: 2");
        return res.json({ 
          success: true, 
          token, 
          userId: admin._id,
          roleId: 2,
          firstName: user.name.split(' ')[0],
          lastName: user.name.split(' ').slice(1).join(' '),
          phone: user.phone
        });
      }
      console.log("Password mismatch for admin:", admin._id);
      return res.json({ success: false, errors: "Error: Wrong Password" });
    }

    // Check Riders table
    console.log("Checking Riders table for email:", email);
    let rider = await Rider.findOne({ email });
    if (rider) {
      console.log("User found in Riders table:", rider._id);
      if (password === rider.password) {
        const data = {
          user: {
            id: rider.id,
            role_id: 3 // Riders table
          }
        };
        const token = jwt.sign(data, "secret_ecom");
        console.log("Login successful for rider:", rider._id, "Role ID: 3");
        return res.json({ 
          success: true, 
          token, 
          userId: rider._id,
          roleId: 3,
          firstName: user.name.split(' ')[0],
          lastName: user.name.split(' ').slice(1).join(' '),
          phone: user.contactNumber
        });
      }
      console.log("Password mismatch for rider:", rider._id);
      return res.json({ success: false, errors: "Error: Wrong Password" });
    }

    // If no match found in any table
    console.log("No user found with email:", email);
    res.status(404).json({ success: false, errors: "Error: Wrong Email Address" });
    
  } catch (error) {
    console.error("Server error during login:", error);
    res.status(500).json({ success: false, errors: "Server Error" });
  }
});

app.get("/api/renew-token-login", async (req, res) => {
  console.log("Renew token request received");

  // Get the token from the xx-token header
  const token = req.headers['xx-token'];

  if (!token) {
    console.log("No token provided in xx-token header");
    return res.status(401).json({ success: false, errors: "No token provided" });
  }

  try {
    // Verify the existing token
    const decoded = jwt.verify(token, "secret_ecom");
    console.log("Token verified, decoded:", decoded);

    // Extract user data from the decoded token
    const userData = decoded.user;

    // Generate a new token with the same user data
    const newToken = jwt.sign({ user: userData }, "secret_ecom", {
      expiresIn: '1h', // Set a new expiration time (e.g., 1 hour)
    });

    console.log("New token generated:", newToken);
    res.json({
      success: true,
      token: newToken,
      userId: userData.id,
      roleId: userData.role_id,
    });
  } catch (error) {
    console.error("Error verifying token:", error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, errors: "Token expired" });
    }
    return res.status(401).json({ success: false, errors: "Invalid token" });
  }
});


//======================== M O B I L E ==================================//

// API to send OTP
app.post('/send-otp-mobile', (req, res) => {
  const { email } = req.body;
  console.log("Request Body:", req.body);

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }
    // Generate OTP
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
    });

    otpStore[email] = otp;
    console.log(`Generated OTP for ${email}: ${otp}`);
  
    // Send OTP via email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}`,
    };
  
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending OTP:", error);
        return res
          .status(500)
          .json({ success: false, errors: "Failed to send OTP" });
      }
      console.log("OTP sent:", info.response);
      res.json({ success: true, message: "OTP sent to your email", otp: otp }); // Added the OTP in the response for testing purposes
    });
  });

//VERIFY-OTP FOR MOBILE

app.post('/verify-otp-mobile', (req, res) => {
  const { email, otp } = req.body;
  console.log("Request Body:", req.body);

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }

  // Check if OTP exists for the given email
  const storedOtp = otpStore[email];
  console.log(`Stored OTP for ${email}: ${storedOtp}`);

  if (!storedOtp) {
    return res.status(400).json({ success: false, message: 'No OTP found for this email' });
  }

  // Verify OTP
  if (storedOtp === otp) {
    // If OTP matches, delete it from the store (optional)
    delete otpStore[email];

    return res.json({ success: true, message: 'OTP verified successfully' });
  } else {
    return res.status(400).json({ success: false, message: 'Invalid OTP' });
  }
});

app.post('/get-user-id-by-email', async (req, res) => {
  const { email } = req.body;
  // Find user by email and return userId
  const user = await Users.findOne({ email: email });
  if (user) {
    return res.status(200).json({ userId: user._id });
  } else {
    return res.status(404).json({ message: 'User not found' });
  }
});

app.get('/get-user-details/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await Users.findById(userId); // Select only the needed fields

    if (user) {
      console.log(user);
      return res.status(200).json({
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          password: user.password,
      });
      
    } else {
      return res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

app.get('/get-user-address/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await Users.findById(userId).select('address'); // Select only the address field

    if (user) {
      const { address } = user; // Destructure to get the address object
      return res.status(200).json({
        street: address.street,
        barangay: address.barangay,
        municipality: address.municipality,
        province: address.province,
        region: address.region,
        zip: address.zip,
        country: address.country,
      });
    } else {
      return res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error fetching user address:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

app.post('/compare-password', async (req, res) => {
  const { userId, oldPassword } = req.body;

  try {
    // Fetch the user by ID
    const user = await Users.findById(userId);

    if (user) {
      // Directly compare plain text passwords
      if (user.password === oldPassword) {
        return res.status(200).json({ message: 'Password match' });
      } else {
        return res.status(400).json({ message: 'Old password is incorrect' });
      }
    } else {
      return res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});


app.post('/updatepassword-mobile/:id', async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.params.id;

  try {
    const user = await Users.findById(userId); // Find user by ID

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Directly update the password without hashing
    user.password = newPassword; // Save new password as plaintext
    await user.save();

    return res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Check user address endpoint
app.post('/check-user-address', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await Users.findOne({ email: email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.address) {
      return res.status(200).json({ addressExists: false, message: "No address found. Please set up your address first." });
    }

    return res.status(200).json({ addressExists: true, address: user.address });
  } catch (error) {
    console.error("Error checking user address:", error);
    return res.status(500).json({ message: "Error checking user address" });
  }
});
app.post('/updateStock', async (req, res) => {
  console.log("Received body:", req.body); // Log the entire body
  const { name, size, quantity } = req.body;
  const qty = Number(quantity); // Ensure quantity is a number

  try {
    // Find the product by name
    const product = await Product.findOne({ name });
    if (!product) {
      return res.status(404).send("Product not found");
    }

    let updateQuery;

    if (product.category === "gadgets" || product.category === "food") {
      // For gadgets and food, decrement only the main stock
      updateQuery = { $inc: { stock: -qty } };
    } else {
      // Define the field name for the selected size
      let sizeField;
      switch (size) {
        case 'S':
          sizeField = 's_stock';
          break;
        case 'M':
          sizeField = 'm_stock';
          break;
        case 'L':
          sizeField = 'l_stock';
          break;
        case 'XL':
          sizeField = 'xl_stock';
          break;
        default:
          return res.status(400).send("Invalid size selected.");
      }

      // Update both the specific size and total stock
      updateQuery = { $inc: { [sizeField]: -qty, stock: -qty } };
    }

    console.log("Update query:", updateQuery); // Log the update query

    // Perform the update
    const updatedProduct = await Product.findOneAndUpdate(
      { name },
      updateQuery,
      { new: true }
    );

    res.status(200).json({ message: "Stock updated successfully", updatedProduct });
  } catch (error) {
    res.status(500).send("Error updating stock: " + error.message);
  }
});


app.patch('/api/update-address/:userId', async (req, res) => {
  const { userId } = req.params;
  const { region, province, municipality, barangay, zip, street } = req.body;

  try {
    // Find the user by ID
    const user = await Users.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the address fields
    user.address = {
      region,
      province,
      municipality,
      barangay,
      zip,
      street,
    };

    // Save the updated user information
    await user.save();

    res.status(200).json({ message: 'Address updated successfully', address: user.address });
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({ message: 'Failed to update address', error });
  }
});

app.get('/api/products/:productId', async (req, res) => {
  const { productId } = req.params;

  try {
    // Use the 'id' field to find the product
    const product = await Product.findOne({ id: productId });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/newproducts', async (req, res) => {
  try {
    const products = await Product.find({ available: true })
      .sort({ date: -1 }) // Sort by date in descending order (latest first)
      .limit(8); // Limit to 8 items
    res.json(products); // Send the products as JSON
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.get('/product/:name', async (req, res) => {
  const { name } = req.params;
  try {
    const product = await Product.findOne({ name });
    if (!product) {
      return res.status(404).send('Product not found');
    }

    // Ensure the response includes the 'id' field
    const productResponse = {
      id: product._id.toString(), // You can use _id as 'id' if needed
      name: product.name,
      image: product.image,
      description: product.description,
      category: product.category,
      new_price: product.new_price,
      old_price: product.old_price,
      stock: product.stock,
      available: product.available,
      // Add other product fields you need
    };

    res.json(productResponse); // Return the modified response
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).send('Server error');
  }
});

app.get("/api/carts/:userId", getCartWithProductDetails); // API endpoint for fetching cart details

app.delete('/api/cart/delete/:cartItemId', async (req, res) => {
  const { cartItemId } = req.params;  // Capture cartItemId from the URL path
  const { selectedSize, userId } = req.query;  // Capture selectedSize and userId from query params

  try {
    console.log('Received CartItemId:', cartItemId);
    console.log('Selected Size:', selectedSize);
    console.log('UserId:', userId);  // Log the userId

    // Validate cartItemId format
    if (!ObjectId.isValid(cartItemId)) {
      return res.status(400).json({ message: 'Invalid cart item ID format' });
    }

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Find the cart where the cartItemId, selectedSize, and userId match
    const cart = await Cart.findOne({
      userId: userId,
      'cartItems.cartItemId': ObjectId(cartItemId),
      'cartItems.selectedSize': selectedSize,
    });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Remove the item from the cart
    const updatedCart = await Cart.updateOne(
      { _id: cart._id },
      {
        $pull: {
          cartItems: { cartItemId: ObjectId(cartItemId), selectedSize },
        },
      }
    );

    if (updatedCart.modifiedCount === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    res.status(200).json({ message: 'Cart item deleted successfully' });
  } catch (err) {
    console.error('Error deleting cart item:', err);
    res.status(500).json({ message: 'Error deleting cart item', error: err });
  }
});

app.post('/api/cart/save', async (req, res) => {
  const { userId, cartItems } = req.body;
  console.log('Received cart items:', req.body.cartItems);

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return res.status(400).json({ message: "Cart items are required" });
  }

  for (const item of cartItems) {
    if (!item.productId) {
      return res
        .status(400)
        .json({ message: "Product ID is required for all cart items" });
    }
  }

  try {
    // Find the user's cart
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // If no cart exists, create a new one
      cart = new Cart({
        userId,
        cartItems: [],
      });
    }

    // Add or update cart items
    for (const item of cartItems) {
      const existingItemIndex = cart.cartItems.findIndex(
        (i) =>
          i.productId === item.productId &&
          i.selectedSize === item.selectedSize
      );

      if (existingItemIndex !== -1) {
        // Update quantity and price if item exists
        cart.cartItems[existingItemIndex].quantity += item.quantity;
        cart.cartItems[existingItemIndex].adjustedPrice = item.adjustedPrice;
      } else {
        // Add new item
        cart.cartItems.push({
          productId: item.productId,
          selectedSize: item.selectedSize,
          adjustedPrice: item.adjustedPrice,
          quantity: item.quantity,
          cartItemId: new mongoose.Types.ObjectId(),
        });
      }
    }

    // Save the updated cart
    await cart.save();
    res.status(201).json({ message: 'Cart item saved successfully', cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to save cart item', error });
  }
});
app.post('/api/cart/removeItems', async (req, res) => {
  const { cartItemIds } = req.body;

  if (!cartItemIds || !Array.isArray(cartItemIds) || cartItemIds.length === 0) {
    return res.status(400).json({ message: "Invalid cartItemIds data." });
  }

  try {
    const objectIds = cartItemIds
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    if (objectIds.length === 0) {
      return res.status(400).json({ message: "No valid ObjectIds provided." });
    }

    // Use $pull to remove items from 'cartItems' array by 'cartItemId'
    const result = await Cart.updateMany(
      { "cartItems.cartItemId": { $in: objectIds } },
      { $pull: { cartItems: { cartItemId: { $in: objectIds } } } }
    );

    if (result.modifiedCount > 0) {
      return res.status(200).json({ message: "Items removed successfully." });
    } else {
      return res.status(404).json({ message: "No items found to remove." });
    }
  } catch (error) {
    console.error("Error removing items from cart:", error);
    return res.status(500).json({ message: "Failed to remove items from cart.", error });
  }
});

app.get("/redirect", (req, res) => {
  const deepLink = req.query.deep_link;

  if (deepLink) {
      res.redirect(deepLink);
  } else {
      res.status(400).send("Missing deep_link parameter");
  }
});

// ==================== RIDER MOBILE ============================ //

// GET endpoint to fetch user details by ID
app.get("/api/user-details/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log("Fetching user details for ID:", userId);
    
    // Find the user in the Users collection
    const user = await Users.findById(userId);
    
    if (!user) {
      console.log("User not found with ID:", userId);
      return res.status(404).json({ 
        success: false, 
        errors: "User not found" 
      });
    }
    
    // Split the name into first and last name components
    const nameParts = user.name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');
    
    console.log("User found:", user.name);
    
    // Return user details in the format expected by your app
    return res.json({
      resp: true,
      msg: "User details retrieved successfully",
      user: {
        uid: user._id,
        firstName: firstName,
        lastName: lastName,
        email: user.email,
        phone: user.phone || '',
        image: user.image || '',
        rolId: 1,
        address: {
          country: user.address.country,
          street: user.address.street,
          region: user.address.region,
          province: user.address.province,
          municipality: user.address.municipality,
          barangay: user.address.barangay,
          zip: user.address.zip
        },
        notificationToken: ''
      },
      token: req.header('xx-token') || ''
    });
    
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ 
      resp: false, 
      msg: "Server Error",
      user: {
        uid: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        image: '',
        rolId: 0,
        address: {
          country: user.address.country,
          street: user.address.street,
          region: user.address.region,
          province: user.address.province,
          municipality: user.address.municipality,
          barangay: user.address.barangay,
          zip: user.address.zip
        },
        notificationToken: ''
      },
      token: ''
    });
  }
});
// Updated API endpoint for allproducts
app.get("/allproducts-mobile", async (req, res) => {
  try {
    let products = await Product.find({available: true});
    
    // Transform MongoDB products to match the mobile app's expected format
    const transformedProducts = products.map(product => ({
      id: product.id,
      nameProduct: product.name,
      description: product.description || "",
      price: product.new_price,
      status: product.available ? 1 : 0,
      picture: product.image,
      category: product.category,
      category_id: product.category ? 1 : 0, // You might want to replace this with actual category IDs
    }));
    
    console.log("All Products Fetched");
    res.status(200).json({
      resp: true,
      msg: "Products fetched successfully",
      productsdb: transformedProducts
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      resp: false,
      msg: "Failed to fetch products",
      productsdb: []
    });
  }
});

// Admin Routes
app.use("/api/admin", adminRoutes);
app.use("/api/", adminRoutes);
app.use("/api/superadmin", superAdminRoutes);
app.use("/api/", superAdminRoutes);
app.use("/api/seller", sellerRouter);
app.use("/api", sellerRouter);
app.use("/api", userRoutes);
app.use('/api/rider', riderRoutes);
app.use("/api", riderRoutes);
app.use('/api', shopRoutes);
//app.use('/api/shops', shopRoutes);
app.use('/api/commissions', commissionRoutes);
