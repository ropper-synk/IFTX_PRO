const requireAuth = (req, res, next) => {
    console.log('Auth middleware - Session:', req.session);
    console.log('Auth middleware - User:', req.session?.user);
    
    if (req.session && req.session.user) {
      console.log('Auth middleware - User authenticated:', req.session.user.id);
      return next();
    } else {
      console.log('Auth middleware - Authentication failed');
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
  };
  
  module.exports = {
    requireAuth
  };