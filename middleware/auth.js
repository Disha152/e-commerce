const jwt = require('jsonwebtoken');
const User = require('../models/User');

// const protect = async (req, res, next) => {
//   let token = req.headers.authorization?.split(" ")[1];

//   if (!token) return res.status(401).json({ message: "Not authorized, token missing" });

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = await User.findById(decoded.id).select("-password");
//     next();
//   } catch (error) {
//     res.status(401).json({ message: "Invalid token" });
//   }
// };

// const protect = async (req, res, next) => {
//     console.log("HEADERS: ", req.headers); // LOG HEADERS
  
//     // let token = req.headers.authorization?.split(" ")[1];
//     const authHeader = req.headers['authorization'];
// console.log("AUTH HEADER:", authHeader);
// const token = authHeader && authHeader.split(' ')[1];

//     if (!token) return res.status(401).json({ message: "Not authorized, token missing" });
  
//     try {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       req.user = await User.findById(decoded.id).select("-password");
//       next();
//     } catch (error) {
//       res.status(401).json({ message: "Invalid token" });
//     }
//   };

const protect = async (req, res, next) => {
    try {
      const authHeader = req.headers['authorization']; // lowercase works better here
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "Not authorized, token missing" });
      }
  
      const token = authHeader.split(' ')[1]; // get token after "Bearer"
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }
  
      next();
    } catch (error) {
      console.error("Auth error:", error);
      res.status(401).json({ message: "Invalid token" });
    }
  };
  

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access Denied: Unauthorized Role" });
    }
    next();
  };
};

module.exports = { protect, authorizeRoles };
