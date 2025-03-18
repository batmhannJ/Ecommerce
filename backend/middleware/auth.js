const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
  const { token } = req.headers;
  if (!token) {
    return res.json({
      success: false,
      message: "Not Authorized. Please login again.",
    });
  }

  try {
    const token_decode = jwt.verify(token, "secret_ecom");
    req.user = token_decode;
    const decoded = jwt.verify(token, "secret_ecom");
    if (decoded.role !== "admin" && decoded.role !== "seller") {
      return res
        .status(403)
        .json({ success: false, errors: ["Access denied."] });
    }
    req.admin = decoded;
    const seller_decoded = jwt.verify(token, "secret_ecom");
    req.seller = seller_decoded;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.json({
      success: false,
      message: "Invalid token. Please login again.",
    });
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "You are not logged in"
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action"
      });
    }
    
    next();
  };
};

module.exports = { authMiddleware, restrictTo };

