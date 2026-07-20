const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  let token;

  // Check if token is in the Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extract the token (format is "Bearer <token>")
      token = req.headers.authorization.split(" ")[1];

      // Verify the token using our secret
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach the decoded user info to the request
      req.user = decoded;

      next(); // Move on to the actual route
    } catch (error) {
      return res.status(401).json({ message: "Not authorised, token invalid" });
    }
  }

  if (!token) {
    return res
      .status(401)
      .json({ message: "Not authorised, no token provided" });
  }
};

// Extra middleware to restrict access by role
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Access denied, insufficient permissions" });
    }
    next();
  };
};

module.exports = { protect, restrictTo };
