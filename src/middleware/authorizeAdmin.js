// middleware/authorizeAdmin.js

function authorizeAdmin(allowedRoles = []) {
  return (req, res, next) => {

    const user = req.user;

    // 1. Check if token decoded and contains admin type
    if (!user || user.type !== 'admin') {
      !user ? mess =  res.status(403).json({ message: `not user ${req.user.type}` }): mess = res.status(403).json({ message: `Not Admin ${req.user.type}` });
      return mess;
      // return res.status(403).json({ message: 'Access denied: Admins only' });
    }

    // 2. Check if the admin's role is in the allowed list
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ message: 'Access denied: Insufficient permissions' });
    }

    // 3. Passed all checks
    next();
  };
}

module.exports = authorizeAdmin;
