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

module.exports = authMiddleware;
